"use client";

import React, { useState, useMemo, memo } from "react";
import {
  Users, TrendingUp, Award, AlertTriangle, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, Clock, Loader2, Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const StatCard = memo(({ title, value, icon: Icon, color, bg }) => (
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
));
StatCard.displayName = "StatCard";

const ProgressRow = memo(({ member, totalModules }) => {
  const [expanded, setExpanded] = useState(false);
  const pct = totalModules > 0 ? Math.round((member.modulesCompleted / totalModules) * 100) : 0;

  return (
    <div className="border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50/50 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-red-800 text-xs font-bold shrink-0">
          {member.user?.name?.[0]?.toUpperCase() || "?"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{member.user?.name || "Unknown"}</p>
          <p className="text-[11px] text-gray-400">{member.user?.email}</p>
        </div>
        <div className="w-28 shrink-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-gray-500">{member.modulesCompleted}/{totalModules}</span>
            <span className="text-[10px] font-bold text-gray-700">{pct}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-red-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="w-16 text-center shrink-0">
          <p className="text-sm font-bold text-gray-900">{member.avgScore}%</p>
          <p className="text-[10px] text-gray-400">Avg Score</p>
        </div>
        <div className="w-20 text-center shrink-0">
          <p className="text-xs text-gray-500">{member.totalAttempts} attempt{member.totalAttempts !== 1 ? "s" : ""}</p>
        </div>
        <div className="w-24 text-right shrink-0">
          <p className="text-xs text-gray-400">
            {member.lastActivity ? new Date(member.lastActivity).toLocaleDateString() : "No activity"}
          </p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
      </div>

      {expanded && member.bestByModule && (
        <div className="px-4 pb-3 pl-16">
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            {Object.entries(member.bestByModule).map(([moduleId, data]) => (
              <div key={moduleId} className="flex items-center gap-3 text-xs">
                {data.passed
                  ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  : <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                <span className="flex-1 text-gray-700 font-mono truncate">{moduleId.slice(-8)}</span>
                <Badge variant="outline" className={`text-[10px] ${data.passed ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                  {data.score}%
                </Badge>
                <span className="text-gray-400">{new Date(data.date).toLocaleDateString()}</span>
              </div>
            ))}
            {Object.keys(member.bestByModule).length === 0 && (
              <p className="text-xs text-gray-400 italic">No attempts yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
});
ProgressRow.displayName = "ProgressRow";

export default function TeamProgressView({ progress, isLoading }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-red-600" />
      </div>
    );
  }

  const data = Array.isArray(progress) ? progress : [];
  const totalModules = data.length > 0 ? data[0]?.totalModules || 0 : 0;

  const stats = useMemo(() => {
    if (data.length === 0) return { techs: 0, avgCompletion: 0, topPerformer: null, needsAttention: 0 };
    const avgCompletion = Math.round(data.reduce((s, m) => s + (totalModules > 0 ? (m.modulesCompleted / totalModules) * 100 : 0), 0) / data.length);
    const topPerformer = data.reduce((top, m) => (m.avgScore > (top?.avgScore || 0) ? m : top), null);
    const needsAttention = data.filter(m => m.modulesCompleted === 0 && m.totalAttempts === 0).length;
    return { techs: data.length, avgCompletion, topPerformer, needsAttention };
  }, [data, totalModules]);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard title="QC Technicians" value={stats.techs} icon={Users} color="text-red-700" bg="bg-amber-50" />
        <StatCard title="Avg Completion" value={`${stats.avgCompletion}%`} icon={TrendingUp} color="text-blue-600" bg="bg-blue-50" />
        <StatCard title="Top Performer" value={stats.topPerformer?.user?.name?.split(' ')[0] || "—"} icon={Award} color="text-amber-600" bg="bg-amber-50" />
        <StatCard title="Needs Attention" value={stats.needsAttention} icon={AlertTriangle} color="text-red-600" bg="bg-red-50" />
      </div>

      {/* Table */}
      <Card className="border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="w-4 h-4 text-red-600" /> Team Training Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Header row */}
          <div className="flex items-center gap-4 px-4 py-2.5 bg-gray-50/80 border-b border-gray-100 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
            <div className="w-8 shrink-0" />
            <div className="flex-1">Technician</div>
            <div className="w-28 shrink-0 text-center">Progress</div>
            <div className="w-16 shrink-0 text-center">Score</div>
            <div className="w-20 shrink-0 text-center">Attempts</div>
            <div className="w-24 shrink-0 text-right">Last Active</div>
            <div className="w-4 shrink-0" />
          </div>

          {data.map(member => (
            <ProgressRow key={member.user?._id} member={member} totalModules={totalModules} />
          ))}

          {data.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No QC technicians found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
