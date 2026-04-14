'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';

const COLOR_MAP = {
    blue:   'from-blue-500 to-blue-600',
    red:    'from-red-500 to-rose-600',
    green:  'from-green-500 to-emerald-600',
    amber:  'from-amber-500 to-orange-500',
    purple: 'from-purple-500 to-indigo-600',
    teal:   'from-teal-500 to-teal-600',
    indigo: 'from-indigo-500 to-indigo-600',
    rose:   'from-rose-500 to-rose-600',
};

export default function GenericStatCard({
    icon: Icon,
    label,
    value,
    subtitle,
    color = 'blue',
    trend,
    className = '',
}) {
    const gradient = COLOR_MAP[color] || COLOR_MAP.blue;

    return (
        <div
            className={`bg-white dark:bg-zinc-800 rounded-xl border border-gray-100 dark:border-zinc-700 p-4 hover:shadow-md transition-all ${className}`}
        >
            <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient}`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>

                {trend && (
                    <span
                        className={`inline-flex items-center gap-1 text-xs font-medium ${
                            trend.positive
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                        }`}
                    >
                        {trend.positive ? (
                            <TrendingUp className="w-3 h-3" />
                        ) : (
                            <TrendingDown className="w-3 h-3" />
                        )}
                        {trend.value}
                    </span>
                )}
            </div>

            <div className="mt-3">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {value}
                </p>
                <p className="text-sm text-gray-500 dark:text-zinc-400">
                    {label}
                </p>
                {subtitle && (
                    <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    );
}
