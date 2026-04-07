"use client";

import { TrendingUp, TrendingDown, Video, CheckCircle, Zap, Clipboard } from "lucide-react";

const ProgressTracker = ({ stats }) => {
  if (!stats) return null;

  const items = [
    {
      label: "Projects Completed",
      value: stats.completedProjects ?? stats.completed ?? 0,
      prev: stats.prevCompletedProjects ?? 0,
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      ring: "#10b981",
    },
    {
      label: "Videos Uploaded",
      value: stats.totalUploads ?? stats.videosUploaded ?? 0,
      prev: stats.prevUploads ?? 0,
      icon: Video,
      color: "text-blue-600",
      bg: "bg-blue-50",
      ring: "#3b82f6",
    },
    {
      label: "AI Success Rate",
      value: stats.aiSuccessRate ?? stats.aiAccuracy ?? 0,
      suffix: "%",
      icon: Zap,
      color: "text-violet-600",
      bg: "bg-violet-50",
      ring: "#8b5cf6",
    },
    {
      label: "Inspections",
      value: stats.activeOperations ?? stats.fieldInspections ?? 0,
      prev: stats.prevInspections ?? 0,
      icon: Clipboard,
      color: "text-amber-600",
      bg: "bg-amber-50",
      ring: "#f59e0b",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="text-sm font-bold text-gray-800 mb-4">Your Progress</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item) => {
          const Icon = item.icon;
          const trend = item.prev ? item.value - item.prev : 0;
          const pct = item.suffix === "%" ? item.value : (item.value > 0 ? Math.min(100, item.value * 10) : 0);

          return (
            <div key={item.label} className="text-center">
              {/* Progress Ring */}
              <div className="relative w-16 h-16 mx-auto mb-2">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="#f3f4f6" strokeWidth="4" />
                  <circle cx="32" cy="32" r="28" fill="none" stroke={item.ring} strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 28}
                    strokeDashoffset={2 * Math.PI * 28 * (1 - pct / 100)}
                    className="transition-all duration-700"
                  />
                </svg>
                <div className={`absolute inset-0 flex items-center justify-center ${item.bg} rounded-full m-2`}>
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
              </div>

              <p className="text-lg font-bold text-gray-900">{item.value}{item.suffix || ''}</p>
              <p className="text-[10px] text-gray-500 mb-1">{item.label}</p>

              {trend !== 0 && (
                <div className={`inline-flex items-center gap-0.5 text-[10px] font-medium ${trend > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {trend > 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                  {trend > 0 ? '+' : ''}{trend} vs last month
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressTracker;
