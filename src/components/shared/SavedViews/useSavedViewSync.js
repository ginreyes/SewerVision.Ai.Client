"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

/**
 * useSavedViewSync — two-way bridge between a SavedView object and the
 * current page's filter state + URL query params.
 *
 * Callers provide an `applyFilters(filtersObj)` callback that maps the
 * view's filter payload to their local state setters, and a
 * `captureFilters()` callback that snapshots current filters for saving.
 *
 * The hook adds/removes a `viewId=<id>` query param on the URL so refreshes
 * and sharing preserve the active view.
 */
export function useSavedViewSync({ applyFilters, captureFilters } = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeViewId = searchParams?.get("viewId") || null;

  const applyView = useCallback(
    (view) => {
      if (!view) return;
      if (typeof applyFilters === "function") {
        try {
          applyFilters(view.filters || {});
        } catch {
          // tolerate shape mismatch — view may have filters the page doesn't use
        }
      }
      const next = new URLSearchParams(searchParams?.toString() || "");
      next.set("viewId", String(view._id));
      router.push(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [applyFilters, router, pathname, searchParams]
  );

  const clearView = useCallback(() => {
    const next = new URLSearchParams(searchParams?.toString() || "");
    next.delete("viewId");
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [router, pathname, searchParams]);

  const snapshot = useCallback(() => {
    if (typeof captureFilters === "function") {
      try {
        return captureFilters() || {};
      } catch {
        return {};
      }
    }
    return {};
  }, [captureFilters]);

  return {
    activeViewId,
    applyView,
    clearView,
    snapshot,
  };
}
