/**
 * Centralized status, priority, and severity color configurations.
 *
 * Instead of defining STATUS_COLORS, PRIORITY_COLORS, SEVERITY_STYLES
 * inline in 15+ components, import from here. Each config provides both
 * Tailwind classes (for JSX) and hex codes (for Chart.js / inline styles).
 */

// ── Project Status ──────────────────────────────────────
export const PROJECT_STATUS_COLORS = {
  planning:           { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200", hex: "#3b82f6", dark: "dark:bg-blue-500/15 dark:text-blue-400" },
  "field-capture":    { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-200", hex: "#f43f5e", dark: "dark:bg-rose-500/15 dark:text-rose-400" },
  uploading:          { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200", hex: "#6366f1", dark: "dark:bg-indigo-500/15 dark:text-indigo-400" },
  "ai-processing":    { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200", hex: "#a855f7", dark: "dark:bg-purple-500/15 dark:text-purple-400" },
  "qc-review":        { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200", hex: "#f59e0b", dark: "dark:bg-amber-500/15 dark:text-amber-400" },
  completed:          { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200", hex: "#10b981", dark: "dark:bg-emerald-500/15 dark:text-emerald-400" },
  "customer-notified":{ bg: "bg-teal-100", text: "text-teal-700", border: "border-teal-200", hex: "#14b8a6", dark: "dark:bg-teal-500/15 dark:text-teal-400" },
  "on-hold":          { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200", hex: "#6b7280", dark: "dark:bg-gray-500/15 dark:text-gray-400" },
  "in-progress":      { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200", hex: "#3b82f6", dark: "dark:bg-blue-500/15 dark:text-blue-400" },
};

// ── Ticket/Support Status ───────────────────────────────
export const TICKET_STATUS_COLORS = {
  open:           { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200", dark: "dark:bg-blue-500/15 dark:text-blue-400" },
  "in-progress":  { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200", dark: "dark:bg-amber-500/15 dark:text-amber-400" },
  resolved:       { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200", dark: "dark:bg-emerald-500/15 dark:text-emerald-400" },
  closed:         { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200", dark: "dark:bg-gray-500/15 dark:text-gray-400" },
};

// ── Priority ────────────────────────────────────────────
export const PRIORITY_COLORS = {
  low:      { bg: "bg-green-100", text: "text-green-700", border: "border-green-200", hex: "#22c55e", dark: "dark:bg-green-500/15 dark:text-green-400" },
  medium:   { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200", hex: "#f59e0b", dark: "dark:bg-amber-500/15 dark:text-amber-400" },
  high:     { bg: "bg-red-100", text: "text-red-700", border: "border-red-200", hex: "#ef4444", dark: "dark:bg-red-500/15 dark:text-red-400" },
  critical: { bg: "bg-red-200", text: "text-red-800", border: "border-red-300", hex: "#dc2626", dark: "dark:bg-red-500/20 dark:text-red-300" },
  urgent:   { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-200", hex: "#f43f5e", dark: "dark:bg-rose-500/15 dark:text-rose-400" },
};

// ── Severity ────────────────────────────────────────────
export const SEVERITY_COLORS = {
  critical: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200", dot: "bg-red-500", hex: "#ef4444" },
  high:     { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200", dot: "bg-orange-500", hex: "#f97316" },
  medium:   { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500", hex: "#f59e0b" },
  low:      { bg: "bg-green-100", text: "text-green-700", border: "border-green-200", dot: "bg-green-500", hex: "#22c55e" },
};

// ── Role Colors (for badges, cards, etc.) ───────────────
export const ROLE_COLORS = {
  admin:            { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-200", dark: "dark:bg-rose-500/15 dark:text-rose-400", hex: "#f43f5e" },
  operator:         { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200", dark: "dark:bg-blue-500/15 dark:text-blue-400", hex: "#3b82f6" },
  "qc-technician":  { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200", dark: "dark:bg-purple-500/15 dark:text-purple-400", hex: "#a855f7" },
  user:             { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200", dark: "dark:bg-indigo-500/15 dark:text-indigo-400", hex: "#6366f1" },
  customer:         { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200", dark: "dark:bg-emerald-500/15 dark:text-emerald-400", hex: "#10b981" },
  "customer-rep":   { bg: "bg-teal-100", text: "text-teal-700", border: "border-teal-200", dark: "dark:bg-teal-500/15 dark:text-teal-400", hex: "#14b8a6" },
};

// ── Calendar Event Category Colors ──────────────────────
export const CALENDAR_CATEGORY_COLORS = {
  personal: { tailwind: "bg-[#FF3D1C]/10 text-[#FF3D1C] border-[#FF3D1C]", hex: "#FF3D1C" },
  business: { tailwind: "bg-[#696CFF]/10 text-[#696CFF] border-[#696CFF]", hex: "#696CFF" },
  family:   { tailwind: "bg-[#FFAB00]/10 text-[#FFAB00] border-[#FFAB00]", hex: "#FFAB00" },
  holiday:  { tailwind: "bg-[#71DD37]/10 text-[#71DD37] border-[#71DD37]", hex: "#71DD37" },
  etc:      { tailwind: "bg-[#03C3EC]/10 text-[#03C3EC] border-[#03C3EC]", hex: "#03C3EC" },
  viewAll:  { tailwind: "bg-[#8491A2]/10 text-[#8491A2] border-[#8491A2]", hex: "#8491A2" },
};

// ── Calendar Filter Checkbox Colors (data-state selectors) ──
export const CALENDAR_FILTER_COLORS = {
  viewAll:  "data-[state=checked]:bg-[#8491A2] data-[state=checked]:border-[#8491A2]",
  personal: "data-[state=checked]:bg-[#FF3D1C] data-[state=checked]:border-[#FF3D1C]",
  business: "data-[state=checked]:bg-[#696CFF] data-[state=checked]:border-[#696CFF]",
  family:   "data-[state=checked]:bg-[#FFAB00] data-[state=checked]:border-[#FFAB00]",
  holiday:  "data-[state=checked]:bg-[#71DD37] data-[state=checked]:border-[#71DD37]",
  etc:      "data-[state=checked]:bg-[#03C3EC] data-[state=checked]:border-[#03C3EC]",
};

// ── Helpers ─────────────────────────────────────────────

/** Get project status color config, returns a default for unknown statuses */
export function getProjectStatusColor(status) {
  return PROJECT_STATUS_COLORS[status] || PROJECT_STATUS_COLORS["on-hold"];
}

/** Get priority color config */
export function getPriorityColor(priority) {
  return PRIORITY_COLORS[(priority || "medium").toLowerCase()] || PRIORITY_COLORS.medium;
}

/** Get severity color config */
export function getSeverityColor(severity) {
  return SEVERITY_COLORS[(severity || "medium").toLowerCase()] || SEVERITY_COLORS.medium;
}

/** Get role color config */
export function getRoleColor(role) {
  return ROLE_COLORS[role] || ROLE_COLORS.operator;
}

/** Get Tailwind class string for a calendar event category */
export function getCalendarCategoryClass(category) {
  return CALENDAR_CATEGORY_COLORS[category]?.tailwind || "bg-gray-200 text-gray-800 border-gray-300";
}
