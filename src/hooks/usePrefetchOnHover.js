"use client";
import { useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchRoute } from "@/lib/queryClientDefaults";
import { api } from "@/lib/helper";

// July 6 — module-switching perf. Sidebar hook that prewarms the destination
// module's data when the user hovers or focuses the link.
//
// Usage in a sidebar item:
//   const { onEnter, onFocus } = usePrefetchOnHover();
//   <Link href="/admin/users" onMouseEnter={() => onEnter('/admin/users')} onFocus={() => onFocus('/admin/users')}>
//
// Behavior:
//   - Debounces so a fast mouse trail doesn't spam prefetch
//   - Skips paths without a PREFETCH_KEYS entry
//   - Skips when the cache is already fresh
//
// The actual fetcher is inlined here because each path has a slightly
// different query shape — kept small so it stays reviewable.

const FETCHERS = {
  "/admin/users": () => api("/api/users/get-all-user?page=1&limit=50"),
  "/admin/devices": () => api("/api/devices?page=1&limit=50"),
  "/admin/uploads": () => api("/api/uploads?page=1&limit=50"),
  "/admin/dashboard": () => api("/api/admin/dashboard-stats"),
  "/admin/notifications": () => api("/api/notifications?page=1&limit=50"),
  "/admin/training": () => api("/api/training/assignments-overview"),
};

const HOVER_DEBOUNCE_MS = 120;

export function usePrefetchOnHover() {
  const client = useQueryClient();
  const timers = useRef(new Map());

  const trigger = useCallback(
    (path) => {
      const fetcher = FETCHERS[path];
      if (!fetcher) return;
      prefetchRoute(client, path, fetcher).catch(() => {
        // Prefetch failures are non-fatal — the real load will surface any error.
      });
    },
    [client],
  );

  const onEnter = useCallback(
    (path) => {
      const existing = timers.current.get(path);
      if (existing) clearTimeout(existing);
      const t = setTimeout(() => {
        trigger(path);
        timers.current.delete(path);
      }, HOVER_DEBOUNCE_MS);
      timers.current.set(path, t);
    },
    [trigger],
  );

  const onLeave = useCallback(
    (path) => {
      const t = timers.current.get(path);
      if (t) {
        clearTimeout(t);
        timers.current.delete(path);
      }
    },
    [],
  );

  const onFocus = useCallback((path) => trigger(path), [trigger]);

  return { onEnter, onLeave, onFocus };
}
