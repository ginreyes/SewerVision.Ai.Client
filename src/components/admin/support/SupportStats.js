"use client";

import React, { memo } from "react";
import {
  AlertCircle, Clock, CheckCircle, XCircle, TrendingUp,
  Users, BarChart2, Timer,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const StatCard = memo(({ title, value, icon: Icon, color, bg, description, trend }) => (
  <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${bg}`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        {trend && (
          <span className={`text-[11px] font-semibold ${trend.startsWith('+') || trend.startsWith('-') ? (parseFloat(trend) >= 0 ? 'text-emerald-600' : 'text-red-500') : 'text-gray-400'}`}>
            {trend}
          </span>
        )}
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{title}</p>
      {description && <p className="text-[10px] text-gray-400 mt-1">{description}</p>}
    </CardContent>
  </Card>
));
StatCard.displayName = 'StatCard';

export default function SupportStats({ globalStats, tickets }) {
  const stats = {
    open: globalStats?.byStatus?.open || 0,
    inProgress: globalStats?.byStatus?.['in-progress'] || 0,
    resolved: globalStats?.byStatus?.resolved || 0,
    closed: globalStats?.byStatus?.closed || 0,
    total: globalStats?.total || 0,
    todayNew: globalStats?.todayNew || 0,
    avgResponseHours: globalStats?.avgResponseHours || 0,
  };

  const highPriority = globalStats?.byPriority?.high || 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-5">
      <StatCard title="Open Tickets" value={stats.open} icon={AlertCircle} color="text-amber-600" bg="bg-amber-50" />
      <StatCard title="In Progress" value={stats.inProgress} icon={Clock} color="text-blue-600" bg="bg-blue-50" />
      <StatCard title="Resolved" value={stats.resolved} icon={CheckCircle} color="text-emerald-600" bg="bg-emerald-50" />
      <StatCard title="Closed" value={stats.closed} icon={XCircle} color="text-gray-500" bg="bg-gray-50" />
      <StatCard title="New Today" value={stats.todayNew} icon={TrendingUp} color="text-rose-600" bg="bg-rose-50" />
      <StatCard
        title="Avg Response"
        value={stats.avgResponseHours > 0 ? `${stats.avgResponseHours.toFixed(1)}h` : '—'}
        icon={Timer}
        color="text-indigo-600"
        bg="bg-indigo-50"
      />
    </div>
  );
}
