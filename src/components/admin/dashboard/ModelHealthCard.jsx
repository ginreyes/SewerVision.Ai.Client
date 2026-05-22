"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Brain, TrendingUp, TrendingDown, Minus, Loader2, AlertTriangle, ChevronRight } from "lucide-react";
import { api } from "@/lib/helper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CARD_CLASSES = "border-0 shadow-sm dark:bg-[#0c0c0e] dark:border dark:border-[#27272a]";

function fmtPct(v) {
  if (v == null || isNaN(v)) return "—";
  const n = Number(v);
  return (n <= 1 ? n * 100 : n).toFixed(1) + "%";
}

function trendBadge(delta) {
  if (delta == null || isNaN(delta) || delta === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
        <Minus className="w-3 h-3" />flat
      </span>
    );
  }
  if (delta > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
        <TrendingUp className="w-3 h-3" />+{(delta <= 1 ? delta * 100 : delta).toFixed(1)}%
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400">
      <TrendingDown className="w-3 h-3" />{(delta <= 1 ? delta * 100 : delta).toFixed(1)}%
    </span>
  );
}

export default function ModelHealthCard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "ai-analytics", "overview"],
    queryFn: async () => {
      const { data } = await api("/api/ai-analytics/overview");
      return data?.data || null;
    },
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <Card className={CARD_CLASSES}>
        <CardContent className="p-6 flex items-center justify-center text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading model health…
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className={CARD_CLASSES}>
        <CardContent className="p-6 flex items-center gap-2 text-sm text-gray-500">
          <AlertTriangle className="w-4 h-4" /> Model health unavailable.
        </CardContent>
      </Card>
    );
  }

  const summary = data.summary || {};
  const byType = (data.byType || []).slice().sort((a, b) => (a.avgConfidence || 0) - (b.avgConfidence || 0));
  const lowest = byType.slice(0, 3);

  // Drift = this-week confidence vs last-week's, from weeklyTrend if at least 2 entries
  const trend = data.weeklyTrend || [];
  const lastTwo = trend.slice(-2);
  const drift =
    lastTwo.length === 2
      ? (Number(lastTwo[1].avgConfidence || 0) - Number(lastTwo[0].avgConfidence || 0))
      : null;

  // Pending count → "needs attention"
  const pending = summary.pending ?? 0;
  const totalDetections = summary.totalDetections ?? 0;

  return (
    <Card className={CARD_CLASSES}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Brain className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            Model Health
          </CardTitle>
          <span className="text-[10px] text-gray-400">last 30 days</span>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Total detections */}
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wide text-gray-400">Detections</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{totalDetections.toLocaleString()}</p>
            <p className="text-[11px] text-gray-500">{pending.toLocaleString()} pending review</p>
          </div>
          {/* Avg confidence */}
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wide text-gray-400">Avg confidence</p>
            <div className="flex items-baseline gap-2">
              <p className="text-xl font-bold text-gray-900 dark:text-white">{fmtPct(summary.avgConfidence)}</p>
              {trendBadge(summary.confidenceTrend)}
            </div>
            <p className="text-[11px] text-gray-500">vs {fmtPct(summary.lastMonthConfidence)} last month</p>
          </div>
          {/* Approval / FP */}
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wide text-gray-400">QC outcomes</p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{fmtPct(summary.approvalRate)}</p>
            <p className="text-[11px] text-gray-500">FP rate {fmtPct(summary.falsePositiveRate)}</p>
          </div>
          {/* Week-over-week drift */}
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wide text-gray-400">Weekly drift</p>
            <div className="flex items-baseline gap-2">
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {drift == null ? "—" : `${drift > 0 ? "+" : ""}${(drift <= 1 ? drift * 100 : drift).toFixed(1)}%`}
              </p>
              {drift != null && trendBadge(drift)}
            </div>
            <p className="text-[11px] text-gray-500">vs prior week</p>
          </div>
        </div>

        {lowest.length > 0 && (
          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-[#27272a]">
            <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-2">Lowest-confidence types</p>
            <div className="space-y-1.5">
              {lowest.map((t) => (
                <div key={t.type} className="flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">
                    {String(t.type || "").replace(/_/g, " ")}
                  </span>
                  <span className="text-gray-500 flex items-center gap-2">
                    <span>{t.count} detections</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="font-mono font-semibold text-rose-600 dark:text-rose-400">{fmtPct(t.avgConfidence)}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
