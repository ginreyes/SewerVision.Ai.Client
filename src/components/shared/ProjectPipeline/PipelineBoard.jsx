"use client";

import { memo, useCallback, useMemo } from "react";
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

/**
 * PipelineBoard — root of the kanban view. memo'd so parent page rerenders
 * (search/filter toolbar, debounced search) don't force a full column/card
 * re-render when the columns data is unchanged.
 */
function PipelineBoard({
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

  // Stable Set reference — rebuild only when selectedIds actually changes,
  // so memoized PipelineColumn / PipelineCard children don't rerender.
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

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

export default memo(PipelineBoard);
