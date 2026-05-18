"use client";

import { useMemo } from "react";
import { Users, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const DASHBOARD_CARD =
  "border-0 shadow-sm dark:bg-[#0c0c0e] dark:border dark:border-[#27272a]";

const ACTIVE_STATUSES = new Set([
  "uploading",
  "ai-processing",
  "qc-review",
  "in-progress",
  "active",
]);

/**
 * Surfaces a per-inspector workload summary derived from recentProjects:
 * one row per inspector with their active project count, pending-QC count,
 * and total defects. Lets an admin spot under/over-loaded teammates at a
 * glance without leaving the dashboard.
 *
 * This intentionally aggregates client-side from data the dashboard already
 * has. A dedicated /api/admin/team-workload endpoint would give a fuller
 * picture (capacity %, week-over-week trend) — TODO when that lands.
 */
export default function TeamActivityCard({ projects = [], maxRows = 8 }) {
  const rows = useMemo(() => {
    const byInspector = new Map();
    for (const p of projects) {
      const key = (p.inspector || "Unassigned").trim() || "Unassigned";
      const entry = byInspector.get(key) || {
        inspector: key,
        active: 0,
        pendingQc: 0,
        defects: 0,
        total: 0,
      };
      entry.total += 1;
      if (ACTIVE_STATUSES.has(p.status)) entry.active += 1;
      if (p.status === "qc-review") entry.pendingQc += 1;
      entry.defects += Number(p.defects) || 0;
      byInspector.set(key, entry);
    }
    return Array.from(byInspector.values())
      .sort((a, b) => b.active - a.active || b.total - a.total)
      .slice(0, maxRows);
  }, [projects, maxRows]);

  return (
    <Card className={DASHBOARD_CARD}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
            Team Activity
          </CardTitle>
          <Users className="w-5 h-5 text-rose-600 dark:text-rose-400" />
        </div>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <div className="py-6 text-center text-sm text-gray-500 dark:!text-gray-400">
            No recent project activity yet.
          </div>
        ) : (
          <ul className="space-y-2">
            {rows.map((row) => {
              const overloaded = row.active >= 4;
              const idle = row.active === 0;
              return (
                <li
                  key={row.inspector}
                  className="flex items-center justify-between gap-3 px-3 py-2 rounded-md bg-gray-50 dark:bg-[#18181b]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {row.inspector}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:!text-gray-400">
                      {row.total} project{row.total === 1 ? "" : "s"} ·{" "}
                      {row.defects} defects
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {row.pendingQc > 0 ? (
                      <Badge
                        variant="secondary"
                        className="text-[10px] bg-yellow-100 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-300"
                      >
                        {row.pendingQc} QC
                      </Badge>
                    ) : null}
                    <Badge
                      variant="secondary"
                      className={
                        overloaded
                          ? "text-[10px] bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300"
                          : idle
                          ? "text-[10px] bg-gray-100 text-gray-700 dark:bg-[#27272a] dark:text-gray-300"
                          : "text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
                      }
                    >
                      {overloaded ? (
                        <AlertCircle className="w-3 h-3 mr-1" />
                      ) : null}
                      {row.active} active
                    </Badge>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
