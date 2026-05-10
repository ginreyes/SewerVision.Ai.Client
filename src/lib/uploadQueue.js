// uploadQueue.js — IndexedDB schema + helpers for the operator-only
// offline upload queue. C3 Day 3 (May 11, 2026): queueing semantics +
// drain-on-online wired on top of the Day 2 schema.
//
// SW caveat: the service worker (public/sw-uploads.js) cannot import this
// module — service workers run in a separate JS context. The SW duplicates
// the minimal IDB write path against the same DB_NAME / DB_VERSION /
// store names below. Keep these constants in lockstep with sw-uploads.js.
//
// Native indexedDB API only — no `idb` dep yet. Day 4-5 may swap to `idb`
// if the boilerplate gets noisy, but for now this is small enough that the
// extra dep isn't worth it.
//
// Stores
// ──────
// uploads:
//   keyPath: 'id'
//   shape:   { id, projectId, deviceId, mime, sizeBytes, totalChunks,
//              createdAt, status, attempts, lastError }
//   indexes: createdAt (sort), status (filter)
//
// chunks:
//   keyPath: 'id'   (composite "<uploadId>:<chunkIndex>")
//   shape:   { id, uploadId, index, blob, etag, status }
//   indexes: uploadId (fan-out lookup)

const DB_NAME = 'uploadQueue';
const DB_VERSION = 1;
const STORE_UPLOADS = 'uploads';
const STORE_CHUNKS = 'chunks';

let _dbPromise = null;

/**
 * Open (and lazily create) the upload-queue database. Idempotent — repeated
 * calls return the same Promise so callers can `await openUploadDB()` from
 * multiple sites without serializing.
 */
export function openUploadDB() {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB unavailable in this environment'));
  }
  if (_dbPromise) return _dbPromise;
  _dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_UPLOADS)) {
        const uploads = db.createObjectStore(STORE_UPLOADS, { keyPath: 'id' });
        uploads.createIndex('by_createdAt', 'createdAt', { unique: false });
        uploads.createIndex('by_status', 'status', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_CHUNKS)) {
        const chunks = db.createObjectStore(STORE_CHUNKS, { keyPath: 'id' });
        chunks.createIndex('by_uploadId', 'uploadId', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error('uploadQueue DB upgrade blocked by another tab'));
  });
  return _dbPromise;
}

function tx(db, storeName, mode = 'readonly') {
  const t = db.transaction(storeName, mode);
  return { store: t.objectStore(storeName), done: txDone(t) };
}

function txDone(t) {
  return new Promise((resolve, reject) => {
    t.oncomplete = () => resolve();
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
}

function reqAsPromise(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ─── uploads store ──────────────────────────────────────────────────────

export async function addUpload(meta) {
  const db = await openUploadDB();
  const { store, done } = tx(db, STORE_UPLOADS, 'readwrite');
  await reqAsPromise(store.put(meta));
  await done;
  return meta;
}

export async function getUpload(id) {
  const db = await openUploadDB();
  const { store } = tx(db, STORE_UPLOADS, 'readonly');
  return reqAsPromise(store.get(id));
}

export async function listUploads({ status } = {}) {
  const db = await openUploadDB();
  const { store } = tx(db, STORE_UPLOADS, 'readonly');
  if (status) {
    const idx = store.index('by_status');
    return reqAsPromise(idx.getAll(IDBKeyRange.only(status)));
  }
  return reqAsPromise(store.getAll());
}

export async function deleteUpload(id) {
  const db = await openUploadDB();
  const { store, done } = tx(db, STORE_UPLOADS, 'readwrite');
  await reqAsPromise(store.delete(id));
  await done;
}

// ─── chunks store ───────────────────────────────────────────────────────

export function chunkKey(uploadId, index) {
  return `${uploadId}:${index}`;
}

export async function addChunk(chunk) {
  const db = await openUploadDB();
  const { store, done } = tx(db, STORE_CHUNKS, 'readwrite');
  await reqAsPromise(store.put(chunk));
  await done;
  return chunk;
}

export async function getChunk(uploadId, index) {
  const db = await openUploadDB();
  const { store } = tx(db, STORE_CHUNKS, 'readonly');
  return reqAsPromise(store.get(chunkKey(uploadId, index)));
}

export async function listChunks(uploadId) {
  const db = await openUploadDB();
  const { store } = tx(db, STORE_CHUNKS, 'readonly');
  const idx = store.index('by_uploadId');
  return reqAsPromise(idx.getAll(IDBKeyRange.only(uploadId)));
}

export async function deleteChunksForUpload(uploadId) {
  const db = await openUploadDB();
  const { store, done } = tx(db, STORE_CHUNKS, 'readwrite');
  const idx = store.index('by_uploadId');
  const keys = await reqAsPromise(idx.getAllKeys(IDBKeyRange.only(uploadId)));
  for (const k of keys) store.delete(k);
  await done;
}

// ─── Day 3: queueing semantics ──────────────────────────────────────────
//
// State machine (uploads.status):
//   queued    → at least one chunk waiting to be flushed
//   draining  → drain() is currently flushing this upload
//   complete  → every chunk reached the server; row + chunks deleted
//   failed    → drain() hit a non-retryable error; row kept for inspection
//
// chunks.status:
//   pending   → blob is in IDB, not yet PUT
//   uploaded  → server accepted (etag stashed); blob can be evicted
//
// Retry policy is intentionally simple: drain() walks pending chunks in
// index order and PUTs them one at a time. A non-2xx flips uploads.status
// to 'failed' and stores the error; the caller (or the next 'online'
// event) is responsible for triggering another drain.

const STATUS_QUEUED = 'queued';
const STATUS_DRAINING = 'draining';
const STATUS_COMPLETE = 'complete';
const STATUS_FAILED = 'failed';
const CHUNK_PENDING = 'pending';
const CHUNK_UPLOADED = 'uploaded';

/**
 * Persist a new upload + its chunk blobs to IDB. Idempotent on `meta.id` —
 * a repeat call overwrites the upload row and re-puts the chunks. Returns
 * the persisted meta with status set to 'queued'.
 */
export async function queueUpload(meta, chunkBlobs) {
  if (!meta || !meta.id) throw new Error('queueUpload: meta.id is required');
  if (!Array.isArray(chunkBlobs)) throw new Error('queueUpload: chunkBlobs must be an array');
  const row = {
    ...meta,
    status: STATUS_QUEUED,
    attempts: meta.attempts ?? 0,
    lastError: meta.lastError ?? null,
    totalChunks: chunkBlobs.length,
    createdAt: meta.createdAt ?? Date.now(),
  };
  await addUpload(row);
  for (let i = 0; i < chunkBlobs.length; i++) {
    await addChunk({
      id: chunkKey(meta.id, i),
      uploadId: meta.id,
      index: i,
      blob: chunkBlobs[i],
      etag: null,
      status: CHUNK_PENDING,
    });
  }
  return row;
}

/**
 * Mark chunk N of an upload as uploaded and stash the server-returned ETag.
 * If every chunk for the upload is now uploaded, the upload row + chunk
 * rows are deleted (status 'complete' is implied by absence).
 */
export async function markChunkUploaded(uploadId, index, etag) {
  const existing = await getChunk(uploadId, index);
  if (!existing) return null;
  await addChunk({ ...existing, etag: etag ?? null, status: CHUNK_UPLOADED });
  const remaining = await listChunks(uploadId);
  const stillPending = remaining.some((c) => c.status !== CHUNK_UPLOADED);
  if (!stillPending) {
    await deleteChunksForUpload(uploadId);
    await deleteUpload(uploadId);
    return { uploadId, status: STATUS_COMPLETE };
  }
  return { uploadId, status: STATUS_DRAINING };
}

/**
 * Mark the upload as failed. Row is preserved (with the error) so the UI
 * can surface it; chunks are kept too so a retry path can re-drain.
 */
export async function failUpload(uploadId, err) {
  const upload = await getUpload(uploadId);
  if (!upload) return null;
  const updated = {
    ...upload,
    status: STATUS_FAILED,
    attempts: (upload.attempts ?? 0) + 1,
    lastError: err?.message || String(err),
  };
  await addUpload(updated);
  return updated;
}

/**
 * Best-effort flush. Walks every queued upload, PUTs each pending chunk
 * one at a time, and either marks it uploaded (2xx) or fails the upload
 * (non-2xx / network error). Safe to call from an 'online' event listener
 * — re-entrancy is guarded by status='draining'.
 *
 * @param {object} opts
 * @param {(uploadId: string, index: number, blob: Blob) => Promise<Response>} opts.putChunk
 *   Required network adapter. Caller owns the URL/auth shape.
 * @returns {Promise<{drained: number, failed: number}>}
 */
export async function drain({ putChunk } = {}) {
  if (typeof putChunk !== 'function') {
    throw new Error('drain: putChunk(uploadId, index, blob) is required');
  }
  const queued = await listUploads({ status: STATUS_QUEUED });
  let drained = 0;
  let failed = 0;
  for (const upload of queued) {
    await addUpload({ ...upload, status: STATUS_DRAINING });
    const chunks = (await listChunks(upload.id))
      .filter((c) => c.status !== CHUNK_UPLOADED)
      .sort((a, b) => a.index - b.index);
    let uploadFailed = false;
    for (const chunk of chunks) {
      try {
        const res = await putChunk(upload.id, chunk.index, chunk.blob);
        if (!res || !res.ok) {
          await failUpload(upload.id, new Error(`PUT chunk ${chunk.index} -> HTTP ${res?.status ?? 'no-response'}`));
          uploadFailed = true;
          failed++;
          break;
        }
        const etag = res.headers?.get?.('ETag') ?? null;
        await markChunkUploaded(upload.id, chunk.index, etag);
      } catch (err) {
        await failUpload(upload.id, err);
        uploadFailed = true;
        failed++;
        break;
      }
    }
    if (!uploadFailed) {
      // markChunkUploaded already deleted the row when the last chunk
      // landed. If the upload had zero pending chunks to begin with, the
      // 'draining' row is now stale — clean it up.
      const stillThere = await getUpload(upload.id);
      if (stillThere) {
        await deleteChunksForUpload(upload.id);
        await deleteUpload(upload.id);
      }
      drained++;
    }
  }
  return { drained, failed };
}

/**
 * Wire window 'online' to drain(). Returns an unsubscribe fn. Caller
 * provides the same putChunk adapter drain() needs. No-op outside the
 * browser.
 */
export function attachOnlineDrain({ putChunk } = {}) {
  if (typeof window === 'undefined') return () => {};
  const handler = () => {
    if (navigator.onLine === false) return;
    drain({ putChunk }).catch(() => {
      // swallow — failures are recorded per-upload via failUpload
    });
  };
  window.addEventListener('online', handler);
  return () => window.removeEventListener('online', handler);
}
