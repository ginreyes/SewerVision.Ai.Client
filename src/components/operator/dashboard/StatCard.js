'use client';

import { STAT_CARD_COLORS } from '@/components/operator/constants';

export default function StatCard({ icon: Icon, value, label, color = 'blue', suffix = '' }) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${STAT_CARD_COLORS[color] || STAT_CARD_COLORS.blue}`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
            </div>
            <div className="mt-3">
                <p className="text-2xl font-bold text-gray-900">{value}{suffix}</p>
                <p className="text-sm text-gray-500">{label}</p>
            </div>
        </div>
    );
}
