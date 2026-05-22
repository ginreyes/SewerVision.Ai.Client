"use client";

import React from "react";
import { useProjectHealth } from "@/hooks/useQueryHooks";
import { Activity, Loader2, AlertTriangle } from "lucide-react";

const LEVEL_STYLES = {
  low: {
    pip: "bg-emerald-400",
    text: "text-emerald-50",
    label: "Healthy",
  },
  medium: {
    pip: "bg-amber-400",
    text: "text-amber-50",
    label: "Watch",
  },
  high: {
    pip: "bg-orange-500",
    text: "text-orange-50",
    label: "At risk",
  },
  critical: {
    pip: "bg-red-500",
    text: "text-red-50",
    label: "Critical",
  },
};

function FactorRow({ label, value }) {
  return (
    <div className="flex justify-between gap-3 text-[11px]">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium text-gray-100">{value}</span>
    </div>
  );
}

export default function ProjectHealthBadge({ projectId, compact = false, onClick }) {
  const { data, isLoading, isError } = useProjectHealth(projectId);

  if (!projectId) return null;

  if (isLoading) {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium text-white/80"
        title="Computing health…"
      >
        <Loader2 className="w-2.5 h-2.5 animate-spin" />
        {!compact && "Health"}
      </span>
    );
  }

  if (isError || !data) {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium text-white/80"
        title="Health unavailable"
      >
        <AlertTriangle className="w-2.5 h-2.5" />
        {!compact && "—"}
      </span>
    );
  }

  const style = LEVEL_STYLES[data.level] || LEVEL_STYLES.low;
  const factors = data.factors || {};

  return (
    <div className="relative group" onClick={(e) => { e.stopPropagation(); onClick?.(data); }}>
      <span
        className={`inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium ${style.text} cursor-help`}
      >
        <span className={`inline-block w-2 h-2 rounded-full ${style.pip}`} />
        {compact ? `${data.score}` : (
          <>
            <Activity className="w-2.5 h-2.5" />
            {style.label} · {data.score}
          </>
        )}
      </span>

      {/* Tooltip */}
      <div className="pointer-events-none absolute right-0 top-full z-50 mt-1 hidden w-64 rounded-md bg-gray-900 p-3 text-left shadow-xl ring-1 ring-black/40 group-hover:block">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-white">Health · {data.score}/100</span>
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${style.pip}`} />
        </div>
        <div className="space-y-1">
          <FactorRow label="Age" value={`${factors.ageDays ?? 0}d`} />
          <FactorRow
            label="Confidence drift"
            value={
              factors.confidenceDrift > 0
                ? `+${factors.confidenceDrift}`
                : factors.confidenceDrift ?? "0"
            }
          />
          <FactorRow
            label="QC stuck"
            value={factors.overdueQc ? `${factors.qcStuckHours ?? "?"}h` : "no"}
          />
          <FactorRow
            label="Missing snapshots"
            value={factors.missingSnapshots ? "yes" : "no"}
          />
          <FactorRow label="SLA breach" value={factors.slaBreach ? "yes" : "no"} />
        </div>
        {factors.estimatedCompletion && (
          <p className="mt-2 text-[10px] text-gray-500">
            ETA {new Date(factors.estimatedCompletion).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}
