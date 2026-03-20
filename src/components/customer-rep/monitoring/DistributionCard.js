"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EmptySewerComponent from "@/components/shared/EmptySewerComponent";

/**
 * Horizontal bar chart card for status/category distributions.
 *
 * @param {string} title
 * @param {React.ReactNode} icon
 * @param {{ label: string, count: number, pct: number, color: string }[]} items
 */
export default function DistributionCard({ title, icon, items = [] }) {
  if (items.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">{icon} {title}</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptySewerComponent variant="no-data" title="No data yet" subtitle="Stats will appear as tickets are created" size="sm" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">{icon} {title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600 capitalize">{item.label}</span>
                <span className="text-sm font-semibold text-gray-900">{item.count} ({item.pct}%)</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className={`h-2.5 rounded-full ${item.color} transition-all`} style={{ width: `${item.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
