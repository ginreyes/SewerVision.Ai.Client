"use client";

import React, { useState } from "react";
import { TrendingUp, Activity, Calendar, Target, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/components/providers/UserContext";
import { useQCPersonalDefectTrends } from "@/hooks/useQCHooks";
import DefectTypeBars from "@/components/qc-technician/defect-trends/DefectTypeBars";

/**
 * QC-Technician → Personal Defect Trends.
 *
 * Self-improvement / 1:1 view of *what* the tech reviews over time. Pairs
 * with the existing 7-day review-stats card (which measures approval rate
 * and speed). This page is about defect MIX over a longer horizon.
 *
 * Range tabs (7d/30d/90d) drive a single hook — the cache stays warm
 * across tabs because the backend keys per-range.
 */
const RANGES = [
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "90d", label: "90 days" },
];

export default function QCPersonalDefectTrendsPage() {
  const { userId } = useUser();
  const [range, setRange] = useState("30d");
  const { data, isLoading } = useQCPersonalDefectTrends(userId, range);

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <Header range={range} onRangeChange={setRange} />

        <SummaryCards data={data} loading={isLoading} />

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-600" />
              Defect mix over time
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <ChartSkeleton />
            ) : (
              <DefectTypeBars weeklyByType={data?.weeklyByType || []} />
            )}
          </CardContent>
        </Card>

        <TopTypes types={data?.topTypes || []} loading={isLoading} />
      </div>
    </div>
  );
}

function Header({ range, onRangeChange }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-md">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Defect Trends</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Your personal review activity and defect-type mix over time.
          </p>
        </div>
      </div>
      <Tabs value={range} onValueChange={onRangeChange}>
        <TabsList>
          {RANGES.map((r) => (
            <TabsTrigger key={r.key} value={r.key}>
              {r.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}

function SummaryCards({ data, loading }) {
  const cards = [
    {
      icon: Target,
      label: "Total reviews",
      value: data?.totalReviews ?? 0,
      hint: data?.range || "",
      tone: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    },
    {
      icon: Calendar,
      label: "Active days",
      value: data?.daysActive ?? 0,
      hint: "days with at least one review",
      tone: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    },
    {
      icon: Activity,
      label: "Avg per active day",
      value: data?.avgReviewsPerActiveDay ?? 0,
      hint: "reviews per active day",
      tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map(({ icon: Icon, label, value, hint, tone }) => (
        <Card key={label} className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-start gap-3">
            <div className={`p-2 rounded-lg ${tone}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                {loading ? <Loader2 className="w-5 h-5 animate-spin text-gray-400" /> : value}
              </div>
              <div className="text-xs uppercase tracking-wide text-gray-500 mt-1">{label}</div>
              {hint ? <div className="text-[11px] text-gray-400 mt-0.5">{hint}</div> : null}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TopTypes({ types, loading }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Top defect types</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : types.length === 0 ? (
          <div className="text-center py-6 text-sm text-gray-500">No reviewed defects in this range.</div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {types.map((t) => {
              const total = Math.max(1, t.count);
              const approvedPct = Math.round((t.approved / total) * 100);
              return (
                <li key={t.type} className="py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{t.type}</span>
                      <span className="text-xs text-gray-500 tabular-nums">{t.count} reviews</span>
                    </div>
                    <div className="mt-1.5 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${approvedPct}%` }} />
                    </div>
                    <div className="mt-1 flex justify-between text-[11px] text-gray-500">
                      <span>{approvedPct}% approved</span>
                      <span>
                        {t.rejected} rejected
                        {t.avgConfidence != null ? ` · avg conf ${t.avgConfidence}` : ""}
                      </span>
                    </div>
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

function ChartSkeleton() {
  return (
    <div className="flex items-end gap-3 h-[160px]">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 rounded-md bg-gray-100 dark:bg-gray-800 animate-pulse"
          style={{ height: `${30 + ((i * 13) % 60)}%` }}
        />
      ))}
    </div>
  );
}
