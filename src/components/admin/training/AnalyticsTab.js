"use client";

import React, { useMemo } from "react";
import {
  BarChart2, TrendingUp, Award, AlertTriangle, Users, Target, Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTrainingAnalytics } from "@/hooks/useQueryHooks";

const StatCard = ({ title, value, icon: Icon, color, bg }) => (
  <Card className="border-gray-200">
    <CardContent className="p-4 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${bg}`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div>
        <p className="text-lg font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{title}</p>
      </div>
    </CardContent>
  </Card>
);

// Dependency-free horizontal bar (matches the CSS-bar approach used elsewhere
// in the admin analytics pages rather than pulling in a chart lib).
function Bar({ label, value, max, suffix = "", barClass = "bg-rose-500" }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600 truncate">{label}</span>
        <span className="font-semibold text-gray-800 tabular-nums">{value}{suffix}</span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div className={`h-full rounded-full ${barClass} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function AnalyticsTab() {
  const { data, isLoading } = useTrainingAnalytics();

  const summary = data?.summary || {};
  const scoreDistribution = useMemo(() => (Array.isArray(data?.scoreDistribution) ? data.scoreDistribution : []), [data]);
  const categoryPassRates = useMemo(() => (Array.isArray(data?.categoryPassRates) ? data.categoryPassRates : []), [data]);
  const completionTrend = useMemo(() => (Array.isArray(data?.completionTrend) ? data.completionTrend : []), [data]);
  const atRisk = useMemo(() => (Array.isArray(data?.atRiskTechnicians) ? data.atRiskTechnicians : []), [data]);

  const maxScoreCount = useMemo(
    () => Math.max(1, ...scoreDistribution.map((b) => b.count || 0)),
    [scoreDistribution]
  );
  const maxTrend = useMemo(
    () => Math.max(1, ...completionTrend.map((w) => w.completions || 0)),
    [completionTrend]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading analytics…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Modules" value={summary.totalModules ?? 0} icon={BarChart2} color="text-rose-600" bg="bg-rose-50" />
        <StatCard title="Technicians" value={summary.totalTechnicians ?? 0} icon={Users} color="text-blue-600" bg="bg-blue-50" />
        <StatCard title="Total Attempts" value={summary.totalAttempts ?? 0} icon={Target} color="text-amber-600" bg="bg-amber-50" />
        <StatCard title="Overall Pass Rate" value={`${summary.overallPassRate ?? 0}%`} icon={Award} color="text-emerald-600" bg="bg-emerald-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Score distribution */}
        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><BarChart2 className="w-4 h-4 text-rose-500" /> Score Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {scoreDistribution.length ? scoreDistribution.map((b) => (
              <Bar key={b.range} label={b.range} value={b.count || 0} max={maxScoreCount} barClass="bg-rose-500" />
            )) : <p className="text-xs text-gray-400 py-4 text-center">No attempt data yet</p>}
          </CardContent>
        </Card>

        {/* Completion trend (last 8 weeks) */}
        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4 text-rose-500" /> Completions — last 8 weeks</CardTitle>
          </CardHeader>
          <CardContent>
            {completionTrend.length ? (
              <div className="flex items-end justify-between gap-1.5 h-32 pt-2">
                {completionTrend.map((w) => {
                  const h = maxTrend > 0 ? Math.round(((w.completions || 0) / maxTrend) * 100) : 0;
                  const d = w.weekStart ? new Date(w.weekStart) : null;
                  return (
                    <div key={w.weekStart} className="flex-1 flex flex-col items-center gap-1 group">
                      <span className="text-[10px] text-gray-500 tabular-nums">{w.completions || 0}</span>
                      <div className="w-full bg-gray-100 rounded-t flex items-end" style={{ height: "100%" }}>
                        <div className="w-full bg-emerald-500 rounded-t transition-all" style={{ height: `${h}%` }} />
                      </div>
                      <span className="text-[9px] text-gray-400">{d ? `${d.getMonth() + 1}/${d.getDate()}` : ""}</span>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-xs text-gray-400 py-4 text-center">No completions yet</p>}
          </CardContent>
        </Card>

        {/* Category pass rates */}
        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Target className="w-4 h-4 text-rose-500" /> Pass Rate by Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {categoryPassRates.length ? categoryPassRates.map((c) => (
              <Bar key={c.category} label={`${c.category} (${c.totalModules} mod${c.totalModules === 1 ? "" : "s"})`}
                value={c.avgPassRate || 0} max={100} suffix="%" barClass="bg-blue-500" />
            )) : <p className="text-xs text-gray-400 py-4 text-center">No categories yet</p>}
          </CardContent>
        </Card>

        {/* At-risk technicians */}
        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /> At-Risk Technicians</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {atRisk.length ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-2.5">Technician</th>
                    <th className="text-center text-xs font-semibold text-gray-500 px-4 py-2.5">Avg Score</th>
                    <th className="text-center text-xs font-semibold text-gray-500 px-4 py-2.5">Overdue</th>
                  </tr>
                </thead>
                <tbody>
                  {atRisk.map((t) => (
                    <tr key={t.user?._id} className="border-b border-gray-50">
                      <td className="px-4 py-2.5 text-xs font-medium text-gray-900">{t.user?.name || "Unknown"}</td>
                      <td className="px-4 py-2.5 text-center">
                        <Badge variant="outline" className={`text-[10px] ${(t.avgScore ?? 0) < 70 ? "bg-red-50 text-red-700 border-red-200" : "bg-gray-50 text-gray-600"}`}>
                          {t.avgScore ?? 0}%
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-center text-xs">
                        {t.overdueCount > 0
                          ? <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">{t.overdueCount}</Badge>
                          : <span className="text-gray-300">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Award className="w-8 h-8 mx-auto mb-2 text-emerald-300" />
                <p className="text-xs">No at-risk technicians — everyone is on track</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
