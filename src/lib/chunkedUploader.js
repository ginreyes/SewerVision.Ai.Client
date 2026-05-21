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
  listChunks,
  markChunkUploaded,
  isLocalUploadId,
  newLocalUploadId,
  migrateUploadId,
  requeueFailedUploads,
  failUpload,
  getUpload,
  addUpload,
  deleteUpload,
  deleteChunksForUpload,
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
 * Compute SHA-256 of a Blob as lowercase hex. Returns null when WebCrypto
 * is unavailable (very old browsers, non-secure contexts) — putChunk then
 * sends the chunk without a Content-SHA256 header and the server skips
 * verification, matching pre-Day-6 behaviour.
 */
async function sha256Hex(blob) {
  if (typeof crypto === 'undefined' || !crypto.subtle) return null;
  const buf = await blob.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', buf);
  const bytes = new Uint8Array(digest);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

/**
 * Day 7 — PUT one chunk with a single auto-retry on a 422 (chunk hash mismatch
 * detected by the server). A 422 means bytes were corrupted in transit and the
 * disk write was rejected, so the safe path is to re-compute the hash and PUT
 * again before failing the upload. We retry exactly once: corrupting twice in
 * a row is a signal that the source blob itself is bad (a faulty read on the
 * input File), and looping forever would just stall the queue. The optional
 * onHashMismatch callback lets the UI surface "chunk N corrupted in transit"
 * without us having to re-plumb the error path.
 */
async function putChunkOnce(uploadId, index, blob, { onHashMismatch } = {}) {
  let sha256 = await sha256Hex(blob);
  let res = await uploadsApi.putChunk(uploadId, index, blob, { sha256 });
  if (res?.status === 422) {
    onHashMismatch?.({ uploadId, index });
    sha256 = await sha256Hex(blob); // re-read the blob bytes from disk
    res = await uploadsApi.putChunk(uploadId, index, blob, { sha256 });
  }
  return res;
}

/**
 * Adapter that drain() will call once per pending chunk. We return the raw
 * Response so drain() can read .ok and headers.get('ETag') exactly like the
 * Fetch spec — uploadsApi.putChunk already returns one.
 */
function makePutChunkAdapter({ onProgress, totalBytes, getProgressBase, onHashMismatch }) {
  return async function putChunk(uploadId, index, blob) {
    const res = await putChunkOnce(uploadId, index, blob, { onHashMismatch });
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
export async function uploadFileChunked(file, meta, { onProgress, onStatus, onHashMismatch } = {}) {
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
    putChunk: makePutChunkAdapter({ onProgress, totalBytes: file.size, getProgressBase, onHashMismatch }),
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
async function drainAll({ onHashMismatch } = {}) {
  const idMap = await resolveLocalStarts();
  const adapter = (uploadId, index, blob) => putChunkOnce(uploadId, index, blob, { onHashMismatch });
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
 * Bootstrap-time wiring: registers a window 'online' handler that reconciles
 * with the server FIRST and then drains any leftover queued uploads. The
 * order matters — without reconcile-then-drain, drain re-PUTs bytes the
 * server already has (the very thing /status was added to prevent). Safe to
 * call from a top-level provider's useEffect.
 */
export function wireGlobalOnlineDrain() {
  if (typeof window === 'undefined') return () => {};
  const handler = async () => {
    if (navigator.onLine === false) return;
    try {
      await reconcileWithServer();
    } catch {
      // network/auth — drain may still pick up something, fall through
    }
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
export async function resumeFailedUploads({ onHashMismatch } = {}) {
  const requeued = await requeueFailedUploads();
  const result = await drainAll({ onHashMismatch });
  return { requeued, ...result };
}

/**
 * Day 6/7 — reconcile every locally-queued upload with what the server already
 * has. On a page reload mid-upload, the IDB chunks store still says "pending"
 * for chunks the server has actually persisted; without reconciliation
 * drainAll() would re-PUT those bytes.
 *
 * For each non-local upload row:
 *   1. GET /api/uploads/:id/status → { received: number[], complete }
 *   2. For every chunk index in `received`, mark the IDB chunk row as
 *      uploaded.
 *   3. If the server reports `complete`, also POST /complete so the Upload
 *      row lands in Mongo — otherwise the row gets deleted from IDB on the
 *      final markChunkUploaded and the next drainAll() has nothing to /complete
 *      against (silent stuck-on-disk staging).
 *
 * The optional `onProgress` callback fires with { uploadId, total, scanned,
 * reconciledChunks } so UploadSummaryCard can surface a "Syncing with
 * server…" badge on mount instead of looking frozen during long reconciles.
 *
 * Returns { reconciled, skipped, completed }. Network failures are swallowed
 * — the next online tick retries.
 */
export async function reconcileWithServer({ onProgress } = {}) {
  const all = await listUploads();
  let reconciled = 0;
  let skipped = 0;
  let completed = 0;
  let scanned = 0;
  for (const upload of all) {
    scanned++;
    onProgress?.({ uploadId: upload.id, total: all.length, scanned, reconciledChunks: 0 });
    if (isLocalUploadId(upload.id)) {
      skipped++;
      continue; // /status requires the server-issued id
    }
    try {
      const status = await uploadsApi.getChunkedUploadStatus(upload.id);
      const received = Array.isArray(status?.received) ? status.received : [];
      if (received.length === 0) {
        skipped++;
        continue;
      }
      const idbChunks = await listChunks(upload.id);
      const byIndex = new Map(idbChunks.map((c) => [c.index, c]));
      let markedNow = 0;
      for (const i of received) {
        const existing = byIndex.get(i);
        if (existing && existing.status !== 'uploaded') {
          await markChunkUploaded(upload.id, i, null);
          markedNow++;
          onProgress?.({ uploadId: upload.id, total: all.length, scanned, reconciledChunks: markedNow });
        }
      }
      reconciled++;
      // If the server already has every chunk, finalize the Upload row now —
      // markChunkUploaded() deleted the IDB row when the last chunk landed,
      // so a later drainAll() would never call /complete for this id.
      if (status?.complete) {
        try {
          await uploadsApi.completeChunkedUpload(upload.id);
          completed++;
        } catch {
          // /complete may race a concurrent caller or 409 if something is
          // actually off — next online tick will retry via drainAll if the
          // server still has the staging dir.
        }
      }
    } catch {
      // network / 401 — leave the upload to the next online tick
      skipped++;
    }
  }
  return { reconciled, skipped, completed };
}

/**
 * Day 8 — list every IDB-queued upload as a row shaped like a server-side
 * Upload, so UploadHistoryTable can render local + server rows in a single
 * list. Locally-staged uploads carry an `isLocal: true` flag so the table can
 * show a "local" badge and skip server-only columns. Status values mirror the
 * IDB state machine ('queued' | 'draining' | 'failed').
 */
export async function listIdbQueueRows() {
  const all = await listUploads();
  return all.map((u) => ({
    _id: u.id,
    isLocal: true,
    originalName: u.originalName || 'upload.bin',
    filename: u.originalName || 'upload.bin',
    type: classifyMimeForUi(u.mimeType || u.mime),
    sizeBytes: u.sizeBytes || 0,
    status: u.status,
    location: u.location || null,
    uploadedAt: u.createdAt ? new Date(u.createdAt).toISOString() : null,
    lastError: u.lastError || null,
    totalChunks: u.totalChunks || 0,
  }));
}

function classifyMimeForUi(mime) {
  if (!mime) return 'data';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('image/')) return 'image';
  if (mime === 'application/pdf' || mime.startsWith('text/')) return 'document';
  if (mime.includes('zip') || mime.includes('tar') || mime.includes('compressed')) return 'archive';
  return 'data';
}

/**
 * Day 8 — per-row Resume action for UploadHistoryTable. Targets a single
 * IDB upload by id: re-runs drain just for it (drain itself walks every
 * queued/failed row, so we reset the row to 'queued' first if it had
 * previously failed). Returns the same shape as drainAll's per-call result
 * so the caller can show "drained N chunks / failed M".
 */
export async function resumeOneUpload(uploadId, { onHashMismatch } = {}) {
  const row = await getUpload(uploadId);
  if (!row) return { requeued: 0, drained: 0, failed: 0 };
  // drain() works off status; flip failed→queued so it picks the row back up.
  // We don't synthesise this through requeueFailedUploads because that one
  // is bulk-only and would also pick up rows the user didn't ask to resume.
  if (row.status === 'failed') {
    await addUpload({ ...row, status: 'queued', lastError: null });
  }
  const adapter = (id, index, blob) => putChunkOnce(id, index, blob, { onHashMismatch });
  const result = await drain({ putChunk: adapter });
  // Best-effort /complete in case this was an offline-start upload whose id
  // just migrated; mirrors drainAll's behaviour but scoped to one row.
  try {
    await uploadsApi.completeChunkedUpload(uploadId);
  } catch {
    // see drainAll — non-fatal
  }
  return { requeued: row.status === 'queued' ? 1 : 0, ...result };
}

/**
 * Day 8 — per-row Discard action. Removes the IDB row plus every staged
 * chunk blob keyed to it. Best-effort POST /api/uploads/:id/abort cleans
 * server-side staging if the row had migrated to a real uploadId. The
 * abort failure is non-fatal: the staging dir gc job sweeps it anyway.
 */
export async function discardOneUpload(uploadId) {
  if (!isLocalUploadId(uploadId)) {
    try {
      await uploadsApi.abortChunkedUpload(uploadId);
    } catch {
      // server may have already gc'd or never seen the id — non-fatal
    }
  }
  await deleteChunksForUpload(uploadId);
  await deleteUpload(uploadId);
  return { uploadId, discarded: true };
}

/**
 * Day 8 — fetch the per-row error details for the View-error popover.
 * Pulls from IDB rather than the on-screen snapshot so the message is
 * fresh even if the row hasn't been re-rendered since the last failure.
 */
export async function getUploadError(uploadId) {
  const row = await getUpload(uploadId);
  if (!row) return null;
  return {
    uploadId,
    lastError: row.lastError || null,
    // Best-effort: failUpload doesn't persist a per-chunk index today, so we
    // surface what's actually in the row (status + attempts) and let the UI
    // copy show the operator the raw lastError string.
    attempts: row.attempts ?? 0,
    status: row.status,
    originalName: row.originalName || null,
  };
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
