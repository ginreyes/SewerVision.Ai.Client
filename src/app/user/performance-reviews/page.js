"use client";

import React, { useState } from "react";
import {
  TrendingUp, Star, Users, CheckCircle2, Clock, Award,
  ChevronRight, Target, BarChart2, ThumbsUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TEAM = [
  { id: "u1", name: "Alex Torres", role: "operator", avatar: "AT", color: "bg-blue-500", completionRate: 94, qualityScore: 88, responseTime: "1.2d", reviews: 47, trend: "+3%" },
  { id: "u2", name: "Maria Chen", role: "qc-technician", avatar: "MC", color: "bg-pink-500", completionRate: 98, qualityScore: 96, responseTime: "0.8d", reviews: 312, trend: "+8%" },
  { id: "u3", name: "James Park", role: "operator", avatar: "JP", color: "bg-indigo-500", completionRate: 87, qualityScore: 82, responseTime: "1.8d", reviews: 38, trend: "-2%" },
  { id: "u4", name: "Priya Singh", role: "qc-technician", avatar: "PS", color: "bg-purple-500", completionRate: 91, qualityScore: 89, responseTime: "1.0d", reviews: 201, trend: "+5%" },
  { id: "u5", name: "Tom Walsh", role: "operator", avatar: "TW", color: "bg-teal-500", completionRate: 79, qualityScore: 75, responseTime: "2.2d", reviews: 29, trend: "-5%" },
];

function ScoreBar({ value, color = "bg-indigo-500" }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-bold text-gray-700 w-8 text-right">{value}%</span>
    </div>
  );
}

function StarScore({ score }) {
  const stars = Math.round(score / 20);
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => <Star key={i} className={`w-3.5 h-3.5 ${i <= stars ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />)}
    </div>
  );
}

export default function PerformanceReviews() {
  const [selected, setSelected] = useState("u2");
  const selectedMember = TEAM.find(m => m.id === selected);

  const avgCompletion = Math.round(TEAM.reduce((s, m) => s + m.completionRate, 0) / TEAM.length);
  const avgQuality = Math.round(TEAM.reduce((s, m) => s + m.qualityScore, 0) / TEAM.length);
  const topPerformer = TEAM.reduce((best, m) => m.qualityScore > best.qualityScore ? m : best);

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
          { label: "Avg Completion Rate", value: `${avgCompletion}%`, icon: CheckCircle2, bg: "bg-indigo-50", color: "text-indigo-600" },
          { label: "Avg Quality Score", value: `${avgQuality}%`, icon: Target, bg: "bg-purple-50", color: "text-purple-600" },
          { label: "Top Performer", value: topPerformer.name.split(" ")[0], icon: Award, bg: "bg-amber-50", color: "text-amber-600" },
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

      <div className="flex gap-4">
        {/* Team list */}
        <div className="w-72 shrink-0 space-y-2">
          {TEAM.sort((a, b) => b.qualityScore - a.qualityScore).map((m, rank) => (
            <button key={m.id} onClick={() => setSelected(m.id)}
              className={`w-full text-left p-3 rounded-xl border transition-all ${selected === m.id ? "border-indigo-300 bg-indigo-50" : "border-gray-200 bg-white hover:border-indigo-200"}`}>
              <div className="flex items-center gap-2.5">
                <div className="relative shrink-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold ${m.color}`}>{m.avatar}</div>
                  {rank === 0 && <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center text-[8px] font-bold text-white">1</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{m.name}</p>
                  <p className="text-[10px] text-gray-400 capitalize">{m.role}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-xs font-bold ${m.trend.startsWith("+") ? "text-emerald-600" : "text-red-500"}`}>{m.trend}</p>
                  <StarScore score={m.qualityScore} />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Member detail */}
        {selectedMember && (
          <div className="flex-1 min-w-0">
            <Card className="border-gray-200">
              <CardContent className="p-5">
                {/* Header */}
                <div className="flex items-center gap-4 mb-5 pb-4 border-b border-gray-100">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-bold shrink-0 ${selectedMember.color}`}>
                    {selectedMember.avatar}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-base font-bold text-gray-900">{selectedMember.name}</h2>
                    <p className="text-sm text-gray-500 capitalize">{selectedMember.role}</p>
                    <StarScore score={selectedMember.qualityScore} />
                  </div>
                  <div className={`text-lg font-bold px-3 py-1 rounded-xl ${selectedMember.trend.startsWith("+") ? "text-emerald-700 bg-emerald-50" : "text-red-600 bg-red-50"}`}>
                    {selectedMember.trend}
                  </div>
                </div>

                {/* Metrics */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-medium text-gray-700 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />Completion Rate</span>
                      <span className="text-gray-500">{selectedMember.reviews} tasks completed</span>
                    </div>
                    <ScoreBar value={selectedMember.completionRate} color="bg-emerald-500" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-medium text-gray-700 flex items-center gap-1"><Target className="w-3.5 h-3.5 text-indigo-500" />Quality Score</span>
                    </div>
                    <ScoreBar value={selectedMember.qualityScore} color="bg-indigo-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xl font-bold text-gray-900">{selectedMember.responseTime}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" />Avg Response Time</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xl font-bold text-gray-900">{selectedMember.reviews}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><BarChart2 className="w-3 h-3" />Total Reviews</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
