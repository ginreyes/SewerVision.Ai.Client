"use client";

import React from "react";

export default function TeamProductivityTable({ data }) {
  return (
    <div className="space-y-3">
      {data.map(t => (
        <div key={t.name}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-800">{t.name}</span>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>{t.completed} tasks</span>
              <span className="text-[11px] font-bold text-rose-600">{t.score}%</span>
            </div>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-rose-500 rounded-full" style={{ width: `${t.score}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
