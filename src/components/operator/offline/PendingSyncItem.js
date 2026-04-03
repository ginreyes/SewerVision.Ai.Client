import React from "react";
import { Clock } from "lucide-react";

const PendingSyncItem = React.memo(function PendingSyncItem({ sync }) {
  return (
    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-100">
      <p className="text-xs text-gray-800">{sync.action}</p>
      <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
        <Clock className="w-3 h-3" />
        {sync.timestamp}
        <span>· {sync.size}</span>
      </div>
    </div>
  );
});

export default PendingSyncItem;
