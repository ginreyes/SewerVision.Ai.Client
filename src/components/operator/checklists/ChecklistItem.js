import React from "react";
import { CheckCircle2, Circle, Camera } from "lucide-react";

const ChecklistItem = React.memo(function ChecklistItem({ item, index, onToggle }) {
  return (
    <button
      onClick={() => onToggle(item.id)}
      className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${
        item.done
          ? "border-emerald-200 bg-emerald-50"
          : "border-gray-100 hover:border-blue-200 hover:bg-blue-50/30"
      }`}
    >
      {item.done ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
      ) : (
        <Circle className="w-5 h-5 text-gray-300 shrink-0 mt-0.5" />
      )}
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${item.done ? "text-gray-400 line-through" : "text-gray-800"}`}>
          {item.label}
        </p>
        {item.requiresPhoto && (
          <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
            <Camera className="w-3 h-3" />Photo required
            {item.photo && <span className="text-emerald-600">— {item.photo} ✓</span>}
          </span>
        )}
      </div>
    </button>
  );
});

export default ChecklistItem;
