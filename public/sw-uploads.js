// sw-uploads.js — Operator-only upload-queue service worker.
//
// Day 1 (May 7, 2026): registration skeleton only.
// Day 2 (May 8, 2026): passthrough fetch handler. Matches the chunked-upload
// endpoints (`POST /api/uploads/start`, `PUT /api/uploads/:id/chunk/:n`) and
// currently forwards every request to the network unchanged while logging
// to console. This proves interception works on a real device with zero
// behavior change before Day 3 wires queueing on top.
//
// Scope: registered with `scope: '/api/uploads/'` so the SW only sees
// upload-related fetches, NOT the full app.

const SW_VERSION = 'sw-uploads-v0.2.0-day2';

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

// Match POST /api/uploads/start
const START_RE = /\/api\/uploads\/start\/?$/;
// Match PUT /api/uploads/:id/chunk/:n
const CHUNK_RE = /\/api\/uploads\/[^/]+\/chunk\/(\d+)\/?$/;

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

  if (req.method === 'POST' && START_RE.test(url.pathname)) {
    console.log('[sw-uploads] passthrough start');
    event.respondWith(fetch(req));
    return;
  }

  const chunkMatch = req.method === 'PUT' && url.pathname.match(CHUNK_RE);
  if (chunkMatch) {
    console.log(`[sw-uploads] passthrough chunk ${chunkMatch[1]}`);
    event.respondWith(fetch(req));
    return;
  }
  // Anything else under /api/uploads/ — leave to default network fetch.
});
