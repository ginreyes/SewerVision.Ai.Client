"use client";

import React, { useState, useMemo } from "react";
import { Plus, TrendingUp, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useUserOvertimeRequests,
  useUserOvertimeSummary,
} from "@/hooks/useQueryHooks";
import OvertimeList from "./OvertimeList";
import OvertimeRequestModal from "./OvertimeRequestModal";

const BUTTON_CLASSES = {
  indigo: "bg-indigo-600 hover:bg-indigo-700",
  blue: "bg-blue-600 hover:bg-blue-700",
  red: "bg-red-700 hover:bg-red-800",
  purple: "bg-purple-600 hover:bg-purple-700",
};

/**
 * Shared overtime hub — rendered inside each role's time-tracking page.
 * Lists the current user's overtime requests, shows a 3-card summary, and
 * surfaces a "Request Overtime" button that opens the modal.
 */
export default function OvertimePanel({
  userId,
  projects = [],
  accent = "indigo",
  showProject = true,
}) {
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const btnClass = BUTTON_CLASSES[accent] || BUTTON_CLASSES.indigo;

  const filters = useMemo(() => (filter === "all" ? {} : { status: filter }), [filter]);
  const { data: requests = [], isLoading } = useUserOvertimeRequests(userId, filters);
  const { data: summary } = useUserOvertimeSummary(userId);

  const statCards = useMemo(
    () => [
      {
        label: "Pending",
        value: summary?.pending ?? 0,
        sub: `${summary?.totalPendingHours ?? 0}h`,
        icon: AlertCircle,
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-900/30",
      },
      {
        label: "Approved",
        value: summary?.approved ?? 0,
        sub: `${summary?.totalApprovedHours ?? 0}h logged`,
        icon: CheckCircle2,
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-900/30",
      },
      {
        label: "Rejected",
        value: summary?.rejected ?? 0,
        sub: "Past decisions",
        icon: TrendingUp,
        color: "text-rose-600 dark:text-rose-400",
        bg: "bg-rose-50 dark:bg-rose-900/30",
      },
    ],
    [summary]
  );

  const FILTERS = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Overtime Requests
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Submit extra-hours requests for approval
          </p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          className={`${btnClass} text-white gap-1.5`}
        >
          <Plus className="w-4 h-4" />
          Request Overtime
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {statCards.map((s) => (
          <Card
            key={s.label}
            className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.bg}`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight">
                  {s.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {s.label} · {s.sub}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              filter === f.value
                ? `${btnClass} text-white border-transparent`
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <OvertimeList requests={requests} isLoading={isLoading} />

      <OvertimeRequestModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        userId={userId}
        projects={projects}
        accent={accent}
        showProject={showProject}
      />
    </div>
  );
}
