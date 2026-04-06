"use client";

import { useEffect } from "react";

/**
 * Global keyboard shortcuts hook.
 * - Ctrl+K / Cmd+K → focus search bar in navbar
 * - Esc → close any open dialog/modal (handled natively by Radix)
 */
export function useKeyboardShortcuts() {
  useEffect(() => {
    function handleKeyDown(e) {
      // Ctrl+K or Cmd+K → focus search
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.querySelector('[data-search-input="true"]') ||
          document.querySelector('input[placeholder*="Search"]') ||
          document.querySelector('input[placeholder*="search"]');
        if (searchInput) {
          searchInput.focus();
          searchInput.select?.();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
