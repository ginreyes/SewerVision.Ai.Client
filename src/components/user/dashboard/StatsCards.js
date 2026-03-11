'use client';

import { FolderOpen, User, UserCheck, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const STATS = [
    { key: 'projects', label: 'Projects', icon: FolderOpen, gradient: 'from-rose-50 to-pink-50', iconColor: 'text-rose-500' },
    { key: 'operators', label: 'Operators', icon: User, gradient: 'from-indigo-50 to-purple-50', iconColor: 'text-indigo-500' },
    { key: 'qc', label: 'QC Technicians', icon: UserCheck, gradient: 'from-emerald-50 to-green-50', iconColor: 'text-emerald-500' },
    { key: 'reports', label: 'Reports', icon: FileText, gradient: 'from-amber-50 to-orange-50', iconColor: 'text-amber-500' },
];

export default function StatsCards({ projectCount = 0, operatorCount = 0, qcCount = 0, reportsCount = 0 }) {
    const values = { projects: projectCount, operators: operatorCount, qc: qcCount, reports: reportsCount };

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map(({ key, label, icon: Icon, gradient, iconColor }) => (
                <Card key={key} className={`border-0 shadow-sm bg-gradient-to-br ${gradient}`}>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{values[key]}</p>
                            </div>
                            <Icon className={`w-8 h-8 ${iconColor} opacity-80`} />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
