"use client";

import React, { useState, useMemo, memo } from "react";
import dynamic from "next/dynamic";
import {
  MapPin, Activity, Clock, CheckCircle2, Circle, Users,
  Navigation, Loader2, ChevronRight, FolderOpen, User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { avatarSrc, getAvatarColor, getInitials } from "@/components/admin/constants";

const ProjectMap = dynamic(() => import("@/components/customer/ProjectMap"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 overflow-hidden relative" style={{ height: 320 }}>
      <div className="absolute inset-0 animate-pulse">
        <div className="h-full w-full bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200" />
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-sm">
          <Navigation className="w-5 h-5 text-gray-400 animate-pulse" />
        </div>
        <p className="text-xs text-gray-400 font-medium">Loading map...</p>
      </div>
    </div>
  ),
});

const STATUS_CONFIG = {
  "in-progress": { color: "bg-blue-100 text-blue-700 border-blue-200", dot: "bg-blue-500 animate-pulse", label: "In Progress", barColor: "bg-blue-500" },
  "field-capture": { color: "bg-blue-100 text-blue-700 border-blue-200", dot: "bg-blue-500 animate-pulse", label: "Field Capture", barColor: "bg-blue-500" },
  "ai-processing": { color: "bg-purple-100 text-purple-700 border-purple-200", dot: "bg-purple-500 animate-pulse", label: "AI Processing", barColor: "bg-purple-500" },
  "qc-review": { color: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500 animate-pulse", label: "QC Review", barColor: "bg-amber-500" },
  uploading: { color: "bg-cyan-100 text-cyan-700 border-cyan-200", dot: "bg-cyan-500 animate-pulse", label: "Uploading", barColor: "bg-cyan-500" },
  completed: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", label: "Completed", barColor: "bg-emerald-500" },
  "customer-notified": { color: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", label: "Delivered", barColor: "bg-emerald-500" },
  planning: { color: "bg-gray-100 text-gray-600 border-gray-200", dot: "bg-gray-400", label: "Planning", barColor: "bg-gray-400" },
  "on-hold": { color: "bg-red-100 text-red-600 border-red-200", dot: "bg-red-400", label: "On Hold", barColor: "bg-red-400" },
};

const STATUS_PCT = {
  planning: 10, "field-capture": 30, uploading: 45, "ai-processing": 55,
  "qc-review": 75, completed: 100, "customer-notified": 100, "on-hold": 0,
};

function getTeamMember(project, label) {
  if (label === "Team Lead" && project.managerId) {
    const m = project.managerId;
    if (typeof m === "object" && m.first_name) return { name: `${m.first_name} ${m.last_name || ""}`.trim(), id: m._id };
  }
  if (label === "Operator" && project.assignedOperator?.userId) {
    const u = project.assignedOperator.userId;
    if (typeof u === "object" && u.first_name) return { name: `${u.first_name} ${u.last_name || ""}`.trim(), id: u._id };
  }
  if (label === "QC Tech" && project.qcTechnician?.userId) {
    const u = project.qcTechnician.userId;
    if (typeof u === "object" && u.first_name) return { name: `${u.first_name} ${u.last_name || ""}`.trim(), id: u._id };
  }
  return null;
}

const ProjectLiveTrackerView = memo(function ProjectLiveTrackerView({
  projects = [],
  isLoading = false,
  theme = "rose",
}) {
  const [selected, setSelected] = useState(null);

  const selectedProject = useMemo(
    () => (selected ? projects.find(p => (p._id || p.id) === selected) : null),
    [selected, projects]
  );

  const themeColors = theme === "indigo"
    ? { accent: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-300", ring: "ring-indigo-200", gradient: "from-indigo-500 to-purple-600" }
    : theme === "blue"
      ? { accent: "text-blue-600", bg: "bg-blue-50", border: "border-blue-300", ring: "ring-blue-200", gradient: "from-blue-500 to-indigo-600" }
      : { accent: "text-rose-600", bg: "bg-rose-50", border: "border-rose-300", ring: "ring-rose-200", gradient: "from-rose-500 to-red-600" };

  const activeCount = projects.filter(p => !["completed", "customer-notified", "on-hold"].includes(p.status)).length;
  const completedCount = projects.filter(p => ["completed", "customer-notified"].includes(p.status)).length;

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Projects", value: projects.length, icon: FolderOpen, bg: themeColors.bg, color: themeColors.accent },
          { label: "Active", value: activeCount, icon: Activity, bg: "bg-blue-50", color: "text-blue-600" },
          { label: "Completed", value: completedCount, icon: CheckCircle2, bg: "bg-emerald-50", color: "text-emerald-600" },
        ].map(s => (
          <Card key={s.label} className="border-gray-200">
            <CardContent className="p-3 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.bg}`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{s.value}</p>
                <p className="text-[10px] text-gray-500 dark:!text-gray-300">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-4">
        {/* ── Enhanced Sidebar ── */}
        <div className="w-80 shrink-0 space-y-1.5 max-h-[520px] overflow-y-auto pr-1 scrollbar-thin">
          {projects.map(p => {
            const id = p._id || p.id;
            const cfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.planning;
            const pct = p.progress || STATUS_PCT[p.status] || 0;
            const isSelected = selected === id;
            const teamLead = getTeamMember(p, "Team Lead");
            const operator = getTeamMember(p, "Operator");

            return (
              <button key={id} onClick={() => setSelected(isSelected ? null : id)}
                className={`group w-full text-left rounded-xl border transition-all overflow-hidden ${
                  isSelected
                    ? `${themeColors.border} ${themeColors.bg} shadow-sm ring-1 ${themeColors.ring}`
                    : "border-gray-200 dark:border-[#27272a] bg-white dark:!bg-[#111114] hover:border-gray-300 dark:hover:border-[#3f3f46] hover:shadow-sm dark:hover:shadow-black/40"
                }`}>
                {/* Status color stripe — full width, filled portion brighter */}
                <div className="relative h-1 bg-gray-100 dark:bg-white/[0.04]">
                  <div className={`absolute inset-y-0 left-0 ${cfg.barColor} transition-all`} style={{ width: `${pct}%` }} />
                </div>

                <div className="p-3">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.dot} shadow-[0_0_6px_currentColor]`} />
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-50 truncate">{p.name}</p>
                    </div>
                    <Badge variant="outline" className={`text-[9px] shrink-0 ${cfg.color}`}>{cfg.label}</Badge>
                  </div>

                  {/* Location */}
                  {p.location && (
                    <p className="text-[10px] text-gray-400 dark:!text-gray-300 flex items-center gap-1 mb-2.5 truncate">
                      <MapPin className="w-2.5 h-2.5 shrink-0" />{p.location}
                    </p>
                  )}

                  {/* Progress bar */}
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${cfg.barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 dark:!text-gray-200 tabular-nums w-8 text-right">{pct}%</span>
                  </div>

                  {/* Team member chips — legible in both modes */}
                  {(teamLead || operator) && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {teamLead && (
                        <div
                          title={`Team Lead: ${teamLead.name}`}
                          className="flex items-center gap-1.5 bg-indigo-50 dark:!bg-indigo-500/15 ring-1 ring-inset ring-indigo-100 dark:!ring-indigo-400/25 rounded-full pl-0.5 pr-2 py-0.5"
                        >
                          <img src={avatarSrc({ _id: teamLead.id })} alt="" className="w-4 h-4 rounded-full object-cover ring-1 ring-white/70 dark:ring-[#111114]"
                            onError={(e) => { e.target.style.display = 'none'; }} />
                          <span className="text-[10px] font-semibold text-indigo-700 dark:!text-indigo-200 truncate max-w-[64px] leading-none">
                            {teamLead.name.split(' ')[0]}
                          </span>
                        </div>
                      )}
                      {operator && (
                        <div
                          title={`Operator: ${operator.name}`}
                          className="flex items-center gap-1.5 bg-blue-50 dark:!bg-blue-500/15 ring-1 ring-inset ring-blue-100 dark:!ring-blue-400/25 rounded-full pl-0.5 pr-2 py-0.5"
                        >
                          <img src={avatarSrc({ _id: operator.id })} alt="" className="w-4 h-4 rounded-full object-cover ring-1 ring-white/70 dark:ring-[#111114]"
                            onError={(e) => { e.target.style.display = 'none'; }} />
                          <span className="text-[10px] font-semibold text-blue-700 dark:!text-blue-200 truncate max-w-[64px] leading-none">
                            {operator.name.split(' ')[0]}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
          {projects.length === 0 && (
            <div className="text-center py-14 text-gray-400">
              <MapPin className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No projects to display</p>
            </div>
          )}
        </div>

        {/* ── Map + Detail ── */}
        <div className="flex-1 min-w-0 space-y-3">
          <ProjectMap
            projects={projects}
            selected={selected}
            onSelectProject={setSelected}
            height={320}
          />

          {selectedProject && (() => {
            const cfg = STATUS_CONFIG[selectedProject.status] || STATUS_CONFIG.planning;
            const pct = selectedProject.progress || STATUS_PCT[selectedProject.status] || 0;
            const teamLead = getTeamMember(selectedProject, "Team Lead");
            const operator = getTeamMember(selectedProject, "Operator");
            const qcTech = getTeamMember(selectedProject, "QC Tech");

            return (
              <Card className="border-gray-200 overflow-hidden">
                {/* Color bar */}
                <div className={`h-1.5 ${cfg.barColor}`} />
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{selectedProject.name}</h3>
                      {selectedProject.location && (
                        <p className="text-xs text-gray-500 dark:!text-gray-300 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />{selectedProject.location}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className={`${cfg.color} text-xs`}>{cfg.label}</Badge>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-medium text-gray-600">Progress</span>
                      <span className="font-bold text-emerald-600">{pct}%</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${cfg.barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  {/* Team members */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Team Lead", member: teamLead, bg: "bg-indigo-50", color: "text-indigo-600", icon: "bg-indigo-100" },
                      { label: "Operator", member: operator, bg: "bg-blue-50", color: "text-blue-600", icon: "bg-blue-100" },
                      { label: "QC Tech", member: qcTech, bg: "bg-rose-50", color: "text-rose-600", icon: "bg-rose-100" },
                    ].map(t => (
                      <div key={t.label} className={`${t.bg} rounded-xl p-2.5`}>
                        <p className={`text-[10px] font-medium ${t.color} mb-1.5 flex items-center gap-1`}>
                          <User className="w-3 h-3" />{t.label}
                        </p>
                        {t.member ? (
                          <div className="flex items-center gap-1.5">
                            <img src={avatarSrc({ _id: t.member.id })} alt=""
                              className="w-6 h-6 rounded-full object-cover"
                              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling && (e.target.nextSibling.style.display = 'flex'); }} />
                            <div className={`w-6 h-6 rounded-full items-center justify-center text-white text-[8px] font-bold ${getAvatarColor(t.member.name)}`}
                              style={{ display: 'none' }}>{getInitials(t.member.name)}</div>
                            <span className="text-xs font-medium text-gray-800 truncate">{t.member.name}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-400 dark:!text-gray-300">Not assigned</span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })()}
        </div>
      </div>
    </div>
  );
});

export default ProjectLiveTrackerView;
