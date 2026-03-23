"use client";

import React, { useMemo } from "react";
import {
  BarChart2, TrendingUp, CheckCircle2, Clock, AlertCircle,
  Loader2, Timer, Zap, User, MessageSquare, Target,
  ClipboardList,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/components/providers/UserContext";
import {
  useSupportAllTickets,
  useSupportAssignedTickets,
  useSupportGlobalStats,
} from "@/hooks/useQueryHooks";

// ── Helpers ──
function getHoursAgo(dateStr) {
  if (!dateStr) return 0;
  return (Date.now() - new Date(dateStr).getTime()) / 3600000;
}
function dayKey(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function last7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      key: dayKey(d.toISOString()),
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
    });
  }
  return days;
}

// ── CSS Bar Chart ──
function BarChart({ data, maxValue, colorClass = "bg-teal-500", height = 80 }) {
  if (!data.length) return null;
  const max = maxValue || Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-[10px] text-gray-400 font-medium">{d.value || ""}</span>
          <div
            className={`w-full rounded-t-md transition-all duration-500 ${colorClass} opacity-80 hover:opacity-100`}
            style={{ height: `${Math.max((d.value / max) * (height - 24), d.value > 0 ? 4 : 0)}px` }}
            title={`${d.label}: ${d.value}`}
          />
          <span className="text-[10px] text-gray-400 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Horizontal Bar (category/priority distribution) ──
function HBar({ label, value, total, colorClass = "bg-teal-400" }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600 capitalize">{label}</span>
        <span className="text-xs font-semibold text-gray-800">{value} <span className="font-normal text-gray-400">({pct}%)</span></span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${colorClass} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── Donut Ring ──
function DonutRing({ pct, size = 80, stroke = 10, colorClass = "stroke-teal-500", label, sublabel }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" className={colorClass} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }} />
      </svg>
      <div className="text-center -mt-1">
        <p className="text-lg font-bold text-gray-900">{pct}%</p>
        <p className="text-[10px] text-gray-500">{label}</p>
        {sublabel && <p className="text-[10px] text-gray-400">{sublabel}</p>}
      </div>
    </div>
  );
}

// ── Metric Card ──
function MetricCard({ icon: Icon, label, value, sub, iconBg, iconColor, trend }) {
  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
            <Icon className={`w-4 h-4 ${iconColor}`} />
          </div>
          {trend !== undefined && (
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${trend >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
              {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}
            </span>
          )}
        </div>
        <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        <p className="text-xs font-medium text-gray-600">{label}</p>
        {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

// ── Main ──
export default function AnalyticsPage() {
  const { userId } = useUser();
  const { data: allRaw, isLoading: loadingAll } = useSupportAllTickets({}, { refetchInterval: 60000 });
  const { data: assignedRaw, isLoading: loadingAssigned } = useSupportAssignedTickets(userId, { refetchInterval: 60000 });
  const { data: globalStats } = useSupportGlobalStats({ refetchInterval: 60000 });

  const allTickets = useMemo(() => {
    const raw = allRaw?.data ?? allRaw;
    return Array.isArray(raw) ? raw : [];
  }, [allRaw]);

  const myTickets = useMemo(() => Array.isArray(assignedRaw) ? assignedRaw : [], [assignedRaw]);

  const isLoading = loadingAll || loadingAssigned;

  // ── Last 7 days — tickets created ──
  const days = useMemo(() => last7Days(), []);
  const dailyCreated = useMemo(() => {
    const counts = {};
    days.forEach(d => { counts[d.key] = 0; });
    allTickets.forEach(t => {
      const k = dayKey(t.created_at || t.createdAt);
      if (counts[k] !== undefined) counts[k]++;
    });
    return days.map(d => ({ label: d.label, value: counts[d.key] }));
  }, [allTickets, days]);

  const dailyResolved = useMemo(() => {
    const counts = {};
    days.forEach(d => { counts[d.key] = 0; });
    allTickets.forEach(t => {
      if (t.status === "resolved" || t.status === "closed") {
        const responses = t.responses || [];
        const lastResp = responses[responses.length - 1];
        const resolvedDate = lastResp?.timestamp || t.updated_at;
        if (resolvedDate) {
          const k = dayKey(resolvedDate);
          if (counts[k] !== undefined) counts[k]++;
        }
      }
    });
    return days.map(d => ({ label: d.label, value: counts[d.key] }));
  }, [allTickets, days]);

  // ── Category breakdown ──
  const categoryBreakdown = useMemo(() => {
    const counts = {};
    allTickets.forEach(t => {
      const cat = t.category || "other";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([label, value]) => ({ label, value }));
  }, [allTickets]);

  // ── Priority breakdown ──
  const priorityBreakdown = useMemo(() => {
    const counts = { high: 0, medium: 0, low: 0 };
    allTickets.forEach(t => { if (counts[t.priority] !== undefined) counts[t.priority]++; });
    return [
      { label: "High", value: counts.high, color: "bg-red-400" },
      { label: "Medium", value: counts.medium, color: "bg-amber-400" },
      { label: "Low", value: counts.low, color: "bg-green-400" },
    ];
  }, [allTickets]);

  // ── My metrics ──
  const myMetrics = useMemo(() => {
    const open = myTickets.filter(t => t.status === "open").length;
    const inProgress = myTickets.filter(t => t.status === "in-progress").length;
    const resolved = myTickets.filter(t => t.status === "resolved").length;
    const overdue = myTickets.filter(t => {
      const h = getHoursAgo(t.created_at || t.createdAt);
      return h > 24 && t.status !== "resolved" && t.status !== "closed";
    }).length;

    // Avg first response time (hours)
    let totalResponseHours = 0, responseCount = 0;
    myTickets.forEach(t => {
      if (t.responses?.length > 0) {
        const firstResp = t.responses[0];
        const created = new Date(t.created_at || t.createdAt).getTime();
        const resp = new Date(firstResp.timestamp).getTime();
        if (resp > created) {
          totalResponseHours += (resp - created) / 3600000;
          responseCount++;
        }
      }
    });
    const avgResponseHours = responseCount > 0 ? (totalResponseHours / responseCount).toFixed(1) : "—";

    // SLA compliance
    const slaBreached = myTickets.filter(t => {
      const h = getHoursAgo(t.created_at || t.createdAt);
      return h > 24 && t.status !== "resolved" && t.status !== "closed";
    }).length;
    const slaTotal = myTickets.filter(t => t.status !== "closed").length;
    const slaPct = slaTotal > 0 ? Math.round(((slaTotal - slaBreached) / slaTotal) * 100) : 100;

    const resolutionPct = myTickets.length > 0
      ? Math.round(((resolved) / myTickets.length) * 100)
      : 0;

    return { open, inProgress, resolved, overdue, avgResponseHours, slaPct, resolutionPct, total: myTickets.length };
  }, [myTickets]);

  // ── Team metrics ──
  const teamMetrics = useMemo(() => {
    const total = allTickets.length;
    const open = allTickets.filter(t => t.status === "open").length;
    const resolved = allTickets.filter(t => t.status === "resolved" || t.status === "closed").length;
    const inProgress = allTickets.filter(t => t.status === "in-progress").length;
    const resolutionPct = total > 0 ? Math.round((resolved / total) * 100) : 0;
    const slaBreached = allTickets.filter(t => {
      const h = getHoursAgo(t.created_at || t.createdAt);
      return h > 24 && t.status !== "resolved" && t.status !== "closed";
    }).length;
    const activeSla = allTickets.filter(t => t.status !== "closed").length;
    const slaPct = activeSla > 0 ? Math.round(((activeSla - slaBreached) / activeSla) * 100) : 100;
    return { total, open, resolved, inProgress, resolutionPct, slaPct };
  }, [allTickets]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-md">
          <BarChart2 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500">Your performance metrics and team insights</p>
        </div>
      </div>

      {/* ── My Performance ── */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">My Performance</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard icon={ClipboardList}  label="Assigned Tickets" value={myMetrics.total}           sub="Total assigned"      iconBg="bg-teal-50"    iconColor="text-teal-600" />
          <MetricCard icon={Clock}          label="Avg First Reply"  value={myMetrics.avgResponseHours === "—" ? "—" : `${myMetrics.avgResponseHours}h`} sub="First response time" iconBg="bg-blue-50"    iconColor="text-blue-600" />
          <MetricCard icon={AlertTriangle}  label="Overdue"          value={myMetrics.overdue}          sub="SLA breached"         iconBg="bg-red-50"     iconColor="text-red-600" />
          <MetricCard icon={CheckCircle2}   label="Resolved"         value={myMetrics.resolved}         sub={`${myMetrics.resolutionPct}% resolution`} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
        </div>
      </div>

      {/* ── SLA + Resolution rings ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Target className="w-4 h-4 text-teal-500" /> My SLA Compliance
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-around pt-0">
            <DonutRing pct={myMetrics.slaPct} colorClass="stroke-teal-500" label="SLA met" sublabel="My tickets" />
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                <span className="text-gray-600">Open</span>
                <span className="font-semibold ml-auto">{myMetrics.open}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                <span className="text-gray-600">In Progress</span>
                <span className="font-semibold ml-auto">{myMetrics.inProgress}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-gray-600">Resolved</span>
                <span className="font-semibold ml-auto">{myMetrics.resolved}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="text-gray-600">Overdue</span>
                <span className="font-semibold ml-auto text-red-600">{myMetrics.overdue}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" /> Team SLA Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-around pt-0">
            <DonutRing pct={teamMetrics.slaPct} colorClass="stroke-emerald-500" label="SLA met" sublabel="All tickets" />
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="text-gray-600">Open</span>
                <span className="font-semibold ml-auto">{teamMetrics.open}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                <span className="text-gray-600">In Progress</span>
                <span className="font-semibold ml-auto">{teamMetrics.inProgress}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-gray-600">Resolved</span>
                <span className="font-semibold ml-auto">{teamMetrics.resolved}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-xs">Total tickets</span>
                <span className="font-semibold ml-auto">{teamMetrics.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" /> Priority Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {priorityBreakdown.map(p => (
              <HBar key={p.label} label={p.label} value={p.value} total={allTickets.length} colorClass={p.color} />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ── 7-day trend ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-teal-500" /> New Tickets — Last 7 Days
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <BarChart data={dailyCreated} colorClass="bg-teal-400" height={100} />
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Resolved — Last 7 Days
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <BarChart data={dailyResolved} colorClass="bg-emerald-400" height={100} />
          </CardContent>
        </Card>
      </div>

      {/* ── Category distribution ── */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-blue-500" /> Category Distribution (All Tickets)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            {categoryBreakdown.map((c, i) => {
              const colors = ["bg-teal-400", "bg-blue-400", "bg-purple-400", "bg-amber-400", "bg-rose-400", "bg-green-400"];
              return (
                <HBar key={c.label} label={c.label} value={c.value} total={allTickets.length} colorClass={colors[i % colors.length]} />
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
