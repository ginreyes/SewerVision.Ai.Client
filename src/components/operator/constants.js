/**
 * Operator Role Constants
 *
 * Role-specific color configs live in this file (custom shapes like
 * {color, label}). For the centralized {bg, text, border, hex, dark} shape
 * used across the app, re-exported below from @/lib/statusConfig.
 */

// Re-exports from centralized status config
export {
    ROLE_COLORS,
    getRoleColor,
    CALENDAR_CATEGORY_COLORS,
    getCalendarCategoryClass,
    PRIORITY_COLORS as CENTRAL_PRIORITY_COLORS,
    SEVERITY_COLORS as CENTRAL_SEVERITY_COLORS,
    getPriorityColor as getCentralPriorityColor,
    getSeverityColor as getCentralSeverityColor,
} from '@/lib/statusConfig';

export const POLL_INTERVAL = 30000;

export const EQUIPMENT_STATUS_COLORS = {
    running: 'bg-green-500',
    recording: 'bg-green-500',
    online: 'bg-blue-500',
    paused: 'bg-yellow-500',
    idle: 'bg-gray-400',
    maintenance: 'bg-orange-500',
    offline: 'bg-gray-400',
};

export const PROJECT_STATUS_CONFIG = {
    'field-capture': { color: 'bg-blue-100 text-blue-700', label: 'Field Capture' },
    'uploading': { color: 'bg-indigo-100 text-indigo-700', label: 'Uploading' },
    'ai-processing': { color: 'bg-purple-100 text-purple-700', label: 'AI Processing' },
    'qc-review': { color: 'bg-amber-100 text-amber-700', label: 'QC Review' },
    'completed': { color: 'bg-green-100 text-green-700', label: 'Completed' },
    'planning': { color: 'bg-gray-100 text-gray-700', label: 'Planning' },
    'on-hold': { color: 'bg-red-100 text-red-700', label: 'On Hold' },
};

export const STAT_CARD_COLORS = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-emerald-600',
    orange: 'from-orange-500 to-amber-600',
    red: 'from-red-500 to-rose-600',
    purple: 'from-purple-500 to-indigo-600',
};

export const EVENT_TYPE_CONFIG = {
    inspection: { color: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
    maintenance: { color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
    meeting: { color: 'bg-purple-100 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
    deadline: { color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500' },
    other: { color: 'bg-gray-100 text-gray-700 border-gray-200', dot: 'bg-gray-500' },
};

export const getProjectStatusConfig = (status) =>
    PROJECT_STATUS_CONFIG[status] || PROJECT_STATUS_CONFIG['planning'];

export const getEquipmentStatusColor = (status) =>
    EQUIPMENT_STATUS_COLORS[status] || EQUIPMENT_STATUS_COLORS.offline;

export const getEventTypeConfig = (type) =>
    EVENT_TYPE_CONFIG[type] || EVENT_TYPE_CONFIG.other;

export const formatRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

