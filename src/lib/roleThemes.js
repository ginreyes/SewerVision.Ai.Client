/**
 * Centralized role theme configuration.
 *
 * Use this everywhere role-specific colors are needed so the
 * palette stays consistent across the whole app.
 *
 * Usage:
 *   import { getRoleTheme } from '@/lib/roleThemes';
 *   const theme = getRoleTheme('operator');
 *   <div className={theme.badge}>Operator</div>
 *   <Button className={theme.button}>Save</Button>
 */

const ROLE_THEMES = {
  admin: {
    key: "admin",
    label: "Admin",
    // Primary
    primary: "text-rose-600",
    primaryBg: "bg-rose-600",
    primaryHover: "hover:bg-rose-700",
    // Gradient (sidebar / headers)
    gradient: "bg-gradient-to-r from-rose-600 via-red-500 to-rose-700",
    gradientLight: "bg-gradient-to-br from-rose-50 to-red-50",
    // Badge
    badge: "bg-rose-100 text-rose-700 border-rose-200",
    // Button
    button: "bg-rose-600 hover:bg-rose-700 text-white",
    buttonOutline: "border-rose-200 text-rose-700 hover:bg-rose-50",
    // Icon container
    iconBg: "bg-rose-100",
    iconText: "text-rose-600",
    // Card accents
    cardBorder: "border-rose-100",
    cardHeaderBg: "bg-rose-50/30",
    // Active / selected states
    activeBg: "bg-rose-50",
    activeText: "text-rose-700",
    activeBorder: "border-rose-300",
    // Ring / focus
    ring: "ring-rose-200",
    // Dot indicator
    dot: "bg-rose-500",
  },

  operator: {
    key: "operator",
    label: "Operator",
    primary: "text-blue-600",
    primaryBg: "bg-blue-600",
    primaryHover: "hover:bg-blue-700",
    gradient: "bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-700",
    gradientLight: "bg-gradient-to-br from-blue-50 to-indigo-50",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    button: "bg-blue-600 hover:bg-blue-700 text-white",
    buttonOutline: "border-blue-200 text-blue-700 hover:bg-blue-50",
    iconBg: "bg-blue-100",
    iconText: "text-blue-600",
    cardBorder: "border-blue-100",
    cardHeaderBg: "bg-blue-50/30",
    activeBg: "bg-blue-50",
    activeText: "text-blue-700",
    activeBorder: "border-blue-300",
    ring: "ring-blue-200",
    dot: "bg-blue-500",
  },

  "qc-technician": {
    key: "qc-technician",
    label: "QC Technician",
    primary: "text-purple-600",
    primaryBg: "bg-purple-600",
    primaryHover: "hover:bg-purple-700",
    gradient: "bg-gradient-to-r from-purple-600 via-pink-500 to-purple-700",
    gradientLight: "bg-gradient-to-br from-purple-50 to-pink-50",
    badge: "bg-purple-100 text-purple-700 border-purple-200",
    button: "bg-purple-600 hover:bg-purple-700 text-white",
    buttonOutline: "border-purple-200 text-purple-700 hover:bg-purple-50",
    iconBg: "bg-purple-100",
    iconText: "text-purple-600",
    cardBorder: "border-purple-100",
    cardHeaderBg: "bg-purple-50/30",
    activeBg: "bg-purple-50",
    activeText: "text-purple-700",
    activeBorder: "border-purple-300",
    ring: "ring-purple-200",
    dot: "bg-purple-500",
  },

  user: {
    key: "user",
    label: "Team Lead",
    primary: "text-indigo-600",
    primaryBg: "bg-indigo-600",
    primaryHover: "hover:bg-indigo-700",
    gradient: "bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-700",
    gradientLight: "bg-gradient-to-br from-indigo-50 to-purple-50",
    badge: "bg-indigo-100 text-indigo-700 border-indigo-200",
    button: "bg-indigo-600 hover:bg-indigo-700 text-white",
    buttonOutline: "border-indigo-200 text-indigo-700 hover:bg-indigo-50",
    iconBg: "bg-indigo-100",
    iconText: "text-indigo-600",
    cardBorder: "border-indigo-100",
    cardHeaderBg: "bg-indigo-50/30",
    activeBg: "bg-indigo-50",
    activeText: "text-indigo-700",
    activeBorder: "border-indigo-300",
    ring: "ring-indigo-200",
    dot: "bg-indigo-500",
  },

  customer: {
    key: "customer",
    label: "Customer",
    primary: "text-emerald-600",
    primaryBg: "bg-emerald-600",
    primaryHover: "hover:bg-emerald-700",
    gradient: "bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-700",
    gradientLight: "bg-gradient-to-br from-emerald-50 to-green-50",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    button: "bg-emerald-600 hover:bg-emerald-700 text-white",
    buttonOutline: "border-emerald-200 text-emerald-700 hover:bg-emerald-50",
    iconBg: "bg-emerald-100",
    iconText: "text-emerald-600",
    cardBorder: "border-emerald-100",
    cardHeaderBg: "bg-emerald-50/30",
    activeBg: "bg-emerald-50",
    activeText: "text-emerald-700",
    activeBorder: "border-emerald-300",
    ring: "ring-emerald-200",
    dot: "bg-emerald-500",
  },

  "customer-rep": {
    key: "customer-rep",
    label: "Customer Rep",
    primary: "text-teal-600",
    primaryBg: "bg-teal-600",
    primaryHover: "hover:bg-teal-700",
    gradient: "bg-gradient-to-r from-teal-600 via-cyan-500 to-teal-700",
    gradientLight: "bg-gradient-to-br from-teal-50 to-cyan-50",
    badge: "bg-teal-100 text-teal-700 border-teal-200",
    button: "bg-teal-600 hover:bg-teal-700 text-white",
    buttonOutline: "border-teal-200 text-teal-700 hover:bg-teal-50",
    iconBg: "bg-teal-100",
    iconText: "text-teal-600",
    cardBorder: "border-teal-100",
    cardHeaderBg: "bg-teal-50/30",
    activeBg: "bg-teal-50",
    activeText: "text-teal-700",
    activeBorder: "border-teal-300",
    ring: "ring-teal-200",
    dot: "bg-teal-500",
  },
};

// Default fallback
const DEFAULT_THEME = ROLE_THEMES.admin;

/**
 * Flat role -> Tailwind badge classname map.
 * Single source of truth for role pill/badge styling across the app.
 * Use this in places that just need a className string rather than the
 * full theme object.
 */
export const ROLE_BADGE_CLASSES = {
  admin: ROLE_THEMES.admin.badge,
  operator: ROLE_THEMES.operator.badge,
  "qc-technician": ROLE_THEMES["qc-technician"].badge,
  user: ROLE_THEMES.user.badge,
  customer: ROLE_THEMES.customer.badge,
  "customer-rep": ROLE_THEMES["customer-rep"].badge,
};

/**
 * Get the theme object for a role.
 * @param {string} role - The role key (e.g. 'admin', 'operator', 'customer-rep')
 * @returns {object} Theme object with all color classes
 */
export function getRoleTheme(role) {
  return ROLE_THEMES[role] || DEFAULT_THEME;
}

/**
 * Get all role themes (useful for admin pages listing roles).
 * @returns {object} All themes keyed by role
 */
export function getAllRoleThemes() {
  return ROLE_THEMES;
}

/**
 * Get role label.
 * @param {string} role
 * @returns {string}
 */
export function getRoleLabel(role) {
  return ROLE_THEMES[role]?.label || role;
}

export default ROLE_THEMES;
