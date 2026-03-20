'use client';

import { CheckCircle2, AlertTriangle, Activity } from 'lucide-react';

export default function ActivityItem({ activity }) {
    const bgColor =
        activity.type === 'success' ? 'bg-green-100' :
        activity.type === 'warning' ? 'bg-yellow-100' :
        activity.type === 'error' ? 'bg-red-100' : 'bg-blue-100';

    const icon =
        activity.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-green-600" /> :
        activity.type === 'warning' ? <AlertTriangle className="w-4 h-4 text-yellow-600" /> :
        activity.type === 'error' ? <AlertTriangle className="w-4 h-4 text-red-600" /> :
        <Activity className="w-4 h-4 text-blue-600" />;

    return (
        <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
            <div className={`p-1.5 rounded-lg ${bgColor}`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate">{activity.message}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
        </div>
    );
}
