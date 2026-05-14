"use client";

import React, { useMemo, useState } from "react";
import {
  Activity,
  Users,
  TrendingUp,
  TrendingDown,
  Loader2,
  Inbox,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAlert } from "@/components/providers/AlertProvider";
import { useTeamWorkload } from "@/hooks/useSharedHooks";

/**
 * User → Team Workload & Capacity.
 *
 * Per-member capacity heatmap that aggregates active project assignments
 * (Project.assignedOperator.userId + Project.qcTechnician.userId) and
 * hours-this-week (TimeEntry.hours) into one row per team member.
 *
 * Backend: GET /api/user/workload?weekOf=YYYY-MM-DD&overThreshold=40&underThreshold=20
 *
 * The page reads the current week by default and lets the team lead nudge
 * the over/under thresholds from the header pills.
 */

const FLAG_TONES = {
  over: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300",
  under: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300",
  ok: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300",
};

const FLAG_LABEL = {
  over: "Over",
  under: "Under",
  ok: "On track",
};

export default function UserTeamWorkloadPage() {
  // Thresholds default to 40 / 20 — the same defaults the backend uses.
  // Local state so the team lead can tweak without leaving the page.
  const [overThreshold] = useState(40);
  const [underThreshold] = useState(20);

  const filters = useMemo(
    () => ({ overThreshold, underThreshold }),
    [overThreshold, underThreshold]
  );
  const { data, isLoading, isError, error } = useTeamWorkload(filters);

  const totals = data?.totals || {
    memberCount: 0,
    overAllocated: 0,
    underUtilized: 0,
    totalHours: 0,
    totalActiveProjects: 0,
  };
  const rows = data?.rows || [];

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <Header
          weekStartISO={data?.weekStartISO}
          overThreshold={overThreshold}
          underThreshold={underThreshold}
        />

        <SummaryCards totals={totals} loading={isLoading} />

        {isError ? (
          <Card className="border-rose-200 dark:border-rose-900/40">
            <CardContent className="py-6 text-sm text-rose-700 dark:text-rose-300">
              Failed to load team workload — {error?.message || "unknown error"}.
            </CardContent>
          </Card>
        ) : isLoading ? (
          <Card className="border-dashed">
            <CardContent className="py-10 flex items-center justify-center gap-2 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Aggregating member load…</span>
            </CardContent>
          </Card>
        ) : rows.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-10 flex flex-col items-center gap-2 text-gray-500">
              <Inbox className="w-6 h-6" />
              <span className="text-sm">No team members in scope this week.</span>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rows.map((row) => (
              <MemberRow
                key={row.id}
                row={row}
                overThreshold={overThreshold}
                underThreshold={underThreshold}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Header({ weekStartISO, overThreshold, underThreshold }) {
  const weekLabel = weekStartISO
    ? `Week of ${new Date(weekStartISO).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })}`
    : "Current week";
  return (
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Team Workload
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Per-member capacity for the current week — over-allocated and under-utilised flagged.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500">
        <Badge variant="outline" className="font-normal">
          {weekLabel}
        </Badge>
        <Badge variant="outline" className="font-normal">
          Over ≥ {overThreshold}h
        </Badge>
        <Badge variant="outline" className="font-normal">
          Under ≤ {underThreshold}h
        </Badge>
      </div>
    </div>
  );
}

function SummaryCards({ totals, loading }) {
  const cards = [
    {
      icon: Users,
      label: "Members",
      value: totals.memberCount,
      tone: "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
    },
    {
      icon: TrendingUp,
      label: "Over-allocated",
      value: totals.overAllocated,
      tone: "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
    },
    {
      icon: TrendingDown,
      label: "Under-utilised",
      value: totals.underUtilized,
      tone: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    },
    {
      icon: Activity,
      label: "Total hours",
      value: totals.totalHours,
      tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map(({ icon: Icon, label, value, tone }) => (
        <Card key={label} className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${tone}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold tabular-nums text-gray-900 dark:text-gray-100">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                ) : (
                  value
                )}
              </div>
              <div className="text-xs uppercase tracking-wide text-gray-500">
                {label}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function MemberRow({ row, overThreshold, underThreshold }) {
  const flagTone = FLAG_TONES[row.flag] || FLAG_TONES.ok;
  const flagLabel = FLAG_LABEL[row.flag] || "On track";

  // Width is a coarse visualisation: hours over the overThreshold rail.
  const pct = Math.min(100, Math.round((row.weekHours / overThreshold) * 100));
  const barTone =
    row.flag === "over"
      ? "bg-rose-500"
      : row.flag === "under"
        ? "bg-amber-400"
        : "bg-emerald-500";

  return (
    <Card className="border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                {row.name || row.username}
              </span>
              <span className="text-[11px] text-gray-500">· {row.role}</span>
              <Badge variant="outline" className={`text-[10px] h-4 px-1.5 ${flagTone}`}>
                {flagLabel}
              </Badge>
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              {row.activeProjects} active project{row.activeProjects === 1 ? "" : "s"}
              {row.timeEntries > 0
                ? ` · ${row.timeEntries} time entries`
                : ""}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xl font-bold tabular-nums text-gray-900 dark:text-gray-100">
              {row.weekHours}h
            </div>
            <div className="text-[10px] uppercase tracking-wide text-gray-500">
              this week
            </div>
          </div>
        </div>

        <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <div className={`${barTone} h-full transition-all`} style={{ width: `${pct}%` }} />
        </div>

        {row.sampleProjects?.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {row.sampleProjects.slice(0, 3).map((p) => (
              <Badge key={p.id} variant="outline" className="text-[10px] h-4 px-1.5 font-normal">
                {p.workOrder || p.name}
              </Badge>
            ))}
            {row.sampleProjects.length > 3 ? (
              <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-normal">
                +{row.sampleProjects.length - 3} more
              </Badge>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
