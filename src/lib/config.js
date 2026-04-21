/**
 * Application configuration constants.
 * Single source of truth for values used across multiple components.
 */

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
export const API_URL = BACKEND_URL;

export const POLL_INTERVALS = {
  default: 30000,      // 30s — dashboards, assignments
  fast: 10000,         // 10s — admin dashboard, active monitoring
  announcements: 15000, // 15s — announcement banner
  slow: 60000,         // 60s — background stats
};

export const PAGINATION = {
  defaultPageSize: 10,
  projectPageSize: 6,
  userPageSize: 20,
  maxPageSize: 100,
};
