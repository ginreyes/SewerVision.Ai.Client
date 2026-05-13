"use client";

import React, { useCallback, useMemo, useState } from "react";
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
import { useAlert } from "@/components/providers/AlertProvider";
import { exportToCSV } from "@/lib/csvExport";
import SpeedDistributionBars from "@/components/qc-technician/speed-trends/SpeedDistributionBars";

/**
 * QC-Technician → Review Speed Trends.
 *
 * Sibling to the existing /qc-technician/defect-trends page. Where
 * Defect Trends measures defect MIX over time, this view measures
 * DECISION SPEED: percentile bands, distribution buckets per day, and
 * the fastest / slowest reviews in the range. Pairs naturally with
 * Defect Trends in a "Personal Analytics" mental model — same range
 * tabs, same theme, same export pattern.
 *
 * MAY 13 SCOPE — frontend only. The hook returns deterministic mock
 * data derived from a seeded range key so the layout is testable. The
 * backend endpoint lands on May 14:
 *   GET /api/qc-analytics/personal-speed-trends?range=7d|30d|90d
 * The response shape used here is the exact shape that endpoint will
 * return — only the data source changes when the API arrives.
 */

const RANGES = [
  { key: "7d", label: "7 days", days: 7 },
  { key: "30d", label: "30 days", days: 30 },
  { key: "90d", label: "90 days", days: 90 },
];

export default function QCReviewSpeedTrendsPage() {
  const [range, setRange] = useState("30d");
  const { showAlert } = useAlert();
  const { data, isLoading } = useMockSpeedTrends(range);

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

// ─── Mock data hook ─────────────────────────────────────────────────────
//
// Returns deterministic-feeling data shaped exactly like the May 14
// backend endpoint will return. Seeded by `range` so the page renders
// consistently across re-mounts and the visual scales differ between
// the 7d / 30d / 90d tabs without being random noise.
function useMockSpeedTrends(range) {
  return useMemo(() => {
    const days = RANGES.find((r) => r.key === range)?.days ?? 30;
    return { data: buildMockTrends(days), isLoading: false };
  }, [range]);
}

function buildMockTrends(days) {
  // Bucket scale grows with the range so the long view doesn't look
  // identical to the short one. The numbers are intentionally tame —
  // a real tech reviews ~30-80 items/day.
  const baseDaily = Math.max(8, Math.round(40 - days * 0.15));

  const dailyByBucket = Array.from({ length: days }).map((_, i) => {
    // Pseudo-randomness keyed by day index so the chart reads cleanly.
    const seed = i * 7919;
    const lt30s = Math.max(0, Math.round(baseDaily * 0.42 + sineNoise(seed, 6)));
    const lt2m = Math.max(0, Math.round(baseDaily * 0.34 + sineNoise(seed + 1, 5)));
    const lt5m = Math.max(0, Math.round(baseDaily * 0.18 + sineNoise(seed + 2, 4)));
    const gte5m = Math.max(0, Math.round(baseDaily * 0.06 + sineNoise(seed + 3, 2)));
    return {
      dayISO: daysAgo(days - 1 - i),
      lt30s,
      lt2m,
      lt5m,
      gte5m,
    };
  });

  const totalsByBucket = dailyByBucket.reduce(
    (acc, d) => ({
      lt30s: acc.lt30s + d.lt30s,
      lt2m: acc.lt2m + d.lt2m,
      lt5m: acc.lt5m + d.lt5m,
      gte5m: acc.gte5m + d.gte5m,
    }),
    { lt30s: 0, lt2m: 0, lt5m: 0, gte5m: 0 }
  );

  const totalReviews =
    totalsByBucket.lt30s + totalsByBucket.lt2m + totalsByBucket.lt5m + totalsByBucket.gte5m;

  // Median: pick the midpoint of whichever bucket contains the 50% mark.
  const medianSeconds = estimatePercentileSeconds(totalsByBucket, 0.5);
  const p90Seconds = estimatePercentileSeconds(totalsByBucket, 0.9);
  const longTailPct = totalReviews > 0
    ? Math.round((totalsByBucket.gte5m / totalReviews) * 100)
    : 0;

  return {
    range: `${days}d`,
    totalReviews,
    medianSeconds,
    p90Seconds,
    longTailPct,
    dailyByBucket,
    extremes: {
      fastest: {
        durationSeconds: 7,
        defectType: "Crack",
        decision: "Approved",
        reviewedAt: daysAgo(Math.floor(days / 3)),
      },
      slowest: {
        durationSeconds: 14 * 60 + 32,
        defectType: "Root intrusion",
        decision: "Rejected",
        reviewedAt: daysAgo(Math.floor(days / 5)),
      },
    },
  };
}

function sineNoise(seed, amplitude) {
  // Cheap deterministic wiggle in [-amplitude, amplitude] without a PRNG dep.
  return Math.sin(seed * 0.91) * amplitude;
}

function daysAgo(n) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

// Map bucket counts to a representative seconds value for percentile estimates.
const BUCKET_MID = { lt30s: 15, lt2m: 75, lt5m: 210, gte5m: 480 };

function estimatePercentileSeconds(totals, pct) {
  const order = ["lt30s", "lt2m", "lt5m", "gte5m"];
  const totalReviews = order.reduce((acc, b) => acc + totals[b], 0);
  if (totalReviews === 0) return 0;
  let running = 0;
  const target = totalReviews * pct;
  for (const b of order) {
    running += totals[b];
    if (running >= target) return BUCKET_MID[b];
  }
  return BUCKET_MID.gte5m;
}
