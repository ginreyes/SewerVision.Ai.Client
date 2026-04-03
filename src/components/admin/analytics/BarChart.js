"use client";

import React from "react";

export default function BarChart({ data, labels, color = "bg-rose-500", height = 80 }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className={`w-full rounded-t-sm ${color} opacity-80 hover:opacity-100 transition-opacity`}
            style={{ height: `${(v / max) * 100}%` }}
            title={`${labels?.[i] || i}: ${v}`}
          />
        </div>
      ))}
    </div>
  );
}
