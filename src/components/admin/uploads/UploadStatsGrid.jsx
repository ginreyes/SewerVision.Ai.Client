"use client";

import React, { useMemo } from "react";
import { Files, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import GenericStatCard from "@/components/shared/GenericStatCard";

/**
 * UploadStatsGrid — 4 quick KPIs for the admin Files tab.
 * Uses the shared GenericStatCard to match the visual language of the rest
 * of the admin modules (users, reports, dashboard).
 */
export default function UploadStatsGrid({ uploads = [] }) {
  const stats = useMemo(() => {
    const list = Array.isArray(uploads) ? uploads : [];
    const total = list.length;
    const completed = list.filter((u) => u.status === "completed").length;
    const processing = list.filter(
      (u) => u.status === "processing" || u.status === "uploading"
    ).length;
    const failed = list.filter((u) => u.status === "failed").length;
    const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, processing, failed, successRate };
  }, [uploads]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <GenericStatCard
        icon={Files}
        value={stats.total}
        label="Files (current page)"
        subtitle="Visible after filters"
        color="indigo"
      />
      <GenericStatCard
        icon={CheckCircle2}
        value={stats.completed}
        label="Completed"
        subtitle={`${stats.successRate}% success rate`}
        color="green"
      />
      <GenericStatCard
        icon={Clock}
        value={stats.processing}
        label="In progress"
        subtitle="Uploading or processing"
        color="amber"
      />
      <GenericStatCard
        icon={AlertTriangle}
        value={stats.failed}
        label="Failed"
        subtitle={stats.failed > 0 ? "Needs attention" : "All healthy"}
        color={stats.failed > 0 ? "red" : "rose"}
      />
    </div>
  );
}
