"use client";

import { useMemo } from "react";

const STAGES = [
  "planning",
  "field-capture",
  "uploading",
  "ai-processing",
  "qc-review",
  "completed",
  "customer-notified",
];

const DEFAULT_LABELS = {
  planning: "Planning",
  "field-capture": "Field Capture",
  uploading: "Uploading",
  "ai-processing": "AI Processing",
  "qc-review": "QC Review",
  completed: "Completed",
  "customer-notified": "Customer Notified",
};

const CUSTOMER_LABELS = {
  planning: "Planning",
  "field-capture": "In the Field",
  uploading: "Uploading Data",
  "ai-processing": "AI Analysis",
  "qc-review": "Quality Check",
  completed: "Ready for You",
  "customer-notified": "Delivered",
};

const STAGE_COLORS = {
  planning: "bg-blue-500",
  "field-capture": "bg-rose-500",
  uploading: "bg-indigo-500",
  "ai-processing": "bg-purple-500",
  "qc-review": "bg-amber-500",
  completed: "bg-emerald-500",
  "customer-notified": "bg-teal-500",
};

const STAGE_RING_COLORS = {
  planning: "ring-blue-500/30",
  "field-capture": "ring-rose-500/30",
  uploading: "ring-indigo-500/30",
  "ai-processing": "ring-purple-500/30",
  "qc-review": "ring-amber-500/30",
  completed: "ring-emerald-500/30",
  "customer-notified": "ring-teal-500/30",
};

export default function PipelineProgressBar({
  currentStatus,
  size = "md",
  showLabels = true,
  customerFriendly = false,
}) {
  const labels = customerFriendly ? CUSTOMER_LABELS : DEFAULT_LABELS;

  const currentIndex = useMemo(
    () => STAGES.indexOf(currentStatus),
    [currentStatus]
  );

  const dotSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";
  const fontSize = size === "sm" ? "text-[10px]" : "text-xs";
  const displayLabels = size === "sm" ? false : showLabels;

  return (
    <div className="flex items-center w-full">
      {STAGES.map((stage, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isFuture = index > currentIndex;

        return (
          <div key={stage} className="flex items-center flex-1 last:flex-none">
            {/* Dot + Label group */}
            <div className="flex flex-col items-center">
              <div className="relative flex items-center justify-center">
                {/* Dot */}
                {isCompleted && (
                  <span
                    className={`${dotSize} rounded-full bg-emerald-500`}
                  />
                )}
                {isCurrent && (
                  <span
                    className={`${dotSize} rounded-full ${STAGE_COLORS[stage]} ring-4 ${STAGE_RING_COLORS[stage]} animate-pulse`}
                  />
                )}
                {isFuture && (
                  <span
                    className={`${dotSize} rounded-full border-2 border-gray-300 bg-white`}
                  />
                )}
              </div>
              {displayLabels && (
                <span
                  className={`${fontSize} mt-1.5 text-center whitespace-nowrap ${
                    isCurrent
                      ? "text-gray-900 font-medium"
                      : isCompleted
                      ? "text-emerald-600"
                      : "text-gray-400"
                  }`}
                >
                  {labels[stage]}
                </span>
              )}
            </div>

            {/* Connecting line (not after last dot) */}
            {index < STAGES.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1 ${
                  index < currentIndex ? "bg-emerald-500" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
