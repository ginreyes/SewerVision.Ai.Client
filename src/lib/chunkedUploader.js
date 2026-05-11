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
  attachOnlineDrain,
  listUploads,
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
 * Upload a File via the chunked endpoint, persisting to IDB first so an
 * offline blip becomes resumable. Returns the server's Upload row on
 * success; throws on a non-recoverable failure (the IDB row is preserved
 * for inspection).
 */
export async function uploadFileChunked(file, meta, { onProgress, onStatus } = {}) {
  if (!file || typeof file.size !== 'number') {
    throw new Error('uploadFileChunked: file is required');
  }

  onStatus?.('starting');
  const chunks = sliceFileToChunks(file);

  const startRes = await uploadsApi.startChunkedUpload({
    originalName: file.name,
    mimeType: file.type || 'application/octet-stream',
    sizeBytes: file.size,
    totalChunks: chunks.length,
    projectId: meta?.projectId,
    device: meta?.device,
    location: meta?.location,
  });

  const uploadId = startRes.uploadId;
  await queueUpload(
    {
      id: uploadId,
      projectId: meta?.projectId ?? null,
      deviceId: meta?.device ?? null,
      mime: file.type,
      sizeBytes: file.size,
      totalChunks: chunks.length,
    },
    chunks
  );
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
 * Bootstrap-time wiring: registers a window 'online' handler that drains any
 * leftover queued uploads from a previous session. Idempotent — repeated
 * calls return new unsubscribe fns but only one drain runs per 'online'
 * event because IDB transactions serialize. Safe to call from a top-level
 * provider's useEffect.
 */
export function wireGlobalOnlineDrain() {
  const adapter = async (uploadId, index, blob) => uploadsApi.putChunk(uploadId, index, blob);
  return attachOnlineDrain({ putChunk: adapter });
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
