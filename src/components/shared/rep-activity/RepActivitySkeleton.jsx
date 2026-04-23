"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const Pulse = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
);

function StatCardSkeleton() {
  return (
    <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <CardContent className="p-4 space-y-3">
        <Pulse className="w-9 h-9 rounded-lg" />
        <Pulse className="h-6 w-16" />
        <Pulse className="h-3 w-24" />
      </CardContent>
    </Card>
  );
}

function TableRowSkeleton() {
  return (
    <tr className="border-b border-gray-100 dark:border-gray-700/60">
      <td className="py-3 px-3">
        <div className="flex items-center gap-2">
          <Pulse className="w-8 h-8 rounded-full" />
          <div className="space-y-1.5">
            <Pulse className="h-3 w-28" />
            <Pulse className="h-2.5 w-40" />
          </div>
        </div>
      </td>
      <td className="py-3 px-3"><Pulse className="h-4 w-8" /></td>
      <td className="py-3 px-3"><Pulse className="h-4 w-8" /></td>
      <td className="py-3 px-3"><Pulse className="h-4 w-10" /></td>
      <td className="py-3 px-3"><Pulse className="h-4 w-10" /></td>
      <td className="py-3 px-3"><Pulse className="h-5 w-16 rounded-full" /></td>
    </tr>
  );
}

/**
 * RepActivitySkeleton — admin mode placeholder.
 * Renders the same 4 stats + table layout as RepActivityDashboard, so the
 * transition to real content is layout-stable (no reflow).
 */
export function RepActivityAdminSkeleton({ rowCount = 6 }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
            <Pulse className="h-4 w-24" />
            <Pulse className="h-9 w-full sm:w-72 rounded-md" />
          </div>
          <table className="w-full text-sm">
            <tbody>
              {Array.from({ length: rowCount }).map((_, i) => (
                <TableRowSkeleton key={i} />
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Self-view placeholder — header card + 2-column KPI grid.
 */
export function RepActivitySelfSkeleton() {
  return (
    <div className="space-y-4">
      <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <CardContent className="p-5 flex items-center justify-between flex-wrap gap-3">
          <div className="space-y-2">
            <Pulse className="h-5 w-40" />
            <Pulse className="h-3 w-64 max-w-full" />
          </div>
          <Pulse className="h-7 w-28 rounded-full" />
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[0, 1].map((i) => (
          <Card key={i} className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardContent className="p-4 space-y-3">
              <Pulse className="h-3 w-24" />
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex items-center gap-3 py-3 border-t border-gray-100 dark:border-gray-700 first:border-t-0">
                  <Pulse className="w-10 h-10 rounded-xl" />
                  <div className="space-y-1.5 flex-1">
                    <Pulse className="h-2.5 w-20" />
                    <Pulse className="h-4 w-16" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default RepActivityAdminSkeleton;
