"use client";

import { useCallback, useMemo, useState } from "react";

/**
 * useBulkSelection — selection state machine for list pages.
 *
 * Responsibilities:
 *  - maintain a Set of selected ids
 *  - support shift-click range via `anchorIndex`
 *  - expose select-all-visible / clear / toggle primitives
 *  - keep derived `selectedCount` and `allVisibleSelected` memoized
 *
 * Keep selection state in memory only (not URL) — refreshing a page should
 * clear the batch, which matches user expectations for bulk operations.
 */
export function useBulkSelection(visibleIds = []) {
  const [selected, setSelected] = useState(() => new Set());
  const [anchorIndex, setAnchorIndex] = useState(null);

  const selectedArray = useMemo(() => Array.from(selected), [selected]);
  const selectedCount = selected.size;

  const allVisibleSelected = useMemo(() => {
    if (!visibleIds?.length) return false;
    return visibleIds.every((id) => selected.has(id));
  }, [visibleIds, selected]);

  const someVisibleSelected = useMemo(() => {
    if (!visibleIds?.length) return false;
    return visibleIds.some((id) => selected.has(id));
  }, [visibleIds, selected]);

  const toggle = useCallback(
    (id, opts = {}) => {
      const { shiftKey = false, index = null } = opts;

      setSelected((prev) => {
        const next = new Set(prev);

        if (shiftKey && anchorIndex !== null && index !== null && visibleIds?.length) {
          const [from, to] =
            index < anchorIndex
              ? [index, anchorIndex]
              : [anchorIndex, index];
          const rangeIds = visibleIds.slice(from, to + 1);
          const shouldSelect = !next.has(id);
          for (const rid of rangeIds) {
            if (shouldSelect) next.add(rid);
            else next.delete(rid);
          }
          return next;
        }

        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });

      if (index !== null) setAnchorIndex(index);
    },
    [anchorIndex, visibleIds]
  );

  const selectAllVisible = useCallback(() => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const id of visibleIds || []) next.add(id);
      return next;
    });
  }, [visibleIds]);

  const clearSelection = useCallback(() => {
    setSelected(new Set());
    setAnchorIndex(null);
  }, []);

  const toggleAllVisible = useCallback(() => {
    if (allVisibleSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        for (const id of visibleIds || []) next.delete(id);
        return next;
      });
    } else {
      selectAllVisible();
    }
  }, [allVisibleSelected, visibleIds, selectAllVisible]);

  const isSelected = useCallback((id) => selected.has(id), [selected]);

  return {
    selected,
    selectedArray,
    selectedCount,
    allVisibleSelected,
    someVisibleSelected,
    toggle,
    selectAllVisible,
    toggleAllVisible,
    clearSelection,
    isSelected,
  };
}
