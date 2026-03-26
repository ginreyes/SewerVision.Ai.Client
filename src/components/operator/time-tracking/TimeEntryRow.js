import React from "react";
import { Badge } from "@/components/ui/badge";
import { TYPE_COLORS } from "./DataTypes";

const TimeEntryRow = React.memo(function TimeEntryRow({ entry }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-blue-100 transition-colors">
      <Badge variant="outline" className={`text-[10px] shrink-0 ${TYPE_COLORS[entry.type] || ""}`}>
        {entry.type}
      </Badge>
      <span className="text-xs font-mono text-gray-500 shrink-0">
        {entry.start} – {entry.end}
      </span>
      <span className="text-xs font-bold text-gray-900 shrink-0">{entry.hours}h</span>
      <span className="text-xs text-gray-500 flex-1 truncate">{entry.project}</span>
      {entry.notes && (
        <span className="text-xs text-gray-400 italic truncate max-w-xs">{entry.notes}</span>
      )}
    </div>
  );
});

export default TimeEntryRow;
