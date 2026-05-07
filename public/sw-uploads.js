// sw-uploads.js — Operator-only upload-queue service worker.
//
// Day 1 (May 7, 2026): registration skeleton only. install/activate fire
// and the SW takes control of clients in scope. No fetch handler yet —
// that arrives in Day 2 alongside the IndexedDB queue schema.
//
// Scope: registered with `scope: '/api/uploads/'` so the SW only sees
// upload-related fetches, NOT the full app.

const SW_VERSION = 'sw-uploads-v0.1.0-day1';

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
