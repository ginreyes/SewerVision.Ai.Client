"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  TrendingUp, Star, Users, CheckCircle2, Clock, Award,
  Target, BarChart2, Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/components/providers/UserContext";
import { useUserTeamMetrics, useUserTeamSummary } from "@/hooks/useQueryHooks";
import { MemberCard, ScoreBar } from "@/components/user/performance-reviews";
import { ListSkeleton } from '@/components/shared/SkeletonLoading';

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

export default function PerformanceReviews() {
  const { userId } = useUser();
  const { data: metricsData, isLoading: metricsLoading } = useUserTeamMetrics(userId);
  const { data: summaryData, isLoading: summaryLoading } = useUserTeamSummary(userId);

  const [selected, setSelected] = useState(null);

  const team = useMemo(() => Array.isArray(metricsData) ? metricsData : (metricsData?.data || []), [metricsData]);

  const sortedTeam = useMemo(
    () => [...team].sort((a, b) => b.qualityScore - a.qualityScore),
    [team]
  );

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

  return (<ListSkeleton />)

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
