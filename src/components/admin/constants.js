/**
 * Admin Role Constants
 *
 * Role-specific color configs live in this file (shapes like priorityConfig
 * with {color, bg, border, label, ring}). For the centralized
 * {bg, text, border, hex, dark} shape used across the app, re-exported
 * below from @/lib/statusConfig.
 */

import { BACKEND_URL } from '@/lib/config'

// Re-exports from centralized status config (aliased to avoid collisions)
export {
  ROLE_COLORS,
  getRoleColor,
  CALENDAR_CATEGORY_COLORS,
  getCalendarCategoryClass,
  PROJECT_STATUS_COLORS as CENTRAL_PROJECT_STATUS_COLORS,
  PRIORITY_COLORS as CENTRAL_PRIORITY_COLORS,
  SEVERITY_COLORS as CENTRAL_SEVERITY_COLORS,
  getProjectStatusColor as getCentralProjectStatusColor,
  getPriorityColor as getCentralPriorityColor,
  getSeverityColor as getCentralSeverityColor,
} from '@/lib/statusConfig'

// Chart colors
export const COLORS = ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981']

// Avatar solid colors (for report list, users, etc.)
export const avatarColors = [
  'bg-violet-500', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500',
  'bg-sky-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
]

// Avatar gradient colors (for report detail)
export const avatarGradients = [
  'from-violet-500 to-purple-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-500',
  'from-emerald-500 to-teal-600',
  'from-sky-500 to-blue-600',
  'from-indigo-500 to-violet-500',
]

export const getInitials = (firstOrUser, lastName, username, email) => {
  // Support both (firstName, lastName, username, email) and (user) signatures
  if (typeof firstOrUser === 'object' && firstOrUser !== null) {
    const u = firstOrUser
    if (u.first_name && u.last_name) return `${u.first_name[0]}${u.last_name[0]}`.toUpperCase()
    if (u.first_name) return u.first_name[0].toUpperCase()
    if (u.username) return u.username[0].toUpperCase()
    if (u.email) return u.email[0].toUpperCase()
    return '?'
  }
  if (firstOrUser && lastName) return `${firstOrUser[0]}${lastName[0]}`.toUpperCase()
  if (firstOrUser) return firstOrUser[0].toUpperCase()
  if (username) return username[0].toUpperCase()
  if (email) return email[0].toUpperCase()
  return '?'
}

export const getAvatarColor = (str = '') => avatarColors[str.charCodeAt(0) % avatarColors.length]

export const getAvatarGradient = (str = '') => avatarGradients[str.charCodeAt(0) % avatarGradients.length]

export const getBaseUrl = () => BACKEND_URL

export const avatarSrc = (user) => {
  const id = user?._id || user?.id
  if (!id) return null
  return `${BACKEND_URL}/api/users/avatar/${id}`
}

export const API_URL = BACKEND_URL

export const getSeverityColor = (severity) => {
  const colors = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    major: 'bg-orange-100 text-orange-800 border-orange-200',
    moderate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    minor: 'bg-blue-100 text-blue-800 border-blue-200',
  }
  return colors[severity?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200'
}

// ── All system roles ──
export const ALL_ROLES = ['admin', 'operator', 'qc-technician', 'user', 'customer', 'customer-rep']

export const ROLE_LABELS = {
  admin: 'Admin',
  operator: 'Operator',
  'qc-technician': 'QC Tech',
  user: 'Team Lead',
  customer: 'Customer',
  'customer-rep': 'Support Rep',
}

// ── Announcement type config ──
export const ANNOUNCEMENT_TYPES = ['general', 'maintenance', 'feature', 'policy', 'alert']

export const ANNOUNCEMENT_TYPE_CONFIG = {
  maintenance: { color: 'bg-amber-100 text-amber-700 border-amber-200', gradient: 'from-amber-500 to-orange-500' },
  feature: { color: 'bg-blue-100 text-blue-700 border-blue-200', gradient: 'from-blue-500 to-indigo-500' },
  policy: { color: 'bg-purple-100 text-purple-700 border-purple-200', gradient: 'from-purple-500 to-violet-500' },
  alert: { color: 'bg-red-100 text-red-700 border-red-200', gradient: 'from-red-500 to-rose-500' },
  general: { color: 'bg-gray-100 text-gray-600 border-gray-200', gradient: 'from-gray-500 to-slate-500' },
}

// ── Invoice / billing status config ──
export const INVOICE_STATUS_COLORS = {
  paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  overdue: 'bg-red-100 text-red-700 border-red-200',
  draft: 'bg-gray-100 text-gray-600 border-gray-200',
}

// ── System health service status config ──
export const SERVICE_STATUS_CONFIG = {
  online: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  degraded: { color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500 animate-pulse' },
  offline: { color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500' },
}

// ── Analytics chart data defaults ──
export const CHART_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export const priorityConfig = {
  low: {
    color: 'text-slate-500',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    label: 'Low',
    ring: 'ring-slate-200',
  },
  medium: {
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    label: 'Medium',
    ring: 'ring-amber-200',
  },
  high: {
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    label: 'High',
    ring: 'ring-orange-200',
  },
  critical: {
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    label: 'Critical',
    ring: 'ring-red-200',
  },
}
