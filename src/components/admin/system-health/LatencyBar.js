"use client";

import React from "react";

export default function LatencyBar({ ms, max = 1000 }) {
  const pct = Math.min((ms / max) * 100, 100);
  const color = ms < 100 ? "bg-emerald-500" : ms < 500 ? "bg-amber-500" : "bg-red-500";
  const textColor = ms < 100 ? "text-emerald-600" : ms < 500 ? "text-amber-600" : "text-red-600";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-[11px] font-mono font-medium w-12 text-right ${textColor}`}>{ms}ms</span>
    </div>
  );
}
