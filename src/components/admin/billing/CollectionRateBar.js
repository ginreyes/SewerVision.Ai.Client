"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function CollectionRateBar({ stats }) {
  const total = stats.total || 1;
  return (
    <Card className="border-gray-200 mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Collection Rate</span>
          <span className="text-sm font-bold text-emerald-600">{Math.round((stats.paid / total) * 100)}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
          <div className="bg-emerald-500 h-full transition-all" style={{ width: `${(stats.paid / total) * 100}%` }} />
          <div className="bg-amber-400 h-full transition-all" style={{ width: `${(stats.pending / total) * 100}%` }} />
          <div className="bg-red-500 h-full transition-all" style={{ width: `${(stats.overdue / total) * 100}%` }} />
        </div>
        <div className="flex items-center gap-4 mt-2 text-[10px] text-gray-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />Paid</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" />Pending</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />Overdue</span>
        </div>
      </CardContent>
    </Card>
  );
}
