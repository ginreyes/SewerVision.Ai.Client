// July 6 — module-switching perf. Central place for TanStack Query defaults.
//
// The problem: every module (admin/users, admin/devices, admin/uploads, etc.)
// creates its own useQuery calls with the default staleTime: 0. Switching
// away and back re-fetches immediately, ignoring recent data. On slow
// connections this adds 200-800ms of blank state per switch.
//
// The fix: raise staleTime on list-style queries so the second switch reads
// from cache instantly + revalidates in the background. Individual queries
// can still override for real-time data (unread counts, live logs).
//
// Also: keepPreviousData across paginated switches so page transitions don't
// flicker. The May 27 fix pinned this per-query; we now default it globally.

import { keepPreviousData } from "@tanstack/react-query";

// Aggressive but safe defaults for a heavy dashboard where lists dominate.
export const QUERY_DEFAULTS = {
  queries: {
    // 30s stale for list queries — module switch within 30s = instant paint.
    staleTime: 30_000,
    // 5min gc so a background tab does not blow away caches during a coffee break.
    gcTime: 5 * 60_000,
    // Retry once with a modest backoff. Network hiccups shouldn't hard-fail a switch.
    retry: 1,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 4000),
    // Preserve prior page while a new one loads — no flicker on paginated switches.
    placeholderData: keepPreviousData,
    // Don't refetch just because the user focused the tab; specific queries
    // (unread badge, project health rollup) opt in individually.
    refetchOnWindowFocus: false,
    // Cheap safety net for stale writes on reconnect.
    refetchOnReconnect: true,
  },
  mutations: {
    retry: 0,
  },
};

// Route-level prefetch keys — used by app router prefetch helpers to warm
// the cache when the user hovers/focuses a sidebar link. Adding a key here
// makes it available to prefetchRoute() below.
export const PREFETCH_KEYS = {
  "/admin/users": ["users", "list", { page: 1 }],
  "/admin/devices": ["devices", "list", { page: 1 }],
  "/admin/uploads": ["uploads", "list", { page: 1 }],
  "/admin/dashboard": ["admin", "dashboard"],
  "/admin/notifications": ["admin", "notifications", { page: 1 }],
  "/admin/training": ["training", "assignments-overview"],
};

// prefetchRoute — call from a sidebar link's onFocus / onMouseEnter to warm
// the cache for the destination. Returns a promise the caller can ignore.
// queryClient is passed in so this stays framework-neutral.
export async function prefetchRoute(queryClient, path, fetcher) {
  const key = PREFETCH_KEYS[path];
  if (!key) return;
  const state = queryClient.getQueryState(key);
  // Don't prefetch if we have fresh data or a request is already in-flight.
  if (state?.data && Date.now() - state.dataUpdatedAt < 15_000) return;
  if (state?.fetchStatus === "fetching") return;
  await queryClient.prefetchQuery({ queryKey: key, queryFn: fetcher });
}
