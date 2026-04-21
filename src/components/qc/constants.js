/**
 * QC Technician Role Constants
 *
 * Role-specific color helpers below return single-string Tailwind classes.
 * For the centralized {bg, text, border, hex, dark} shape used across the
 * app, re-exported from @/lib/statusConfig.
 */

export { BACKEND_URL } from '@/lib/config'

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

export const POLL_INTERVAL = 30000

export const SAMPLE_VIDEO = 'https://cdn.pixabay.com/video/2024/02/09/199958-911694865_large.mp4'

export const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export const reportTabs = ['project', 'details', 'conditions', 'template', 'review']

export const defaultFormData = {
  name: '',
  issuer: '',
  issueDate: '',
  expiryDate: '',
  credentialId: '',
  description: '',
  category: '',
  skills: '',
  verificationUrl: '',
  fileUrl: '',
  status: 'active'
}

// ─── Confidence / Detection helpers ─────────────────────────────
export const normalizeConfidence = (value) => {
  if (value == null || isNaN(value)) return 0
  const num = Number(value)
  return num > 1 ? num : num * 100
}

export const formatTimestamp = (seconds) => {
  if (seconds == null || isNaN(seconds)) return '0:00'
  const totalSec = Math.round(Number(seconds))
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export const fmtTime = (s) => {
  if (!s || isNaN(s)) return '00:00'
  return new Date(s * 1000).toISOString().substr(14, 5)
}

export const formatTime = (s) => {
  if (!s || isNaN(s)) return '00:00:00'
  return new Date(s * 1000).toISOString().substr(11, 8)
}

// ─── Color / Style helpers ──────────────────────────────────────
export const getConfidenceColor = (pct) => {
  if (pct >= 85) return 'text-green-700 bg-green-50 border-green-200'
  if (pct >= 70) return 'text-amber-700 bg-amber-50 border-amber-200'
  return 'text-red-700 bg-red-50 border-red-200'
}

export const getSeverityStyle = (severity) => {
  switch ((severity || '').toLowerCase()) {
    case 'critical': return 'bg-red-100 text-red-800 border-red-200'
    case 'major': return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'minor': return 'bg-green-100 text-green-800 border-green-200'
    case 'high': return 'bg-red-100 text-red-800 border-red-200'
    case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
    default: return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

export const getPriorityColor = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'high': return 'text-red-600 bg-red-50 border-red-100'
    case 'medium': return 'text-amber-600 bg-amber-50 border-amber-100'
    case 'low': return 'text-blue-600 bg-blue-50 border-blue-100'
    default: return 'text-gray-600 bg-gray-50 border-gray-100'
  }
}

export const getStatusColor = (status) => {
  switch (status) {
    case 'assigned':
    case 'pending': return 'bg-amber-100 text-amber-700'
    case 'in-progress': return 'bg-amber-100 text-red-800'
    case 'completed': return 'bg-green-100 text-green-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

export const getStatusVariant = (status) => {
  switch (status) {
    case 'completed': return 'default'
    case 'draft': return 'secondary'
    case 'pending_review': return 'outline'
    default: return 'outline'
  }
}

export const getGradeColor = (grade) => {
  switch (grade) {
    case 'Grade 1': return 'bg-green-100 text-green-700'
    case 'Grade 2': return 'bg-yellow-100 text-yellow-700'
    case 'Grade 3': return 'bg-orange-100 text-orange-700'
    case 'Grade 4': return 'bg-red-100 text-red-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}
