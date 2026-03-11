/**
 * User (Team Lead) Role Constants
 */

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
    id ? `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/users/avatar/${id}` : null;

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
