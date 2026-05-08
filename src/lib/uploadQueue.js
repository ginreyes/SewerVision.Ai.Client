// uploadQueue.js — IndexedDB schema + thin helpers for the operator-only
// offline upload queue. C3 Day 2 (May 8, 2026): schema + skeleton API only.
// Day 3 wires the queueing semantics on top (enqueue from the SW fetch
// handler, drain on online, retry with backoff).
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

// Day 3 will add: enqueueUpload(meta, chunkBlobs[]), markChunkUploaded,
// failUpload, drain. Today is schema + read/write skeleton only.
