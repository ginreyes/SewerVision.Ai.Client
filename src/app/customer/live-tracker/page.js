"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import {
  MapPin, Activity, Clock, CheckCircle2, Circle, ChevronRight,
  Navigation, Users, Camera, AlertCircle, RefreshCw, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/components/providers/UserContext";
import { useCustomerTracker } from "@/hooks/useQueryHooks";

// Dynamic import — Leaflet doesn't work with SSR
const ProjectMap = dynamic(() => import("@/components/customer/ProjectMap"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center" style={{ height: 220 }}>
      <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
    </div>
  ),
});

const STATUS_CONFIG = {
  "in-progress": { color: "bg-blue-100 text-blue-700 border-blue-200", dot: "bg-blue-500 animate-pulse", label: "In Progress" },
  completed: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", label: "Completed" },
  pending: { color: "bg-gray-100 text-gray-600 border-gray-200", dot: "bg-gray-400", label: "Pending" },
};

export default function LiveProjectTracker() {
  const { userId } = useUser();
  const { data: projects = [], isLoading, refetch, isFetching } = useCustomerTracker(userId);
  const [selected, setSelected] = useState(null);

  const selectedProject = selected ? projects.find(p => p._id === selected) : projects[0];

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
        <p className="text-sm text-gray-500">Loading your projects…</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Live Project Tracker</h1>
            <p className="text-sm text-gray-500">Real-time progress of your active inspections</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Activity className="w-10 h-10 mb-2 opacity-30" />
          <p className="text-sm">No projects to track yet</p>
        </div>
      ) : (
        <div className="flex gap-4">
          {/* Project list */}
          <div className="w-72 shrink-0 space-y-2">
            {projects.map(p => {
              const cfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending;
              const isSelected = selectedProject?._id === p._id;
              return (
                <button key={p._id} onClick={() => setSelected(p._id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${isSelected ? "border-emerald-300 bg-emerald-50" : "border-gray-200 bg-white hover:border-emerald-200"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                    <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${p.pct}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>{p.pct}% complete</span>
                    <span>{p.lastUpdate}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detail */}
          {selectedProject && (
            <div className="flex-1 min-w-0 space-y-3">
              {/* Real Map with Leaflet + OpenStreetMap */}
              <ProjectMap
                projects={projects}
                selected={selectedProject?._id}
                onSelectProject={(id) => setSelected(id)}
                height={220}
              />

              {/* Project info */}
              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-base font-bold text-gray-900">{selectedProject.name}</h2>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{selectedProject.location}</p>
                    </div>
                    <Badge variant="outline" className={(STATUS_CONFIG[selectedProject.status] || STATUS_CONFIG.pending).color}>
                      {(STATUS_CONFIG[selectedProject.status] || STATUS_CONFIG.pending).label}
                    </Badge>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-gray-700">Overall Progress</span>
                      <span className="font-bold text-emerald-600">{selectedProject.pct}%</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${selectedProject.pct}%` }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <p className="text-gray-500 flex items-center gap-1"><Users className="w-3 h-3" />Team</p>
                      <p className="font-medium text-gray-900 mt-0.5">{selectedProject.team}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <p className="text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" />Estimated Completion</p>
                      <p className="font-medium text-gray-900 mt-0.5">{selectedProject.eta}</p>
                    </div>
                  </div>

                  {/* Timeline */}
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Progress Timeline</h3>
                  <div className="space-y-2">
                    {(selectedProject.timeline || []).map((step, i) => (
                      <div key={i} className="flex items-center gap-3">
                        {step.done ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-300 shrink-0" />
                        )}
                        <span className={`text-sm flex-1 ${step.done ? "text-gray-500 line-through" : i === (selectedProject.timeline || []).findIndex(s => !s.done) ? "text-gray-900 font-medium" : "text-gray-400"}`}>
                          {step.label}
                        </span>
                        <span className="text-xs text-gray-400 shrink-0">{step.time}</span>
                      </div>
                    ))}
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
