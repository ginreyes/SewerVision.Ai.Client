"use client";

import React, { memo, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2 } from "lucide-react";

const CATEGORY_COLORS = {
  billing: "bg-amber-500",
  technical: "bg-blue-500",
  service: "bg-emerald-500",
  delivery: "bg-purple-500",
  quality: "bg-rose-500",
  communication: "bg-teal-500",
  other: "bg-gray-400",
};

const CategoryBreakdown = memo(({ byCategory, byPriority }) => {
  const categories = useMemo(() => {
    if (!byCategory) return [];
    return Object.entries(byCategory)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [byCategory]);

  const priorities = useMemo(() => {
    if (!byPriority) return [];
    return [
      { name: "High", count: byPriority.high || 0, color: "bg-red-500" },
      { name: "Medium", count: byPriority.medium || 0, color: "bg-amber-500" },
      { name: "Low", count: byPriority.low || 0, color: "bg-green-500" },
    ];
  }, [byPriority]);

  const maxCat = Math.max(...categories.map(c => c.count), 1);
  const maxPri = Math.max(...priorities.map(p => p.count), 1);

  return (
    <div className="grid grid-cols-2 gap-3 mb-5">
      {/* Category breakdown */}
      <Card className="border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-rose-500" />
            By Category
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {categories.length > 0 ? categories.map(c => (
            <div key={c.name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-700 capitalize">{c.name}</span>
                <span className="text-xs font-bold text-gray-900">{c.count}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${CATEGORY_COLORS[c.name] || "bg-gray-400"}`} style={{ width: `${(c.count / maxCat) * 100}%` }} />
              </div>
            </div>
          )) : (
            <p className="text-xs text-gray-400 py-4 text-center">No category data</p>
          )}
        </CardContent>
      </Card>

      {/* Priority breakdown */}
      <Card className="border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-rose-500" />
            By Priority
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {priorities.map(p => (
            <div key={p.name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-700">{p.name}</span>
                <span className="text-xs font-bold text-gray-900">{p.count}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${p.color}`} style={{ width: `${(p.count / maxPri) * 100}%` }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
});
CategoryBreakdown.displayName = 'CategoryBreakdown';

export default CategoryBreakdown;
