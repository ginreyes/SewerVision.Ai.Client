"use client";

/**
 * Chart.js global dark mode theme.
 *
 * Call `applyChartTheme(isDark)` whenever the theme changes.
 * It sets Chart.defaults so ALL charts auto-adapt without per-chart overrides.
 *
 * Usage — in any component that renders charts:
 *   import { applyChartTheme } from '@/lib/chartTheme';
 *   import { useTheme } from '@/components/providers/ThemeProvider';
 *   const { isDark } = useTheme();
 *   useEffect(() => { applyChartTheme(isDark); }, [isDark]);
 *
 * OR — import `useChartTheme()` which does it automatically:
 *   import { useChartTheme } from '@/lib/chartTheme';
 *   useChartTheme(); // call once at the top of any chart page
 */

import { useEffect } from "react";

// Light and dark palettes
const LIGHT = {
  text: "#374151",         // gray-700
  textMuted: "#6b7280",    // gray-500
  grid: "#e5e7eb",         // gray-200
  border: "#d1d5db",       // gray-300
  surface: "#ffffff",
  tooltip: "#1f2937",      // gray-800
  tooltipText: "#f9fafb",  // gray-50
};

const DARK = {
  text: "#e5e7eb",         // gray-200
  textMuted: "#9ca3af",    // gray-400
  grid: "rgba(255,255,255,0.08)",
  border: "rgba(255,255,255,0.12)",
  surface: "#1f2937",      // gray-800
  tooltip: "#374151",      // gray-700
  tooltipText: "#f9fafb",
};

/**
 * Apply dark or light defaults to Chart.js globally.
 * Safe to call repeatedly — idempotent.
 */
export function applyChartTheme(isDark) {
  if (typeof window === "undefined" || !window.Chart) return;

  const Chart = window.Chart;
  const p = isDark ? DARK : LIGHT;

  // Global text color
  Chart.defaults.color = p.text;

  // Grid lines
  Chart.defaults.scale = Chart.defaults.scale || {};
  if (Chart.defaults.scales) {
    // Category & linear scales
    for (const scaleType of ["category", "linear", "logarithmic", "time"]) {
      const s = Chart.defaults.scales[scaleType];
      if (s) {
        s.grid = s.grid || {};
        s.grid.color = p.grid;
        s.grid.borderColor = p.border;
        s.ticks = s.ticks || {};
        s.ticks.color = p.textMuted;
      }
    }
  }

  // Tooltip
  Chart.defaults.plugins = Chart.defaults.plugins || {};
  Chart.defaults.plugins.tooltip = Chart.defaults.plugins.tooltip || {};
  Chart.defaults.plugins.tooltip.backgroundColor = p.tooltip;
  Chart.defaults.plugins.tooltip.titleColor = p.tooltipText;
  Chart.defaults.plugins.tooltip.bodyColor = p.tooltipText;
  Chart.defaults.plugins.tooltip.borderColor = p.border;
  Chart.defaults.plugins.tooltip.borderWidth = 1;

  // Legend
  Chart.defaults.plugins.legend = Chart.defaults.plugins.legend || {};
  Chart.defaults.plugins.legend.labels = Chart.defaults.plugins.legend.labels || {};
  Chart.defaults.plugins.legend.labels.color = p.text;

  // Title
  Chart.defaults.plugins.title = Chart.defaults.plugins.title || {};
  Chart.defaults.plugins.title.color = p.text;
}

/**
 * React hook — call once at the top of any page that renders Chart.js charts.
 * Automatically applies the theme when dark mode toggles.
 */
export function useChartTheme() {
  // Dynamic import to avoid issues — useTheme must be called inside the provider tree
  const { useTheme } = require("@/components/providers/ThemeProvider");
  const { isDark } = useTheme();

  useEffect(() => {
    // Chart.js may be lazy-loaded via `chart.js/auto`. Apply immediately if
    // available, and also set a short timer to catch the async load.
    applyChartTheme(isDark);
    const t = setTimeout(() => applyChartTheme(isDark), 500);
    return () => clearTimeout(t);
  }, [isDark]);
}
