// sw-uploads.js — Operator-only upload-queue service worker.
//
// Day 1 (May 7, 2026): registration skeleton only.
// Day 2 (May 8, 2026): passthrough fetch handler that intercepts the
// chunked-upload endpoints and forwards every request to the network
// unchanged with `[sw-uploads] passthrough ...` console logs so a real
// device can verify interception works before queueing was wired.
// Day 3 (May 11, 2026): offline branch. When `navigator.onLine === false`,
// chunk PUTs are absorbed into IDB (uploadQueue DB v1, same schema as
// src/lib/uploadQueue.js) and a synthetic `202 Accepted` with
// `X-Queued: true` is returned so the page-level uploader treats the
// chunk as accepted. The page-side drain() (in uploadQueue.js) replays
// queued chunks against the network when 'online' fires.
//
// Scope: registered with `scope: '/api/uploads/'` so the SW only sees
// upload-related fetches, NOT the full app.
//
// IDB schema MUST stay in lockstep with src/lib/uploadQueue.js — both
// open uploadQueue v1 with the same store names and indexes.

const SW_VERSION = 'sw-uploads-v0.3.0-day3';

const DB_NAME = 'uploadQueue';
const DB_VERSION = 1;
const STORE_UPLOADS = 'uploads';
const STORE_CHUNKS = 'chunks';

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Surface the version on demand so the provider can verify the right
// build is registered without requiring a postMessage round-trip into
// SW internals.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0]?.postMessage({ version: SW_VERSION });
  }
});

// ─── Minimal IDB write path (mirror of src/lib/uploadQueue.js) ──────────

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    // Schema creation is owned by the page-side module; if the DB doesn't
    // exist yet we still create the stores so the SW can write before the
    // page ever touches IDB.
    req.onupgradeneeded = () => {
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
  });
}

function putRecord(db, storeName, record) {
  return new Promise((resolve, reject) => {
    const t = db.transaction(storeName, 'readwrite');
    t.objectStore(storeName).put(record);
    t.oncomplete = () => resolve();
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
}

function getRecord(db, storeName, key) {
  return new Promise((resolve, reject) => {
    const t = db.transaction(storeName, 'readonly');
    const req = t.objectStore(storeName).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function persistChunk(uploadId, index, blob) {
  const db = await openDB();
  const id = `${uploadId}:${index}`;
  // Ensure an uploads row exists so drain() can find this chunk.
  const existing = await getRecord(db, STORE_UPLOADS, uploadId);
  if (!existing) {
    await putRecord(db, STORE_UPLOADS, {
      id: uploadId,
      createdAt: Date.now(),
      status: 'queued',
      attempts: 0,
      lastError: null,
      totalChunks: 0, // unknown from SW context; page-side enqueue would set this
    });
  } else if (existing.status !== 'queued') {
    // Re-queue — page may have marked it draining/failed before we went offline.
    await putRecord(db, STORE_UPLOADS, { ...existing, status: 'queued' });
  }
  await putRecord(db, STORE_CHUNKS, {
    id,
    uploadId,
    index,
    blob,
    etag: null,
    status: 'pending',
  });
}

function syntheticQueuedResponse() {
  return new Response(JSON.stringify({ queued: true, version: SW_VERSION }), {
    status: 202,
    statusText: 'Accepted (queued offline)',
    headers: {
      'Content-Type': 'application/json',
      'X-Queued': 'true',
      'X-SW-Version': SW_VERSION,
    },
  });
}

// ─── Fetch handler ──────────────────────────────────────────────────────

// Match POST /api/uploads/start
const START_RE = /\/api\/uploads\/start\/?$/;
// Match PUT /api/uploads/:id/chunk/:n
const CHUNK_RE = /\/api\/uploads\/([^/]+)\/chunk\/(\d+)\/?$/;

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Quick scope guard — the registration scope already constrains us, but
  // double-check so we don't accidentally intercept a sibling path that
  // shares the prefix.
  let url;
  try {
    url = new URL(req.url);
  } catch {
    return; // not a parseable URL — let the browser handle it
  }
  if (!url.pathname.startsWith('/api/uploads/')) return;

  // POST /api/uploads/start — always passthrough. Starting a new upload
  // requires a server-issued id; offline-queueing a start is meaningless.
  if (req.method === 'POST' && START_RE.test(url.pathname)) {
    console.log('[sw-uploads] passthrough start');
    event.respondWith(fetch(req));
    return;
  }

  const chunkMatch = req.method === 'PUT' && url.pathname.match(CHUNK_RE);
  if (chunkMatch) {
    const uploadId = chunkMatch[1];
    const index = Number(chunkMatch[2]);
    if (self.navigator?.onLine === false) {
      console.log(`[sw-uploads] offline — queueing chunk ${index} for upload ${uploadId}`);
      event.respondWith(
        (async () => {
          try {
            const blob = await req.clone().blob();
            await persistChunk(uploadId, index, blob);
            return syntheticQueuedResponse();
          } catch (err) {
            console.error('[sw-uploads] queue write failed', err);
            // If we can't persist the chunk, fall back to the network so
            // the caller sees a real error rather than a phantom 202.
            return fetch(req);
          }
        })()
      );
      return;
    }
    console.log(`[sw-uploads] passthrough chunk ${index}`);
    event.respondWith(fetch(req));
    return;
  }
  // Anything else under /api/uploads/ — leave to default network fetch.
});
