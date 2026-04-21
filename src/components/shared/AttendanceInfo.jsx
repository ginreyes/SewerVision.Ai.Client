"use client";

import React, { useMemo, useRef, useEffect } from "react";
import {
  Clock, Timer, TrendingUp, Calendar, BarChart3, Briefcase, Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUserTimeEntries, useUserTimeSummary } from "@/hooks/useSharedHooks";
import { applyChartTheme } from "@/lib/chartTheme";
import { useTheme } from "@/components/providers/ThemeProvider";

const ACCENT = {
  rose:   { stat: "text-rose-600 dark:text-rose-400",   bg: "bg-rose-50 dark:bg-rose-500/10",   bar: "rgba(244, 63, 94, 0.8)",  barDark: "rgba(244, 63, 94, 0.6)" },
  blue:   { stat: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-50 dark:bg-blue-500/10",   bar: "rgba(59, 130, 246, 0.8)", barDark: "rgba(59, 130, 246, 0.6)" },
  indigo: { stat: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-500/10", bar: "rgba(99, 102, 241, 0.8)", barDark: "rgba(99, 102, 241, 0.6)" },
  purple: { stat: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-500/10", bar: "rgba(168, 85, 247, 0.8)", barDark: "rgba(168, 85, 247, 0.6)" },
  teal:   { stat: "text-teal-600 dark:text-teal-400",   bg: "bg-teal-50 dark:bg-teal-500/10",   bar: "rgba(20, 184, 166, 0.8)", barDark: "rgba(20, 184, 166, 0.6)" },
};

/**
 * AttendanceInfo — shared component showing a user's attendance stats,
 * weekly hours chart, and recent time entries. Embeddable in any user
 * detail view (admin user detail, operator profile, team lead member view).
 *
 * Props:
 *   userId   — the user whose attendance to display
 *   accent   — color theme (rose/blue/indigo/purple/teal)
 *   compact  — if true, shows a minimal 3-stat + 5-entry view
 */
export default function AttendanceInfo({ userId, accent = "rose", compact = false }) {
  const { isDark } = useTheme();
  const colors = ACCENT[accent] || ACCENT.rose;
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const { data: entries = [], isLoading: entriesLoading } = useUserTimeEntries(userId, { limit: compact ? 5 : 15 });
  const { data: summary, isLoading: summaryLoading } = useUserTimeSummary(userId);

  useEffect(() => { applyChartTheme(isDark); }, [isDark]);

  const monthHours = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    return (Array.isArray(entries) ? entries : [])
      .filter(e => {
        const d = new Date(e.date || e.createdAt);
        return d.getMonth() === month && d.getFullYear() === year;
      })
      .reduce((sum, e) => sum + (e.hours || 0), 0);
  }, [entries]);

  const stats = [
    { icon: Clock, label: "Today", value: `${summary?.todayHours?.toFixed(1) || "0"}h` },
    { icon: Timer, label: "This Week", value: `${summary?.weekHours?.toFixed(1) || "0"}h` },
    { icon: Calendar, label: "This Month", value: `${Math.round(monthHours * 10) / 10}h` },
    ...(!compact ? [{ icon: TrendingUp, label: "Entries", value: summary?.entryCount || 0 }] : []),
  ];

  // Weekly chart
  useEffect(() => {
    if (compact || !chartRef.current || typeof window === "undefined" || !window.Chart) return;
    if (chartInstanceRef.current) chartInstanceRef.current.destroy();

    const Chart = window.Chart;
    const days = [];
    const hours = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toLocaleDateString("en-US", { weekday: "short" }));
      const dayStr = d.toDateString();
      const dayHours = (Array.isArray(entries) ? entries : [])
        .filter(e => new Date(e.date || e.createdAt).toDateString() === dayStr)
        .reduce((sum, e) => sum + (e.hours || 0), 0);
      hours.push(Math.round(dayHours * 10) / 10);
    }

    chartInstanceRef.current = new Chart(chartRef.current, {
      type: "bar",
      data: {
        labels: days,
        datasets: [{
          label: "Hours",
          data: hours,
          backgroundColor: isDark ? colors.barDark : colors.bar,
          borderRadius: 4,
          barThickness: 20,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 2 } } },
      },
    });

    return () => { if (chartInstanceRef.current) chartInstanceRef.current.destroy(); };
  }, [entries, isDark, compact, colors]);

  // Lazy-load Chart.js
  useEffect(() => {
    if (!compact) import("chart.js/auto").then(m => { window.Chart = m.default || m; });
  }, [compact]);

  const loading = entriesLoading || summaryLoading;
  const entryList = Array.isArray(entries) ? entries : [];
  const hasTimeTracking = !loading && (entryList.length > 0 || (summary?.todayHours > 0) || (summary?.weekHours > 0));

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400 mr-2" />
          <span className="text-sm text-gray-400">Loading attendance...</span>
        </CardContent>
      </Card>
    );
  }

  if (!hasTimeTracking && !loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            Attendance
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
          <p className="text-sm text-gray-400">No time tracking data for this user</p>
          <p className="text-xs text-gray-400 mt-1">Time entries will appear here once the user starts clocking in.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Briefcase className={`w-4 h-4 ${colors.stat}`} />
          Attendance Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className={`grid ${compact ? "grid-cols-3" : "grid-cols-4"} gap-3`}>
          {stats.map((s, i) => (
            <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-lg border border-gray-100 dark:border-[#374151]">
              <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center shrink-0`}>
                <s.icon className={`w-3.5 h-3.5 ${colors.stat}`} />
              </div>
              <div>
                <p className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold">{s.label}</p>
                <p className="text-sm font-bold text-gray-900">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Chart — only in full mode */}
        {!compact && (
          <div className="rounded-xl border border-gray-100 dark:border-[#374151] p-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" /> Weekly Hours
            </p>
            <div className="h-36">
              <canvas ref={chartRef} />
            </div>
          </div>
        )}

        {/* Recent Entries */}
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
            Recent Entries {!compact && `(${entryList.length})`}
          </p>
          {entryList.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No entries yet</p>
          ) : (
            <div className="space-y-1.5">
              {entryList.slice(0, compact ? 5 : 15).map((e, i) => (
                <div key={e._id || i} className="flex items-center gap-3 py-2 px-3 rounded-lg border border-gray-50 dark:border-[#374151] hover:bg-gray-50 dark:hover:bg-[#374151] transition-colors text-xs">
                  <div className="w-14 shrink-0 font-mono text-gray-500 dark:text-gray-400">
                    {e.date ? new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                  </div>
                  <Badge variant="outline" className="text-[9px] shrink-0">{e.type || "Shift"}</Badge>
                  <div className="flex-1 min-w-0 text-gray-600 dark:text-gray-300 font-mono">
                    {e.startTime || "—"} → {e.endTime || "—"}
                  </div>
                  <span className="font-bold text-gray-900 shrink-0">{e.hours?.toFixed(1) || "—"}h</span>
                  <Badge variant="secondary" className={`text-[9px] ${
                    e.status === "approved" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400" :
                    e.status === "submitted" ? "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400" :
                    ""
                  }`}>
                    {e.status || "draft"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
