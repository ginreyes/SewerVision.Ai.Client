"use client";

import React from "react";
import {
  BarChart2, CheckCircle2, XCircle, Clock, Target,
  TrendingUp, Award, Zap, AlertTriangle, Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/components/providers/UserContext";
import { useQCReviewStats } from "@/hooks/useQueryHooks";

function StackedBar({ approved, rejected, maxTotal }) {
  const total = approved + rejected;
  const height = maxTotal > 0 ? (total / maxTotal) * 80 : 0;
  return (
    <div className="flex flex-col items-center" style={{ height: 80 }}>
      <div className="flex flex-col justify-end gap-0.5 w-full" style={{ height }}>
        <div className="w-full bg-red-400 rounded-t-none" style={{ height: `${total > 0 ? (rejected / total) * 100 : 0}%` }} />
        <div className="w-full bg-emerald-500" style={{ height: `${total > 0 ? (approved / total) * 100 : 0}%` }} />
      </div>
    </div>
  );
}

function DonutRing({ pct, color, size = 70 }) {
  const r = 26, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <circle cx="30" cy="30" r={r} fill="none" stroke="#f3f4f6" strokeWidth="7" />
      <circle cx="30" cy="30" r={r} fill="none" stroke={color} strokeWidth="7"
        strokeDasharray={`${dash} ${circ}`} strokeDashoffset={circ / 4} strokeLinecap="round" />
      <text x="30" y="34" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#111">{pct}%</text>
    </svg>
  );
}

export default function ReviewAnalytics() {
  const { user } = useUser();
  const userId = user?._id || user?.id;
  const { data: stats, isLoading } = useQCReviewStats(userId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  const weeklyData = stats?.weeklyData || [];
  const maxTotal = Math.max(...weeklyData.map(d => (d.approved || 0) + (d.rejected || 0)), 1);

  const totalReviewed = weeklyData.reduce((s, d) => s + (d.approved || 0) + (d.rejected || 0), 0);
  const totalApproved = weeklyData.reduce((s, d) => s + (d.approved || 0), 0);
  const approvalRate = stats?.approvalRate ?? (totalReviewed > 0 ? Math.round((totalApproved / totalReviewed) * 100) : 0);
  const consistencyScore = stats?.consistencyScore ?? 0;
  const avgReviewsPerDay = stats?.avgReviewsPerDay ?? 0;
  const defectDistribution = stats?.defectDistribution || [];

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-700 to-amber-500 flex items-center justify-center text-white shadow-md">
          <BarChart2 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Review Analytics</h1>
          <p className="text-sm text-gray-500">Personal performance — approval rates, review times, and consistency scores</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: "Reviewed This Week", value: totalReviewed, icon: BarChart2, bg: "bg-amber-50", color: "text-red-700" },
          { label: "Approved", value: totalApproved, icon: CheckCircle2, bg: "bg-emerald-50", color: "text-emerald-600" },
          { label: "Rejected", value: totalReviewed - totalApproved, icon: XCircle, bg: "bg-red-50", color: "text-red-600" },
          { label: "Approval Rate", value: `${approvalRate}%`, icon: Target, bg: "bg-blue-50", color: "text-blue-600" },
        ].map(s => (
          <Card key={s.label} className="border-gray-200">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.bg}`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Weekly chart */}
        <Card className="border-gray-200 col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Weekly Review Activity</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-end gap-3 mb-2">
              {weeklyData.map(d => (
                <div key={d.day} className="flex-1 flex flex-col items-center">
                  <StackedBar approved={d.approved || 0} rejected={d.rejected || 0} maxTotal={maxTotal} />
                  <span className="text-[10px] text-gray-400 mt-1">{d.day}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 text-[10px] text-gray-500 mt-2">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />Approved</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" />Rejected</span>
            </div>
          </CardContent>
        </Card>

        {/* Performance donuts */}
        <Card className="border-gray-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Performance Scores</CardTitle></CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="flex items-center justify-between">
              <DonutRing pct={approvalRate} color="#10b981" />
              <div className="flex-1 ml-3">
                <p className="text-xs font-semibold text-gray-700">Approval Rate</p>
                <p className="text-[10px] text-gray-400">This week</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <DonutRing pct={consistencyScore} color="#3b82f6" />
              <div className="flex-1 ml-3">
                <p className="text-xs font-semibold text-gray-700">Consistency Score</p>
                <p className="text-[10px] text-gray-400">vs team baseline</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <DonutRing pct={avgReviewsPerDay} color="#f59e0b" />
              <div className="flex-1 ml-3">
                <p className="text-xs font-semibold text-gray-700">Speed Score</p>
                <p className="text-[10px] text-gray-400">vs avg review time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Defect distribution */}
      <Card className="border-gray-200">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Defect Distribution Reviewed</CardTitle></CardHeader>
        <CardContent className="pt-0 space-y-2.5">
          {defectDistribution.map(d => (
            <div key={d.label} className="flex items-center gap-3">
              <span className="text-xs text-gray-700 w-20 shrink-0">{d.label}</span>
              <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${d.color || "bg-blue-500"}`} style={{ width: `${d.pct || 0}%` }} />
              </div>
              <span className="text-xs font-bold text-gray-700 w-8 text-right">{d.pct || 0}%</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
