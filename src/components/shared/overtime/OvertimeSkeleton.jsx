"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const Pulse = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
);

function StatCardSkeleton() {
  return (
    <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <CardContent className="p-4 flex items-center gap-3">
        <Pulse className="w-9 h-9 rounded-lg" />
        <div className="min-w-0 flex-1 space-y-2">
          <Pulse className="h-4 w-16" />
          <Pulse className="h-3 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

function RequestRowSkeleton() {
  return (
    <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Pulse className="h-4 w-32" />
              <Pulse className="h-4 w-14 rounded-full" />
              <Pulse className="h-4 w-16 rounded-full" />
            </div>
            <Pulse className="h-3 w-72 max-w-full" />
            <Pulse className="h-3 w-56 max-w-full" />
          </div>
          <Pulse className="h-8 w-20 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * OvertimeSkeleton — placeholder for OvertimePanel + OvertimeApprovalList.
 * Matches the real layout: 3 or 4 stat cards on top, filter row, list rows.
 */
export default function OvertimeSkeleton({ statCount = 4, rowCount = 5 }) {
  return (
    <div className="space-y-4">
      <div
        className={`grid gap-3 ${statCount === 3 ? "grid-cols-3" : "grid-cols-2 md:grid-cols-4"}`}
      >
        {Array.from({ length: statCount }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        <Pulse className="h-6 w-16 rounded-full" />
        <Pulse className="h-6 w-20 rounded-full" />
        <Pulse className="h-6 w-20 rounded-full" />
        <Pulse className="h-6 w-16 rounded-full" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: rowCount }).map((_, i) => (
          <RequestRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
