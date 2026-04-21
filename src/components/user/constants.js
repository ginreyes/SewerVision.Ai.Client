/**
 * User (Team Lead) Role Constants
 *
 * Role-specific color configs live in this file (shapes like single string
 * class names). For the centralized {bg, text, border, hex, dark} shape
 * used across the app, re-exported below from @/lib/statusConfig.
 */

import { BACKEND_URL } from '@/lib/config';

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
} from '@/lib/statusConfig';

export const CHART_COLORS = ['#D76A84', '#696CFF', '#10B981', '#F59E0B', '#6366F1', '#EC4899'];

export const ROLE_STYLE = {
    operator: {
        bg: '/background_pictures/operator_background.jpg',
        label: 'Operator',
        overlay: 'from-amber-900/70 via-orange-900/50 to-transparent',
    },
    'qc-technician': {
        bg: '/background_pictures/qc-techinician_background.jpg',
        label: 'QC Technician',
        overlay: 'from-violet-900/70 via-purple-900/50 to-transparent',
    },
};

export const DEVICE_STATUS_CONFIG = {
    online: {
        color: 'bg-emerald-500',
        ping: 'bg-emerald-400',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        label: 'Online',
    },
    offline: {
        color: 'bg-slate-400',
        ping: 'bg-slate-300',
        badge: 'bg-slate-50 text-slate-600 border-slate-200',
        label: 'Offline',
    },
    maintenance: {
        color: 'bg-amber-500',
        ping: 'bg-amber-400',
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        label: 'Maintenance',
    },
    decommissioned: {
        color: 'bg-red-400',
        ping: 'bg-red-300',
        badge: 'bg-red-50 text-red-600 border-red-200',
        label: 'Decommissioned',
    },
};

export const EVENT_CATEGORIES = ['Personal', 'Business', 'Family', 'Holiday', 'Etc'];

export const getRoleStyle = (role) => ROLE_STYLE[role] || ROLE_STYLE.operator;
export const getDeviceStatusConfig = (status) => DEVICE_STATUS_CONFIG[status] || DEVICE_STATUS_CONFIG.offline;

export const getAvatarUrl = (id) =>
    id ? `${BACKEND_URL}/api/users/avatar/${id}` : null;

export const getInitials = (name) => {
    if (!name || name === '—') return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return (name[0] || '?').toUpperCase();
};

export const getUserDisplayName = (user) => {
    if (!user) return { name: 'Unassigned', initials: '?', avatar: '' };
    const name =
        [user.first_name, user.last_name].filter(Boolean).join(' ').trim() ||
        user.username ||
        'Unassigned';
    const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    return { name, initials, avatar: user.avatar || '' };
};

export const PROJECT_STATUS_COLORS = {
    planning: 'bg-slate-100 text-slate-800',
    'field-capture': 'bg-blue-100 text-blue-800',
    uploading: 'bg-indigo-100 text-indigo-800',
    'ai-processing': 'bg-yellow-100 text-yellow-800',
    'qc-review': 'bg-purple-100 text-purple-800',
    'in-progress': 'bg-emerald-100 text-emerald-800',
    completed: 'bg-green-100 text-green-800',
    'customer-notified': 'bg-teal-100 text-teal-800',
    'on-hold': 'bg-gray-100 text-gray-600',
};

export const PROJECT_PRIORITY_COLORS = {
    high: 'text-red-600',
    medium: 'text-yellow-600',
    low: 'text-green-600',
};

export const REPORT_STATUS_CONFIG = {
    completed: { label: 'Completed', className: 'bg-green-100 text-green-700 border-green-200' },
    'in-review': { label: 'In Review', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    pending: { label: 'Pending', className: 'bg-blue-100 text-blue-700 border-blue-200' },
    draft: { label: 'Draft', className: 'bg-gray-100 text-gray-700 border-gray-200' },
};

export const getProjectStatusColor = (status) =>
    PROJECT_STATUS_COLORS[status] || 'bg-gray-100 text-gray-600';

export const getProjectPriorityColor = (priority) =>
    PROJECT_PRIORITY_COLORS[priority] || 'text-gray-600';
