"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  TrendingUp, Star, Users, CheckCircle2, Clock, Award,
  Target, BarChart2, Loader2, CalendarDays, Activity,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/components/providers/UserContext";
import { useUserTeamMetrics, useUserTeamSummary } from "@/hooks/useQueryHooks";
import { MemberCard, ScoreBar } from "@/components/user/performance-reviews";
import { ListSkeleton } from '@/components/shared/SkeletonLoading';
import { BarChart } from "@/components/shared/charts";

function StarScore({ score }) {
  const stars = Math.round(score / 20);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i <= stars ? "text-amber-400 fill-amber-400" : "text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

const AVATAR_COLORS = [
  "bg-indigo-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500",
  "bg-sky-500", "bg-violet-500", "bg-orange-500", "bg-teal-500",
];

const fullName = (u) =>
  [u?.first_name, u?.last_name].filter(Boolean).join(" ").trim() ||
  u?.username || u?.email || "Unknown";

const initials = (u) => {
  const f = (u?.first_name || u?.username || "?").trim()[0] || "?";
  const l = (u?.last_name || "").trim()[0] || "";
  return (f + l).toUpperCase();
};

// Backend returns raw PerformanceMetrics docs with a populated `teamMember`.
// MemberCard expects a flat shape — normalize here once so the rest of the
// page can stay declarative.
function normalizeMetric(doc, idx) {
  const tm = doc.teamMember || {};
  return {
    id: String(doc._id),
    memberId: tm._id ? String(tm._id) : null,
    name: fullName(tm),
    role: tm.role || "—",
    avatar: initials(tm),
    color: AVATAR_COLORS[idx % AVATAR_COLORS.length],
    qualityScore: Number(doc.qualityScore) || 0,
    completionRate: Number(doc.completionRate) || 0,
    responseTime: doc.responseTime != null ? `${doc.responseTime}h` : "—",
    reviews: Number(doc.totalReviews) || 0,
    trend: doc.trend || "0%",
    createdAt: doc.createdAt,
  };
}

// Build a 30-day submissions histogram (oldest → today) from raw metric docs.
function build30DayTrend(rawDocs) {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push({
      iso: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("en-US", { day: "numeric" }),
      value: 0,
    });
  }
  const idx = new Map(days.map((d, i) => [d.iso, i]));
  for (const doc of rawDocs) {
    const c = doc.createdAt;
    if (!c) continue;
    const iso = new Date(c).toISOString().slice(0, 10);
    if (idx.has(iso)) days[idx.get(iso)].value += 1;
  }
  return days;
}

export default function PerformanceReviews() {
  const { userId } = useUser();
  const { data: metricsData, isLoading: metricsLoading } = useUserTeamMetrics(userId);
  const { data: summaryData, isLoading: summaryLoading } = useUserTeamSummary(userId);

  const [selected, setSelected] = useState(null);

  const rawTeam = useMemo(
    () => (Array.isArray(metricsData) ? metricsData : metricsData?.data || []),
    [metricsData]
  );

  const team = useMemo(() => rawTeam.map(normalizeMetric), [rawTeam]);

  const sortedTeam = useMemo(
    () => [...team].sort((a, b) => b.qualityScore - a.qualityScore),
    [team]
  );

  const trend30d = useMemo(() => build30DayTrend(rawTeam), [rawTeam]);

  // At-a-glance KPIs sourced from the existing /summary endpoint.
  // Falls back to client-side derivation when summary hasn't loaded.
  const ataGlance = useMemo(() => {
    const summary = summaryData || {};
    const fallbackQuality = team.length
      ? team.reduce((s, m) => s + m.qualityScore, 0) / team.length
      : 0;
    const fallbackCompletion = team.length
      ? team.reduce((s, m) => s + m.completionRate, 0) / team.length
      : 0;
    return {
      avgScore: Math.round(summary.avgQualityScore ?? fallbackQuality),
      onTimePct: Math.round(summary.avgCompletionRate ?? fallbackCompletion),
      cycleCount: Number(summary.totalEntries ?? team.length) || 0,
      submissions30d: trend30d.reduce((s, d) => s + d.value, 0),
    };
  }, [summaryData, team, trend30d]);

  const selectedMember = useMemo(
    () => sortedTeam.find(m => m.id === selected) ?? sortedTeam[0] ?? null,
    [sortedTeam, selected]
  );

  const effectiveSelected = selectedMember?.id ?? null;

  const stats = useMemo(() => {
    if (sortedTeam.length === 0) {
      return { avgCompletion: 0, avgQuality: 0, topPerformerName: "-" };
    }
    const avgCompletion = Math.round(
      sortedTeam.reduce((s, m) => s + m.completionRate, 0) / sortedTeam.length
    );
    const avgQuality = Math.round(
      sortedTeam.reduce((s, m) => s + m.qualityScore, 0) / sortedTeam.length
    );
    const topPerformerName = sortedTeam[0]?.name?.split(" ")[0] ?? "-";
    return { avgCompletion, avgQuality, topPerformerName };
  }, [sortedTeam]);

  const handleSelect = useCallback((id) => {
    setSelected(id);
  }, []);

  const isLoading = metricsLoading || summaryLoading;

  if (isLoading) return (<ListSkeleton />)
  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white shadow-md">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Performance Reviews</h1>
            <p className="text-sm text-gray-500">Track team member performance and generate review summaries</p>
          </div>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5">
          Generate Report
        </Button>
      </div>

      {/* Team stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Avg Completion Rate", value: `${stats.avgCompletion}%`, icon: CheckCircle2, bg: "bg-indigo-50", color: "text-indigo-600" },
          { label: "Avg Quality Score", value: `${stats.avgQuality}%`, icon: Target, bg: "bg-purple-50", color: "text-purple-600" },
          { label: "Top Performer", value: stats.topPerformerName, icon: Award, bg: "bg-amber-50", color: "text-amber-600" },
        ].map(s => (
          <Card key={s.label} className="border-gray-200">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.bg}`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div>
                <p className="text-base font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* At a glance — sourced from /api/performance-reviews/summary */}
      <Card className="border-gray-200 mb-5">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              <h2 className="text-sm font-semibold text-gray-900">At a glance</h2>
            </div>
            <span className="text-[11px] text-gray-400">Last 30 days</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100/60 p-3">
              <div className="flex items-center gap-1.5 text-[11px] text-indigo-700 font-medium mb-1">
                <Target className="w-3 h-3" /> Avg score
              </div>
              <p className="text-xl font-bold text-gray-900">{ataGlance.avgScore}<span className="text-xs text-gray-400 font-medium">/100</span></p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100/60 p-3">
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium mb-1">
                <CheckCircle2 className="w-3 h-3" /> On-time
              </div>
              <p className="text-xl font-bold text-gray-900">{ataGlance.onTimePct}<span className="text-xs text-gray-400 font-medium">%</span></p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-amber-50 to-white border border-amber-100/60 p-3">
              <div className="flex items-center gap-1.5 text-[11px] text-amber-700 font-medium mb-1">
                <CalendarDays className="w-3 h-3" /> Cycles
              </div>
              <p className="text-xl font-bold text-gray-900">{ataGlance.cycleCount}</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-violet-50 to-white border border-violet-100/60 p-3">
              <div className="flex items-center gap-1.5 text-[11px] text-violet-700 font-medium mb-1">
                <BarChart2 className="w-3 h-3" /> Submissions (30d)
              </div>
              <p className="text-xl font-bold text-gray-900">{ataGlance.submissions30d}</p>
            </div>
          </div>

          <div className="mt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                Metrics submissions, last 30 days
              </span>
              <span className="text-[10px] text-gray-400">
                {trend30d[0]?.iso} → {trend30d[trend30d.length - 1]?.iso}
              </span>
            </div>
            {trend30d.every((d) => d.value === 0) ? (
              <div className="h-20 flex items-center justify-center text-xs text-gray-400">
                No submissions in the last 30 days.
              </div>
            ) : (
              <BarChart
                data={trend30d}
                colorClass="bg-indigo-500"
                height={80}
                showValues={false}
                showLabels={false}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {sortedTeam.length === 0 ? (
        <Card className="border-gray-200">
          <CardContent className="p-12 text-center text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No team members with performance data found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex gap-4">
          {/* Team list */}
          <div className="w-72 shrink-0 space-y-2">
            {sortedTeam.map((m, rank) => (
              <MemberCard
                key={m.id}
                member={m}
                rank={rank}
                isSelected={effectiveSelected === m.id}
                onSelect={handleSelect}
              />
            ))}
          </div>

          {/* Member detail */}
          {selectedMember && (
            <div className="flex-1 min-w-0">
              <Card className="border-gray-200">
                <CardContent className="p-5">
                  {/* Header */}
                  <div className="flex items-center gap-4 mb-5 pb-4 border-b border-gray-100">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-bold shrink-0 ${selectedMember.color}`}
                    >
                      {selectedMember.avatar}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-base font-bold text-gray-900">{selectedMember.name}</h2>
                      <p className="text-sm text-gray-500 capitalize">{selectedMember.role}</p>
                      <StarScore score={selectedMember.qualityScore} />
                    </div>
                    <div
                      className={`text-lg font-bold px-3 py-1 rounded-xl ${
                        selectedMember.trend?.startsWith("+")
                          ? "text-emerald-700 bg-emerald-50"
                          : "text-red-600 bg-red-50"
                      }`}
                    >
                      {selectedMember.trend}
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-medium text-gray-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />Completion Rate
                        </span>
                        <span className="text-gray-500">{selectedMember.reviews} tasks completed</span>
                      </div>
                      <ScoreBar value={selectedMember.completionRate} color="bg-emerald-500" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-medium text-gray-700 flex items-center gap-1">
                          <Target className="w-3.5 h-3.5 text-indigo-500" />Quality Score
                        </span>
                      </div>
                      <ScoreBar value={selectedMember.qualityScore} color="bg-indigo-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xl font-bold text-gray-900">{selectedMember.responseTime}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />Avg Response Time
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xl font-bold text-gray-900">{selectedMember.reviews}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <BarChart2 className="w-3 h-3" />Total Reviews
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
