"use client";

import { useCallback, useEffect, useState } from "react";

const RECENTS_KEY = "cmdPalette:recents";
const MAX_RECENTS = 5;

/**
 * Hook: useCommandPalette()
 *
 * Manages open/close state, Cmd+K (or Ctrl+K) global listener, and
 * localStorage-backed "recent items" list.
 */
export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  const [recents, setRecents] = useState([]);

  // Load recents on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENTS_KEY);
      if (raw) setRecents(JSON.parse(raw));
    } catch {
      // ignore — localStorage may be disabled
    }
  }, []);

  const openPalette = useCallback(() => setOpen(true), []);
  const closePalette = useCallback(() => setOpen(false), []);
  const togglePalette = useCallback(() => setOpen((p) => !p), []);

  const addRecent = useCallback((item) => {
    if (!item || !item.id) return;
    setRecents((prev) => {
      const without = prev.filter((r) => r.id !== item.id);
      const next = [item, ...without].slice(0, MAX_RECENTS);
      try {
        localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Global keyboard listener (Cmd/Ctrl+K)
  useEffect(() => {
    const handler = (e) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        togglePalette();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [togglePalette]);

  return {
    open,
    openPalette,
    closePalette,
    togglePalette,
    recents,
    addRecent,
  };
}
