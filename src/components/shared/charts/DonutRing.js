"use client";

import React from "react";

export default function DonutRing({
  pct,
  size = 80,
  stroke = 8,
  color,
  colorClass,
  label,
  sublabel,
  showPercentInside = true,
}) {
  const safePct = Math.max(0, Math.min(100, Number(pct) || 0));
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (safePct / 100) * circ;
  const offset = circ - dash;
  const center = size / 2;
  const fontSize = Math.max(10, Math.round(size / 6));

  const strokeAttrs = colorClass
    ? { className: colorClass }
    : { stroke: color || "#0d9488" };

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={stroke}
        />
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          {...strokeAttrs}
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        {showPercentInside && (
          <text
            x={center}
            y={center + fontSize / 3}
            textAnchor="middle"
            fontSize={fontSize}
            fontWeight="bold"
            fill="#111"
            transform={`rotate(90 ${center} ${center})`}
          >
            {safePct}%
          </text>
        )}
      </svg>
      {(label || sublabel) && (
        <div className="text-center -mt-1">
          {label && <p className="text-xs text-gray-600">{label}</p>}
          {sublabel && <p className="text-[10px] text-gray-400">{sublabel}</p>}
        </div>
      )}
    </div>
  );
}
