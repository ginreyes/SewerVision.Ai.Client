"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { STATUS_COLORS } from "./DataTypes";

const BudgetCard = React.memo(function BudgetCard({ project, isSelected, onSelect }) {
  const pct = Math.round((project.spent / project.budget) * 100);
  const over = project.spent > project.budget;

  return (
    <button
      onClick={() => onSelect(project.id)}
      className={`w-full text-left p-3 rounded-xl border transition-all ${
        isSelected
          ? "border-indigo-300 bg-indigo-50"
          : "border-gray-200 bg-white hover:border-indigo-200"
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-semibold text-gray-900 truncate max-w-[150px]">
          {project.name}
        </p>
        <Badge
          variant="outline"
          className={`text-[10px] shrink-0 ${STATUS_COLORS[project.status] || ""}`}
        >
          {project.status}
        </Badge>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
        <div
          className={`h-full rounded-full ${
            over ? "bg-red-500" : pct > 80 ? "bg-amber-500" : "bg-indigo-500"
          }`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-gray-400">
        <span>${project.spent.toLocaleString()}</span>
        <span className={over ? "text-red-600 font-medium" : ""}>
          {pct}% of ${project.budget.toLocaleString()}
        </span>
      </div>
    </button>
  );
});

export default BudgetCard;
