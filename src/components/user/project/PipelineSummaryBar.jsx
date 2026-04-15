'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';

const STAGES = [
  { key: 'planning', label: 'Planning', color: 'bg-blue-500' },
  { key: 'field-capture', label: 'Field Capture', color: 'bg-rose-500' },
  { key: 'uploading', label: 'Uploading', color: 'bg-indigo-500' },
  { key: 'ai-processing', label: 'AI Processing', color: 'bg-purple-500' },
  { key: 'qc-review', label: 'QC Review', color: 'bg-amber-500' },
  { key: 'completed', label: 'Completed', color: 'bg-emerald-500' },
  { key: 'customer-notified', label: 'Notified', color: 'bg-teal-500' },
];

const PipelineSummaryBar = ({ counts = {}, activeFilter, onFilterChange }) => {
  const total = Object.values(counts).reduce((sum, n) => sum + (n || 0), 0);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Pipeline Overview</h3>
        <span className="text-xs text-gray-500">{total} total projects</span>
      </div>

      {/* Visual Bar */}
      {total > 0 && (
        <div className="flex rounded-full overflow-hidden h-3 mb-3 bg-gray-100">
          {STAGES.map(stage => {
            const count = counts[stage.key] || 0;
            if (count === 0) return null;
            const pct = (count / total) * 100;
            return (
              <div
                key={stage.key}
                className={`${stage.color} transition-all cursor-pointer hover:opacity-80`}
                style={{ width: `${pct}%` }}
                onClick={() => onFilterChange?.(activeFilter === stage.key ? null : stage.key)}
                title={`${stage.label}: ${count}`}
              />
            );
          })}
        </div>
      )}

      {/* Stage Labels */}
      <div className="flex flex-wrap gap-2">
        {STAGES.map(stage => {
          const count = counts[stage.key] || 0;
          const isActive = activeFilter === stage.key;
          return (
            <button
              key={stage.key}
              onClick={() => onFilterChange?.(isActive ? null : stage.key)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all ${
                isActive
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${stage.color}`} />
              {stage.label}
              <Badge variant="outline" className="text-[9px] h-4 px-1 ml-0.5">
                {count}
              </Badge>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PipelineSummaryBar;
