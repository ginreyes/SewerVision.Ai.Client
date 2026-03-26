import React from "react";
import { FolderOpen } from "lucide-react";
import { TYPE_ICONS, TYPE_COLORS } from "./DataTypes";

const CachedItemRow = React.memo(function CachedItemRow({ item, onToggle }) {
  const Icon = TYPE_ICONS[item.type] || FolderOpen;

  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 hover:border-blue-100 transition-colors">
      <span className={`p-1.5 rounded-lg ${TYPE_COLORS[item.type] || ""}`}>
        <Icon className="w-3.5 h-3.5" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-900 truncate">{item.name}</p>
        <p className="text-[10px] text-gray-400">
          {item.size}
          {item.lastSync && ` · Synced ${item.lastSync}`}
        </p>
      </div>
      <button
        onClick={() => onToggle(item.id)}
        className={`shrink-0 w-8 h-5 rounded-full transition-colors ${
          item.cached ? "bg-blue-600" : "bg-gray-200"
        }`}
      >
        <div
          className={`w-3.5 h-3.5 rounded-full bg-white shadow transition-transform mx-auto ${
            item.cached ? "translate-x-1.5" : "-translate-x-1.5"
          }`}
        />
      </button>
    </div>
  );
});

export default CachedItemRow;
