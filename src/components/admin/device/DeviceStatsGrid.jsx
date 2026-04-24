"use client";

import React, { useMemo } from "react";
import {
  Monitor,
  Wifi,
  WifiOff,
  AlertTriangle,
  Activity,
} from "lucide-react";

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
 * DeviceStatsGrid — 4 quick KPIs across the top of the devices page.
 */
export default function DeviceStatsGrid({ devices = [] }) {
  const stats = useMemo(() => {
    const list = Array.isArray(devices) ? devices : [];
    const total = list.length;
    const online = list.filter((d) =>
      ["online", "active", "recording", "uploading", "processing"].includes(d.status)
    ).length;
    const offline = list.filter((d) => !d.status || d.status === "offline").length;
    const unassigned = list.filter((d) => !d.teamLeader).length;
    return { total, online, offline, unassigned };
  }, [devices]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard
        icon={Monitor}
        value={stats.total}
        label="Total devices"
        color="text-indigo-600 dark:text-indigo-400"
        bg="bg-indigo-50 dark:bg-indigo-900/30"
      />
      <StatCard
        icon={Wifi}
        value={stats.online}
        label="Online / Active"
        color="text-emerald-600 dark:text-emerald-400"
        bg="bg-emerald-50 dark:bg-emerald-900/30"
      />
      <StatCard
        icon={WifiOff}
        value={stats.offline}
        label="Offline"
        color="text-gray-600 dark:text-gray-300"
        bg="bg-gray-100 dark:bg-gray-700"
      />
      <StatCard
        icon={AlertTriangle}
        value={stats.unassigned}
        label="Unassigned"
        color="text-amber-600 dark:text-amber-400"
        bg="bg-amber-50 dark:bg-amber-900/30"
      />
    </div>
  );
}
