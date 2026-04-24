"use client";

import React, { useState, useCallback } from "react";
import { Users, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRepActivity } from "@/hooks/useQueryHooks";
import { SavedViewsDropdown, useSavedViewSync } from "@/components/shared/SavedViews";
import ExportButton from "@/components/shared/ExportButton";
import RepStatsGrid from "./RepStatsGrid";
import RepTable from "./RepTable";
import RepSelfView from "./RepSelfView";
import { RepActivityAdminSkeleton, RepActivitySelfSkeleton } from "./RepActivitySkeleton";
import FadeIn from "@/components/shared/FadeIn";

const memberName = (rep) => {
  if (!rep) return "Unknown";
  const full = [rep.first_name, rep.last_name].filter(Boolean).join(" ").trim();
  return full || rep.username || rep.email || "Unknown";
};

/**
 * RepActivityDashboard — dual-view dashboard.
 *
 * Props:
 *  - mode: 'admin' | 'self'
 *      admin → team overview (stats grid + sortable table)
 *      self  → single-rep detail view
 *  - repId: required when mode='self'
 *  - title / description / accent — cosmetic header tuning
 *  - enableSavedViews / enableExport — admin-mode toolbar toggles
 */
export default function RepActivityDashboard({
  mode = "admin",
  repId,
  title,
  description,
  accent = "rose",
  enableSavedViews = true,
  enableExport = true,
}) {
  const [drillRep, setDrillRep] = useState(null);

  const { data, isLoading, isFetching, refetch } = useRepActivity({ mode, repId });

  const headerTitle =
    title || (mode === "self" ? "My performance" : "Customer Rep Activity");
  const headerDesc =
    description ||
    (mode === "self"
      ? "Your tickets, complaints and overtime at a glance"
      : "Team-wide overview of rep workload, SLA compliance and overtime");

  // Saved Views (admin mode only — self view doesn't need filters)
  const captureFilters = useCallback(() => ({}), []);
  const applyFilters = useCallback(() => {}, []);
  const { activeViewId, applyView, clearView, snapshot } = useSavedViewSync({
    applyFilters,
    captureFilters,
  });

  // Self mode — render RepSelfView
  if (mode === "self") {
    return (
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-md">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {headerTitle}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{headerDesc}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
            {isFetching ? "Refreshing…" : "Refresh"}
          </Button>
        </div>

        {isLoading ? (
          <RepActivitySelfSkeleton />
        ) : !data ? (
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-10 text-center text-gray-500 dark:text-gray-400">
            No activity data available yet.
          </div>
        ) : (
          <FadeIn>
            <RepSelfView data={data} />
          </FadeIn>
        )}
      </div>
    );
  }

  // Admin mode — team overview
  const entries = Array.isArray(data) ? data : [];
  const exportRows = entries.map((e) => ({
    name: memberName(e.rep),
    email: e.rep?.email || "",
    openTickets: e.tickets?.open ?? 0,
    resolved7d: e.tickets?.resolved7d ?? 0,
    avgResponseHours: e.tickets?.avgResponseHours ?? "",
    openComplaints: e.complaints?.open ?? 0,
    complaintsResolved7d: e.complaints?.resolved7d ?? 0,
    slaCompliance:
      typeof e.slaCompliance === "number"
        ? `${Math.round(e.slaCompliance * 100)}%`
        : "",
    overtimePending: e.overtime?.pendingHours ?? 0,
    overtimeApproved7d: e.overtime?.approvedHours7d ?? 0,
    workload: e.workload || "",
  }));

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white shadow-md">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {headerTitle}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{headerDesc}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {enableSavedViews && (
            <SavedViewsDropdown
              entityType="customer-rep"
              activeViewId={activeViewId}
              onApply={applyView}
              onClear={clearView}
              snapshotFilters={snapshot}
              accentColor={accent}
            />
          )}
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
            {isFetching ? "Refreshing…" : "Refresh"}
          </Button>
          {enableExport && (
            <ExportButton
              data={exportRows}
              columns={[
                { key: "name", label: "Rep" },
                { key: "email", label: "Email" },
                { key: "openTickets", label: "Open tickets" },
                { key: "resolved7d", label: "Resolved 7d" },
                { key: "avgResponseHours", label: "Avg resp (h)" },
                { key: "openComplaints", label: "Open complaints" },
                { key: "complaintsResolved7d", label: "Complaints resolved 7d" },
                { key: "slaCompliance", label: "SLA" },
                { key: "overtimePending", label: "OT pending (h)" },
                { key: "overtimeApproved7d", label: "OT approved 7d (h)" },
                { key: "workload", label: "Workload" },
              ]}
              filename="rep-activity"
            />
          )}
        </div>
      </div>

      {isLoading ? (
        <RepActivityAdminSkeleton />
      ) : (
        <FadeIn>
          <RepStatsGrid entries={entries} />
          <div className="mt-4">
            <RepTable entries={entries} onSelect={setDrillRep} />
          </div>

          {drillRep && (
            <FadeIn className="mt-2">
              <RepSelfView data={drillRep} />
              <div className="flex justify-end mt-2">
                <Button variant="outline" size="sm" onClick={() => setDrillRep(null)}>
                  Close detail
                </Button>
              </div>
            </FadeIn>
          )}
        </FadeIn>
      )}
    </div>
  );
}
