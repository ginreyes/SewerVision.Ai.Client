"use client";

/**
 * useWorkspaceUrlState
 * ────────────────────
 * Syncs the QC Review Workspace's three primary pieces of state with the URL:
 *
 *   ?project=<projectId>&detection=<detectionId>&view=detail|comparison|video
 *
 * Why the URL at all:
 *  - Refresh recovers the exact detection/view the tech was on
 *  - Back button walks through previous selections naturally
 *  - Bookmarks and shared links land on the right project+detection
 *  - Legacy /qc-technician/project and /qc-technician/project/:id redirect
 *    stubs can forward here by writing the `project` query param
 *
 * Returns a small API:
 *   {
 *     projectParam,              // current ?project value or null
 *     detectionParam,            // current ?detection value or null
 *     viewParam,                 // 'detail' | 'comparison' | 'video'
 *     setProjectParam(id),
 *     setDetectionParam(id),
 *     setViewParam(view),
 *     setParams({project, detection, view}),  // batched update
 *   }
 *
 * Uses router.replace so history isn't polluted by every up/down arrow.
 */

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const VALID_VIEWS = new Set(["detail", "comparison", "video"]);

export default function useWorkspaceUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  const projectParam = search.get("project");
  const detectionParam = search.get("detection");
  const rawView = search.get("view");
  const viewParam = VALID_VIEWS.has(rawView) ? rawView : "detail";

  const writeParams = useCallback(
    (next) => {
      const params = new URLSearchParams(search.toString());
      for (const [key, value] of Object.entries(next)) {
        if (value == null || value === "") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      }
      const qs = params.toString();
      const url = qs ? `${pathname}?${qs}` : pathname;
      // `replace` so arrow-key navigation doesn't create 200 history entries
      router.replace(url, { scroll: false });
    },
    [router, pathname, search]
  );

  const setProjectParam = useCallback(
    (id) => writeParams({ project: id || null, detection: null }),
    [writeParams]
  );
  const setDetectionParam = useCallback((id) => writeParams({ detection: id || null }), [writeParams]);
  const setViewParam = useCallback(
    (view) => writeParams({ view: VALID_VIEWS.has(view) ? view : null }),
    [writeParams]
  );
  const setParams = useCallback((next) => writeParams(next || {}), [writeParams]);

  return useMemo(
    () => ({
      projectParam,
      detectionParam,
      viewParam,
      setProjectParam,
      setDetectionParam,
      setViewParam,
      setParams,
    }),
    [projectParam, detectionParam, viewParam, setProjectParam, setDetectionParam, setViewParam, setParams]
  );
}
