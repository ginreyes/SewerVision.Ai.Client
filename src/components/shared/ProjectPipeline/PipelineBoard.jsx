"use client";

import { useCallback, useState } from "react";
import PipelineColumn from "./PipelineColumn";
import PipelineSkeleton from "./PipelineSkeleton";

const STAGES = [
  "planning",
  "field-capture",
  "uploading",
  "ai-processing",
  "qc-review",
  "completed",
  "customer-notified",
];

export default function PipelineBoard({
  columns,
  counts,
  isLoading = false,
  quickActionsFactory,
  onProjectClick,
  showSLA = false,
  accentColor = "rose",
  enableBulkSelect = false,
  selectedIds = [],
  onSelectionChange,
}) {
  // If loading and no column data yet, show full skeleton
  if (isLoading && (!columns || Object.keys(columns).length === 0)) {
    return <PipelineSkeleton />;
  }

  const handleSelect = useCallback(
    (projectId, checked) => {
      if (!onSelectionChange) return;
      if (checked) {
        onSelectionChange([...selectedIds, projectId]);
      } else {
        onSelectionChange(selectedIds.filter((id) => id !== projectId));
      }
    },
    [selectedIds, onSelectionChange]
  );

  const selectedSet = new Set(selectedIds);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STAGES.map((stage) => (
        <PipelineColumn
          key={stage}
          status={stage}
          projects={columns?.[stage] || []}
          count={counts?.[stage] ?? (columns?.[stage] || []).length}
          isLoading={isLoading}
          quickActions={quickActionsFactory}
          onProjectClick={onProjectClick}
          showSLA={showSLA}
          accentColor={accentColor}
          onSelect={enableBulkSelect ? handleSelect : undefined}
          selectedIds={selectedSet}
        />
      ))}
    </div>
  );
}
