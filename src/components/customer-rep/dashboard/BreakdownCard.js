"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * Reusable card for showing category/priority breakdowns.
 *
 * @param {string} title - Card title
 * @param {React.ReactNode} icon - Title icon
 * @param {'badge' | 'dot'} variant - 'badge' shows counts as badges, 'dot' shows colored dots + values
 * @param {{ name: string, count: number, color?: string }[]} items
 */
export default function BreakdownCard({ title, icon, variant = "badge", items = [] }) {
  if (items.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">{icon}{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400 text-center py-4">No data yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">{icon}{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item) =>
            variant === "dot" ? (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${item.color || "bg-gray-400"}`} />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{item.count}</span>
              </div>
            ) : (
              <div key={item.name} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">{item.name}</span>
                <Badge variant="outline" className="text-xs">{item.count}</Badge>
              </div>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}
