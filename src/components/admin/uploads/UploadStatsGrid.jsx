"use client";

import React, { useMemo } from "react";
import { Files, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

const StatCard = ({ icon: Icon, value, label, color, bg }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all">
    <div className="flex items-center justify-between">
      <div className={`p-2 rounded-lg ${bg}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
    <div className="mt-3">
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
        {value}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
    </div>
  </div>
);

/**
 * UploadStatsGrid — 4 quick KPIs for the admin Files tab.
 */
export default function UploadStatsGrid({ uploads = [] }) {
  const stats = useMemo(() => {
    const list = Array.isArray(uploads) ? uploads : [];
    const total = list.length;
    const completed = list.filter((u) => u.status === "completed").length;
    const processing = list.filter(
      (u) => u.status === "processing" || u.status === "uploading"
    ).length;
    const failed = list.filter((u) => u.status === "failed").length;
    const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, processing, failed, successRate };
  }, [uploads]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard
        icon={Files}
        value={stats.total}
        label="Files (current page)"
        color="text-indigo-600 dark:text-indigo-400"
        bg="bg-indigo-50 dark:bg-indigo-900/30"
      />
      <StatCard
        icon={CheckCircle2}
        value={`${stats.completed} (${stats.successRate}%)`}
        label="Completed"
        color="text-emerald-600 dark:text-emerald-400"
        bg="bg-emerald-50 dark:bg-emerald-900/30"
      />
      <StatCard
        icon={Clock}
        value={stats.processing}
        label="In progress"
        color="text-amber-600 dark:text-amber-400"
        bg="bg-amber-50 dark:bg-amber-900/30"
      />
      <StatCard
        icon={AlertTriangle}
        value={stats.failed}
        label="Failed"
        color="text-rose-600 dark:text-rose-400"
        bg="bg-rose-50 dark:bg-rose-900/30"
      />
    </div>
  );
}
