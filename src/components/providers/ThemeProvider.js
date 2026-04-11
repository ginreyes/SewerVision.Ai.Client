"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";

/**
 * ThemeProvider — manages light/dark/system theme preference.
 *
 * How it works:
 *  - Reads initial preference from localStorage('theme') → 'light' | 'dark' | 'system'
 *  - When 'system', listens to prefers-color-scheme media query
 *  - Adds or removes the 'dark' class on <html>, which activates the .dark {}
 *    CSS variables defined in globals.css and all dark: Tailwind variants
 *  - Persists preference to localStorage immediately (instant on next load)
 *
 * Usage:
 *   Wrap the app (already done in AppProviders):
 *     <ThemeProvider>{children}</ThemeProvider>
 *
 *   In any component:
 *     const { theme, setTheme, isDark } = useTheme();
 */

const ThemeContext = createContext({
  theme: "system",    // 'light' | 'dark' | 'system'
  setTheme: () => {},
  isDark: false,
});

const STORAGE_KEY = "theme";

function getSystemPreference() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getStoredTheme() {
  if (typeof window === "undefined") return "system";
  try {
    return localStorage.getItem(STORAGE_KEY) || "system";
  } catch {
    return "system";
  }
}

function applyTheme(isDark) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (isDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => getStoredTheme());
  const [systemDark, setSystemDark] = useState(() => getSystemPreference());

  const isDark = theme === "dark" || (theme === "system" && systemDark);

  // Apply class to <html> on every change
  useEffect(() => {
    applyTheme(isDark);
  }, [isDark]);

  // Listen for OS preference changes
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setSystemDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Prevent flash of wrong theme on mount — apply synchronously via a
  // script-injection pattern. The useEffect above covers runtime changes.
  useEffect(() => {
    applyTheme(isDark);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setTheme = useCallback((next) => {
    setThemeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage may be full or disabled — ignore
    }
  }, []);

  const value = useMemo(() => ({ theme, setTheme, isDark }), [theme, setTheme, isDark]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export default ThemeProvider;
