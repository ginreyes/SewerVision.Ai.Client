"use client";

import React, { memo, useMemo } from "react";
import {
  GraduationCap, Users, TrendingUp, Award, BookOpen, Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const DIFF_COLORS = {
  beginner: "bg-emerald-100 text-emerald-700",
  intermediate: "bg-amber-100 text-amber-700",
  advanced: "bg-red-100 text-red-700",
};

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

export default function TrainingOverview({ modules, progress }) {
  const team = Array.isArray(progress) ? progress : [];
  const mods = Array.isArray(modules) ? modules : [];
  const totalModules = mods.length;

  const stats = useMemo(() => {
    const avgCompletion = team.length > 0
      ? Math.round(team.reduce((s, m) => s + (totalModules > 0 ? (m.modulesCompleted / totalModules) * 100 : 0), 0) / team.length) : 0;
    const avgScore = team.length > 0 ? Math.round(team.reduce((s, m) => s + (m.avgScore || 0), 0) / team.length) : 0;
    const top = team.reduce((best, m) => (m.avgScore > (best?.avgScore || 0) ? m : best), null);
    return { techs: team.length, avgCompletion, avgScore, topPerformer: top?.user?.name || "—" };
  }, [team, totalModules]);

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard title="Training Modules" value={totalModules} icon={BookOpen} color="text-rose-600" bg="bg-rose-50" />
        <StatCard title="QC Technicians" value={stats.techs} icon={Users} color="text-blue-600" bg="bg-blue-50" />
        <StatCard title="Avg Completion" value={`${stats.avgCompletion}%`} icon={TrendingUp} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard title="Avg Score" value={`${stats.avgScore}%`} icon={Target} color="text-amber-600" bg="bg-amber-50" />
      </div>

      {/* Module list */}
      <Card className="border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-rose-500" /> All Training Modules
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Module</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Category</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Difficulty</th>
                <th className="text-center text-xs font-semibold text-gray-500 px-4 py-3">Questions</th>
                <th className="text-center text-xs font-semibold text-gray-500 px-4 py-3">Pass Score</th>
              </tr>
            </thead>
            <tbody>
              {mods.map(mod => (
                <tr key={mod._id || mod.id} className="border-b border-gray-50 hover:bg-gray-50/60">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{mod.title}</p>
                    {mod.description && <p className="text-[11px] text-gray-400 line-clamp-1">{mod.description}</p>}
                  </td>
                  <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">{mod.category}</Badge></td>
                  <td className="px-4 py-3"><Badge variant="outline" className={`text-[10px] capitalize ${DIFF_COLORS[mod.difficulty] || ""}`}>{mod.difficulty}</Badge></td>
                  <td className="px-4 py-3 text-center text-xs text-gray-700">{mod.questions?.length || 0}</td>
                  <td className="px-4 py-3 text-center text-xs font-bold text-gray-700">{mod.passingScore || 70}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          {mods.length === 0 && (
            <div className="text-center py-8 text-gray-400"><p className="text-xs">No training modules</p></div>
          )}
        </CardContent>
      </Card>

      {/* Team progress summary */}
      <Card className="border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-rose-500" /> QC Tech Progress Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Technician</th>
                <th className="text-center text-xs font-semibold text-gray-500 px-4 py-3">Completed</th>
                <th className="text-center text-xs font-semibold text-gray-500 px-4 py-3">Avg Score</th>
                <th className="text-center text-xs font-semibold text-gray-500 px-4 py-3">Attempts</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {team.map(m => (
                <tr key={m.user?._id} className="border-b border-gray-50 hover:bg-gray-50/60">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{m.user?.name || "Unknown"}</td>
                  <td className="px-4 py-3 text-center text-xs">{m.modulesCompleted}/{totalModules}</td>
                  <td className="px-4 py-3 text-center text-xs font-bold">{m.avgScore}%</td>
                  <td className="px-4 py-3 text-center text-xs text-gray-500">{m.totalAttempts}</td>
                  <td className="px-4 py-3 text-right text-xs text-gray-400">{m.lastActivity ? new Date(m.lastActivity).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {team.length === 0 && (
            <div className="text-center py-8 text-gray-400"><p className="text-xs">No QC technicians found</p></div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
