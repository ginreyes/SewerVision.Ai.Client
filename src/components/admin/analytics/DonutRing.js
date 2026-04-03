"use client";

import React from "react";

export default function DonutRing({ pct, color, size = 80, label }) {
  const r = 30;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox="0 0 70 70">
        <circle cx="35" cy="35" r={r} fill="none" stroke="#f3f4f6" strokeWidth="8" />
        <circle cx="35" cy="35" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`} strokeDashoffset={circ / 4} strokeLinecap="round" />
        <text x="35" y="39" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#111">{pct}%</text>
      </svg>
      {label && <p className="text-xs text-gray-500 mt-1 text-center">{label}</p>}
    </div>
  );
}
