"use client";

import React from "react";
import { Plus } from "lucide-react";

const ScheduleCell = React.memo(function ScheduleCell({ assignment, onClick }) {
  if (assignment) {
    return (
      <div
        onClick={() => onClick?.(assignment)}
        className={`rounded-lg border px-2 py-1.5 text-left cursor-pointer hover:opacity-80 transition-opacity ${assignment.color || "bg-gray-100 text-gray-800 border-gray-200"}`}
      >
        <p className="text-[10px] font-semibold truncate">{assignment.project}</p>
        <p className="text-[9px] opacity-75">{assignment.type}</p>
      </div>
    );
  }

  return (
    <button
      onClick={() => onClick?.(null)}
      className="w-full h-12 rounded-lg border-2 border-dashed border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors flex items-center justify-center"
    >
      <Plus className="w-3.5 h-3.5 text-gray-300" />
    </button>
  );
});

export default ScheduleCell;
