"use client";

import React, { useCallback, useState } from "react";
import {
  Gauge,
  Timer,
  Zap,
  Snail,
  Download,
  Loader2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useUser } from "@/components/providers/UserContext";
import { useAlert } from "@/components/providers/AlertProvider";
import { useQCPersonalSpeedTrends } from "@/hooks/useQCHooks";
import { exportToCSV } from "@/lib/csvExport";
import SpeedDistributionBars from "@/components/qc-technician/speed-trends/SpeedDistributionBars";

/**
 * QC-Technician → Review Speed Trends.
 *
 * Sibling to the existing /qc-technician/defect-trends page. Where
 * Defect Trends measures defect MIX over time, this view measures
 * DECISION SPEED: percentile bands, distribution buckets per day, and
 * the fastest / slowest reviews in the range.
 *
 * Backend (May 14): GET /api/qc-analytics/personal-speed-trends/:userId?range=7d|30d|90d
 * — aggregates AIDetection.qcReviewedAt - createdAt deltas into daily
 * bucket counts plus p50/p90 estimates. Non-admin callers see only their
 * own data (controller silently rewrites :userId).
 */

const RANGES = [
  { key: "7d", label: "7 days", days: 7 },
  { key: "30d", label: "30 days", days: 30 },
  { key: "90d", label: "90 days", days: 90 },
];

export default function QCReviewSpeedTrendsPage() {
  const [range, setRange] = useState("30d");
  const { userId } = useUser();
  const { showAlert } = useAlert();
  const { data, isLoading } = useQCPersonalSpeedTrends(userId, range);

  const handleExportCsv = useCallback(() => {
    const daily = data?.dailyByBucket || [];
    if (daily.length === 0) {
      showAlert("Nothing to export in this range", "info");
      return;
    }
    exportToCSV(
      daily.map((d) => ({
        day: d.dayISO,
        under30s: d.lt30s,
        between30sAnd2m: d.lt2m,
        between2mAnd5m: d.lt5m,
        over5m: d.gte5m,
        total: d.lt30s + d.lt2m + d.lt5m + d.gte5m,
      })),
      [
        { key: "day", label: "Day" },
        { key: "under30s", label: "< 30s" },
        { key: "between30sAnd2m", label: "30s - 2m" },
        { key: "between2mAnd5m", label: "2m - 5m" },
        { key: "over5m", label: "5m+" },
        { key: "total", label: "Total reviews" },
      ],
      `qc-speed-trends-${range}`
    );
  }, [data, range, showAlert]);

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <Header
          range={range}
          onRangeChange={setRange}
          onExportCsv={handleExportCsv}
          exportDisabled={isLoading || !(data?.dailyByBucket?.length)}
        />

        <SummaryCards data={data} loading={isLoading} />

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Timer className="w-4 h-4 text-purple-600" />
              Daily decision-speed distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <ChartSkeleton />
            ) : (
              <SpeedDistributionBars dailyByBucket={data?.dailyByBucket || []} />
            )}
          </CardContent>
        </Card>

        <ExtremesRow extremes={data?.extremes} loading={isLoading} />
      </div>
    </div>
  );
}

function Header({ range, onRangeChange, onExportCsv, exportDisabled }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-md">
          <Gauge className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Review Speed Trends
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Your decision-time percentiles and distribution over time.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Tabs value={range} onValueChange={onRangeChange}>
          <TabsList>
            {RANGES.map((r) => (
              <TabsTrigger key={r.key} value={r.key}>
                {r.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onExportCsv}
          disabled={exportDisabled}
          title="Export the daily speed distribution as CSV"
        >
          <Download className="w-4 h-4 mr-1.5" />
          Export CSV
        </Button>
      </div>
    </div>
  );
}

function SummaryCards({ data, loading }) {
  const cards = [
    {
      icon: Timer,
      label: "Median decision time",
      value: data ? formatDuration(data.medianSeconds) : "—",
      hint: "p50 across all reviews in range",
      tone: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    },
    {
      icon: Zap,
      label: "p90",
      value: data ? formatDuration(data.p90Seconds) : "—",
      hint: "9 of 10 reviews land under this",
      tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    },
    {
      icon: Snail,
      label: "Long-tail (>5m)",
      value: data ? `${data.longTailPct}%` : "—",
      hint: "reviews that took 5 minutes or more",
      tone: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
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
              <div className="text-xs uppercase tracking-wide text-gray-500 mt-1">
                {label}
              </div>
              {hint ? <div className="text-[11px] text-gray-400 mt-0.5">{hint}</div> : null}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ExtremesRow({ extremes, loading }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-emerald-600" />
            Fastest review
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          ) : extremes?.fastest ? (
            <ExtremeRow item={extremes.fastest} />
          ) : (
            <div className="text-sm text-gray-500">No reviews in this range.</div>
          )}
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-rose-600" />
            Slowest review
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          ) : extremes?.slowest ? (
            <ExtremeRow item={extremes.slowest} />
          ) : (
            <div className="text-sm text-gray-500">No reviews in this range.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ExtremeRow({ item }) {
  return (
    <div className="space-y-1">
      <div className="text-2xl font-bold tabular-nums text-gray-900 dark:text-gray-100">
        {formatDuration(item.durationSeconds)}
      </div>
      <div className="text-sm text-gray-700 dark:text-gray-300">
        {item.defectType} · {item.decision}
      </div>
      <div className="text-[11px] text-gray-500">
        {new Date(item.reviewedAt).toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </div>
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

function formatDuration(seconds) {
  if (typeof seconds !== "number" || !Number.isFinite(seconds) || seconds < 0) {
    return "—";
  }
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m < 60) return s === 0 ? `${m}m` : `${m}m ${s}s`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm === 0 ? `${h}h` : `${h}h ${rm}m`;
}

