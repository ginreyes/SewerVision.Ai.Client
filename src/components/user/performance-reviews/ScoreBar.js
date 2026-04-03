"use client";

import React from "react";

const ScoreBar = React.memo(function ScoreBar({ value, color = "bg-indigo-500", label }) {
  return (
    <div>
      {label && (
        <div className="flex justify-between text-xs mb-1.5">
          <span className="font-medium text-gray-700">{label}</span>
        </div>
      )}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
        </div>
        <span className="text-xs font-bold text-gray-700 w-8 text-right">{value}%</span>
      </div>
    </div>
  );
});

export default ScoreBar;
