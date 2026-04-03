"use client";

import React from "react";

export default function MetricGauge({ label, value, max, unit, color }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const danger = pct > 80;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600">{label}</span>
        <span className={`text-xs font-bold ${danger ? "text-red-600" : color}`}>
          {value}{unit} <span className="font-normal text-gray-400">/ {max}{unit}</span>
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${danger ? "bg-red-500" : "bg-emerald-500"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
