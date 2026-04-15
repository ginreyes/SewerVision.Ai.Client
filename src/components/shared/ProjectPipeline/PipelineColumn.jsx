"use client";

import PipelineCard from "./PipelineCard";

// ---------------------------------------------------------------------------
// Constants (shared with PipelineProgressBar)
// ---------------------------------------------------------------------------

const STATUS_LABELS = {
  planning: "Planning",
  "field-capture": "Field Capture",
  uploading: "Uploading",
  "ai-processing": "AI Processing",
  "qc-review": "QC Review",
  completed: "Completed",
  "customer-notified": "Customer Notified",
};

const STATUS_BAR_COLORS = {
  planning: "bg-blue-500",
  "field-capture": "bg-rose-500",
  uploading: "bg-indigo-500",
  "ai-processing": "bg-purple-500",
  "qc-review": "bg-amber-500",
  completed: "bg-emerald-500",
  "customer-notified": "bg-teal-500",
};

// ---------------------------------------------------------------------------
// Skeleton card placeholder
// ---------------------------------------------------------------------------

function SkeletonCard({ delay = 0 }) {
  return (
    <div
      className="h-32 rounded-xl bg-gray-100 animate-pulse"
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PipelineColumn({
  status,
  projects = [],
  count,
  isLoading = false,
  quickActions,
  onProjectClick,
  showSLA = false,
  accentColor = "rose",
  onSelect,
  selectedIds,
}) {
  const label = STATUS_LABELS[status] || status;
  const barColor = STATUS_BAR_COLORS[status] || "bg-gray-400";
  const displayCount = count ?? projects.length;

  const selectedSet =
    selectedIds instanceof Set
      ? selectedIds
      : new Set(Array.isArray(selectedIds) ? selectedIds : []);

  return (
    <div className="min-w-[260px] max-w-[300px] flex flex-col bg-gray-50/60 rounded-xl border border-gray-200">
      {/* Color bar */}
      <div className={`h-[3px] rounded-t-xl ${barColor}`} />

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <span className="text-sm font-semibold text-gray-700 capitalize">
          {label}
        </span>
        <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 text-[11px] font-medium rounded-full bg-gray-200 text-gray-600">
          {displayCount}
        </span>
      </div>

      {/* Cards list */}
      <div className="flex-1 overflow-y-auto max-h-[calc(100vh-280px)] px-2 pb-2 space-y-2">
        {isLoading ? (
          <>
            <SkeletonCard delay={0} />
            <SkeletonCard delay={75} />
            <SkeletonCard delay={150} />
          </>
        ) : projects.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">No projects</p>
        ) : (
          projects.map((project) => (
            <PipelineCard
              key={project._id}
              project={project}
              quickActions={quickActions ? quickActions(project) : []}
              onClick={onProjectClick}
              showSLA={showSLA}
              accentColor={accentColor}
              selected={selectedSet.has(project._id)}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </div>
  );
}
