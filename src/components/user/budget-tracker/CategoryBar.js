"use client";

import React from "react";

const CategoryBar = React.memo(function CategoryBar({ category, amount, total, color }) {
  const pct = total > 0 ? Math.round((amount / total) * 100) : 0;

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-medium text-gray-700 flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${color}`} />
          {category}
        </span>
        <span className="text-gray-600">
          ${amount.toLocaleString()} <span className="text-gray-400">({pct}%)</span>
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
});

export default CategoryBar;
