"use client";

import React from "react";

function normalizeData(data) {
  if (!Array.isArray(data) || data.length === 0) return [];
  if (typeof data[0] === "number") {
    return data.map((value, i) => ({ value, label: String(i) }));
  }
  return data.map((d) => ({
    value: Number(d.value) || 0,
    label: d.label ?? "",
  }));
}

export default function BarChart({
  data,
  labels,
  maxValue,
  color,
  colorClass,
  height = 80,
  showValues = false,
  showLabels = false,
}) {
  const points = normalizeData(data).map((p, i) => ({
    ...p,
    label: labels?.[i] ?? p.label,
  }));
  if (!points.length) return null;

  const max = maxValue || Math.max(...points.map((p) => p.value), 1);
  const fillClass = colorClass || color || "bg-rose-500";

  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {points.map((p, i) => {
        const pixelHeight = Math.max(
          (p.value / max) * (showValues || showLabels ? height - 24 : height),
          p.value > 0 ? 4 : 0
        );
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            {showValues && (
              <span className="text-[10px] text-gray-400 font-medium">
                {p.value || ""}
              </span>
            )}
            <div
              className={`w-full rounded-t-md ${fillClass} opacity-80 hover:opacity-100 transition-all duration-500`}
              style={{ height: `${pixelHeight}px` }}
              title={`${p.label}: ${p.value}`}
            />
            {showLabels && (
              <span className="text-[10px] text-gray-400 truncate w-full text-center">
                {p.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
