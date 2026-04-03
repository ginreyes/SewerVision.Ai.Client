"use client";

import React from "react";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TemplateCard = React.memo(function TemplateCard({ template, isSelected, onSelect, onToggleStar }) {
  const t = template;

  return (
    <button
      onClick={() => onSelect(t.id)}
      className={`w-full text-left p-3 rounded-xl border transition-all ${
        isSelected
          ? "border-indigo-300 bg-indigo-50"
          : "border-gray-200 bg-white hover:border-indigo-200"
      }`}
    >
      <div className="flex items-start justify-between gap-1 mb-1">
        <p className="text-sm font-semibold text-gray-900 leading-snug">{t.name}</p>
        <button
          onClick={e => {
            e.stopPropagation();
            onToggleStar(t.id);
          }}
          className="shrink-0"
        >
          <Star
            className={`w-3.5 h-3.5 ${
              t.starred ? "text-amber-400 fill-amber-400" : "text-gray-300"
            }`}
          />
        </button>
      </div>
      <Badge
        variant="outline"
        className="text-[10px] bg-indigo-50 text-indigo-700 border-indigo-200 mb-1"
      >
        {t.type}
      </Badge>
      <p className="text-[10px] text-gray-400">
        Used {t.usedCount} times · {t.tasks?.length ?? 0} tasks · {t.milestones?.length ?? 0} milestones
      </p>
    </button>
  );
});

export default TemplateCard;
