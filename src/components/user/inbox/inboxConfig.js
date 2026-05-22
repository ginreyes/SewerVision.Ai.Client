import { FileText, Zap, Activity, Settings, Shield, AlertTriangle, AtSign } from 'lucide-react';

export const typeConfig = {
    report_ready: {
        label: 'Report',
        color: 'bg-emerald-50 text-emerald-700',
        avatar: 'from-emerald-400 to-teal-500',
        icon: FileText,
    },
    ai_complete: {
        label: 'AI',
        color: 'bg-indigo-50 text-indigo-700',
        avatar: 'from-indigo-400 to-violet-500',
        icon: Zap,
    },
    status_update: {
        label: 'Update',
        color: 'bg-sky-50 text-sky-700',
        avatar: 'from-sky-400 to-blue-500',
        icon: Activity,
    },
    system: {
        label: 'System',
        color: 'bg-slate-50 text-slate-700',
        avatar: 'from-slate-400 to-gray-500',
        icon: Settings,
    },
    qc_review: {
        label: 'QC',
        color: 'bg-purple-50 text-purple-700',
        avatar: 'from-purple-400 to-fuchsia-500',
        icon: Shield,
    },
    defect_found: {
        label: 'Defect',
        color: 'bg-rose-50 text-rose-700',
        avatar: 'from-rose-400 to-pink-500',
        icon: AlertTriangle,
    },
    chat_mention: {
        label: 'Mention',
        color: 'bg-rose-50 text-rose-700',
        avatar: 'from-rose-400 to-pink-500',
        icon: AtSign,
    },
};

export const getDateLabel = (dateStr) => {
    if (!dateStr) return 'Unknown';
    const d = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const msgDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    if (msgDate.getTime() === today.getTime()) return 'Today';
    if (msgDate.getTime() === yesterday.getTime()) return 'Yesterday';

    const diffDays = Math.floor((today.getTime() - msgDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) return d.toLocaleDateString('en-US', { weekday: 'long' });

    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const getTimeLabel = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};
