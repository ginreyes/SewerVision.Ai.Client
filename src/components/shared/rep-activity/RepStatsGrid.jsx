"use client";

import React, { useMemo } from "react";
import { Users, Gauge, Clock, AlertTriangle } from "lucide-react";

const StatCard = ({ icon: Icon, value, label, color, bg }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all">
    <div className="flex items-center justify-between">
      <div className={`p-2 rounded-lg ${bg}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
    <div className="mt-3">
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
    </div>
  </div>
);

export default function RepStatsGrid({ entries = [] }) {
  const stats = useMemo(() => {
    const list = Array.isArray(entries) ? entries : [];
    const total = list.length;
    const heavy = list.filter((e) => e.workload === "heavy").length;
    const overtimePending = list.reduce((s, e) => s + (e.overtime?.pendingHours || 0), 0);

    const slaValues = list
      .map((e) => e.slaCompliance)
      .filter((v) => typeof v === "number");
    const avgSla = slaValues.length
      ? Math.round((slaValues.reduce((s, v) => s + v, 0) / slaValues.length) * 100)
      : null;

    return { total, heavy, overtimePending, avgSla };
  }, [entries]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard
        icon={Users}
        value={stats.total}
        label="Total reps"
        color="text-indigo-600 dark:text-indigo-400"
        bg="bg-indigo-50 dark:bg-indigo-900/30"
      />
      <StatCard
        icon={Gauge}
        value={stats.avgSla == null ? "—" : `${stats.avgSla}%`}
        label="Avg SLA compliance"
        color="text-emerald-600 dark:text-emerald-400"
        bg="bg-emerald-50 dark:bg-emerald-900/30"
      />
      <StatCard
        icon={Clock}
        value={`${stats.overtimePending}h`}
        label="Overtime pending"
        color="text-amber-600 dark:text-amber-400"
        bg="bg-amber-50 dark:bg-amber-900/30"
      />
      <StatCard
        icon={AlertTriangle}
        value={stats.heavy}
        label="Heavy workload"
        color="text-rose-600 dark:text-rose-400"
        bg="bg-rose-50 dark:bg-rose-900/30"
      />
    </div>
  );
}
