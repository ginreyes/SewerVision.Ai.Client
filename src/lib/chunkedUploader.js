// chunkedUploader.js — page-side glue between uploadsApi (network) and
// uploadQueue (IDB). C3 Day 4 (May 12, 2026).
//
// Responsibilities:
//   1. Slice a File into fixed-size chunks.
//   2. Call /api/uploads/start to get a server-issued uploadId.
//   3. Persist the upload + chunks to IDB via queueUpload(meta, blobs) BEFORE
//      issuing the first PUT — so a mid-upload tab-close or offline blip can
//      be resumed by drain() on next load / 'online' event.
//   4. Walk chunks via drain({ putChunk }) — drain() owns the per-chunk PUT
//      loop, status transitions, and failure capture.
//   5. On all-chunks-uploaded, POST /complete to stitch + create the Upload
//      row; emit a final status event to the caller's listener.
//
// Public API:
//   uploadFileChunked(file, meta, { onProgress, onStatus }) -> Promise<row>
//   wireGlobalOnlineDrain() -> unsubscribe fn (call once at app bootstrap)
//
// The 'onProgress' callback fires per-chunk with { index, total, bytesDone,
// bytesTotal }. 'onStatus' fires on state transitions: 'starting',
// 'queued', 'draining', 'complete', 'failed'.

import { uploadsApi } from '@/data/uploadsApi';
import {
  queueUpload,
  drain,
  listUploads,
  isLocalUploadId,
  newLocalUploadId,
  migrateUploadId,
  requeueFailedUploads,
  failUpload,
} from './uploadQueue';

// Chunk size matches the backend MAX_CHUNK_BYTES ceiling minus a small margin
// for HTTP framing overhead. Keep this in lockstep with the backend limit in
// concertine_back_end/src/controllers/uploadChunked.controller.ts.
const CHUNK_SIZE_BYTES = 4 * 1024 * 1024; // 4 MiB

function sliceFileToChunks(file, chunkSize = CHUNK_SIZE_BYTES) {
  const chunks = [];
  for (let offset = 0; offset < file.size; offset += chunkSize) {
    chunks.push(file.slice(offset, Math.min(offset + chunkSize, file.size)));
  }
  return chunks;
}

// Network-class errors look like TypeError("Failed to fetch") or
// AbortError. Server-side 4xx/5xx come back as Error with a message
// from the response body, and we want those to propagate.
function isNetworkError(err) {
  if (!err) return false;
  const msg = String(err.message || err).toLowerCase();
  if (err.name === 'TypeError') return true;
  if (err.name === 'AbortError') return true;
  return (
    msg.includes('failed to fetch') ||
    msg.includes('networkerror') ||
    msg.includes('network request failed') ||
    msg.includes('load failed')
  );
}

/**
 * Adapter that drain() will call once per pending chunk. We return the raw
 * Response so drain() can read .ok and headers.get('ETag') exactly like the
 * Fetch spec — uploadsApi.putChunk already returns one.
 */
function makePutChunkAdapter({ onProgress, totalBytes, getProgressBase }) {
  return async function putChunk(uploadId, index, blob) {
    const res = await uploadsApi.putChunk(uploadId, index, blob);
    if (res?.ok && typeof onProgress === 'function') {
      const bytesDone = getProgressBase() + blob.size;
      getProgressBase(blob.size); // commit
      onProgress({ index, total: undefined, bytesDone, bytesTotal: totalBytes });
    }
    return res;
  };
}

/**
 * Stash an upload locally with a synthetic id when /start can't be
 * reached. drain() (via resolveLocalStarts) re-issues /start on
 * reconnect, migrates the id, and continues the chunk PUTs.
 */
async function queueUploadOffline(file, meta, chunks) {
  const localId = newLocalUploadId();
  await queueUpload(
    {
      id: localId,
      projectId: meta?.projectId ?? null,
      deviceId: meta?.device ?? null,
      mime: file.type,
      sizeBytes: file.size,
      totalChunks: chunks.length,
      originalName: file.name,
      mimeType: file.type || 'application/octet-stream',
      location: meta?.location ?? null,
      localStart: true,
    },
    chunks
  );
  return localId;
}

/**
 * Upload a File via the chunked endpoint, persisting to IDB first so an
 * offline blip becomes resumable. Returns the server's Upload row on
 * success; null when the caller was offline and the upload is staged
 * locally for drain-on-reconnect; throws on a non-recoverable failure
 * (the IDB row is preserved for inspection).
 */
export async function uploadFileChunked(file, meta, { onProgress, onStatus } = {}) {
  if (!file || typeof file.size !== 'number') {
    throw new Error('uploadFileChunked: file is required');
  }

  onStatus?.('starting');
  const chunks = sliceFileToChunks(file);

  // Offline-start fallback: if navigator is offline OR /start throws a
  // network error, stage the upload under a client-issued local id. A
  // later drain() will swap in the real server id and continue.
  const offlineNow =
    typeof navigator !== 'undefined' && navigator.onLine === false;

  let uploadId;
  let deferredStart = false;

  if (offlineNow) {
    uploadId = await queueUploadOffline(file, meta, chunks);
    deferredStart = true;
  } else {
    try {
      const startRes = await uploadsApi.startChunkedUpload({
        originalName: file.name,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
        totalChunks: chunks.length,
        projectId: meta?.projectId,
        device: meta?.device,
        location: meta?.location,
      });
      uploadId = startRes.uploadId;
      await queueUpload(
        {
          id: uploadId,
          projectId: meta?.projectId ?? null,
          deviceId: meta?.device ?? null,
          mime: file.type,
          sizeBytes: file.size,
          totalChunks: chunks.length,
          originalName: file.name,
          mimeType: file.type || 'application/octet-stream',
          location: meta?.location ?? null,
          localStart: false,
        },
        chunks
      );
    } catch (err) {
      // Network-class failures (TypeError from fetch, no response) fall
      // back to local-start. Anything else (server 4xx/5xx) is a real
      // error and should propagate so the caller can show it.
      if (isNetworkError(err)) {
        uploadId = await queueUploadOffline(file, meta, chunks);
        deferredStart = true;
      } else {
        throw err;
      }
    }
  }

  if (deferredStart) {
    onStatus?.('queued');
    // Nothing more we can do until connectivity returns. drain() picks it up.
    return null;
  }

  onStatus?.('queued');

  // Progress accounting — drain() doesn't know per-chunk byte sizes; the
  // closure here tracks bytes drained as adapter calls succeed.
  let progressCommitted = 0;
  const getProgressBase = (commit) => {
    if (typeof commit === 'number') {
      progressCommitted += commit;
      return progressCommitted;
    }
    return progressCommitted;
  };

  onStatus?.('draining');
  const result = await drain({
    putChunk: makePutChunkAdapter({ onProgress, totalBytes: file.size, getProgressBase }),
  });

  if (result.failed > 0) {
    onStatus?.('failed');
    throw new Error(`Upload ${uploadId} failed after ${result.failed} chunk failure(s) — see IDB row for lastError`);
  }

  const row = await uploadsApi.completeChunkedUpload(uploadId);
  onStatus?.('complete');
  return row;
}

/**
 * Walk every locally-staged upload (status='queued', localStart=true), call
 * /start to claim a real server id, and migrate the IDB rows to that id.
 * Failures are recorded via failUpload so the UI can surface them.
 *
 * Returns a map of oldId → newId for uploads that successfully resolved,
 * so callers can post-drain /complete the right ids.
 */
async function resolveLocalStarts() {
  const queued = await listUploads({ status: 'queued' });
  const localOnly = queued.filter((u) => u.localStart && isLocalUploadId(u.id));
  const idMap = new Map();
  for (const upload of localOnly) {
    try {
      const startRes = await uploadsApi.startChunkedUpload({
        originalName: upload.originalName || 'upload.bin',
        mimeType: upload.mimeType || upload.mime || 'application/octet-stream',
        sizeBytes: upload.sizeBytes,
        totalChunks: upload.totalChunks,
        projectId: upload.projectId,
        device: upload.deviceId,
        location: upload.location,
      });
      const newId = startRes.uploadId;
      await migrateUploadId(upload.id, newId);
      idMap.set(upload.id, newId);
    } catch (err) {
      // Network failure — leave row in 'queued' state so a future online
      // event retries. Server failure — record so the UI surfaces it.
      if (!isNetworkError(err)) {
        await failUpload(upload.id, err);
      }
    }
  }
  return idMap;
}

/**
 * Drain every queued IDB upload: first resolve any local-start rows to
 * real server ids, then PUT each chunk, then /complete the server side
 * for any rows that originated from an offline start. Used by the
 * online-event handler and the manual Resume action.
 */
async function drainAll() {
  const idMap = await resolveLocalStarts();
  const adapter = async (uploadId, index, blob) => uploadsApi.putChunk(uploadId, index, blob);
  const result = await drain({ putChunk: adapter });

  // Anything that just migrated from local-start needs a /complete call
  // — uploadFileChunked normally does that inline, but the offline path
  // returned before reaching it. We don't know which migrated uploads
  // actually finished all chunks here (drain deletes the IDB row on
  // success), so we call /complete for every migrated newId and tolerate
  // 4xx/5xx for ones that didn't fully drain.
  for (const newId of idMap.values()) {
    try {
      await uploadsApi.completeChunkedUpload(newId);
    } catch {
      // Either the upload didn't fully drain (chunks still pending on
      // server), or /complete is racing the next drain. Either way the
      // IDB row state is authoritative — no action.
    }
  }
  return result;
}

/**
 * Bootstrap-time wiring: registers a window 'online' handler that drains any
 * leftover queued uploads from a previous session. Idempotent — repeated
 * calls return new unsubscribe fns but only one drain runs per 'online'
 * event because IDB transactions serialize. Safe to call from a top-level
 * provider's useEffect.
 */
export function wireGlobalOnlineDrain() {
  if (typeof window === 'undefined') return () => {};
  const handler = () => {
    if (navigator.onLine === false) return;
    drainAll().catch(() => {
      // swallow — failures are recorded per-upload via failUpload
    });
  };
  window.addEventListener('online', handler);
  return () => window.removeEventListener('online', handler);
}

/**
 * Manual Resume path used by UploadSummaryCard. Resets failed rows back
 * to 'queued', then runs the full drainAll cycle (local-start resolution
 * + chunk PUTs + /complete). Returns { requeued, drained, failed }.
 */
export async function resumeFailedUploads() {
  const requeued = await requeueFailedUploads();
  const result = await drainAll();
  return { requeued, ...result };
}

/**
 * Read-only snapshot of the current IDB queue state. Used by UI badges to
 * show "N uploads queued / draining / failed" without touching IDB
 * internals.
 */
export async function getQueueSnapshot() {
  const all = await listUploads();
  let queued = 0;
  let draining = 0;
  let failed = 0;
  for (const u of all) {
    if (u.status === 'failed') failed++;
    else if (u.status === 'draining') draining++;
    else if (u.status === 'queued') queued++;
  }
  return { queued, draining, failed, total: all.length };
}
