"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard, GripVertical, Eye, EyeOff, Plus, Settings2,
  Activity, FolderOpen, FileText, MessageSquare, Bell, Star, ChevronRight, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAlert } from "@/components/providers/AlertProvider";
import { useUser } from "@/components/providers/UserContext";
import { useWidgetPreferences, useUpdateWidgetPreferences, useWidgetData } from "@/hooks/useQueryHooks";

const ICON_MAP = {
  FolderOpen, FileText, MessageSquare, Bell, Activity, Star, LayoutDashboard,
};

function ProjectSummaryWidget({ data }) {
  const projects = data?.projects || [];
  if (projects.length === 0) return <p className="text-xs text-gray-400">No projects yet</p>;
  return (
    <div className="space-y-2">
      {projects.slice(0, 4).map(p => (
        <div key={p.name}>
          <div className="flex justify-between text-xs mb-1"><span className="text-gray-700">{p.name}</span><span className="text-gray-500">{p.pct}%</span></div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${p.pct >= 100 ? "bg-emerald-500" : "bg-blue-500"}`} style={{ width: `${Math.min(p.pct, 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ReportsWidget({ data }) {
  const reports = data?.reports || [];
  if (reports.length === 0) return <p className="text-xs text-gray-400">No reports yet</p>;
  return (
    <div className="space-y-1.5">
      {reports.slice(0, 4).map((r, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="flex-1 text-gray-700 truncate">{r.name}</span>
          <span className="text-gray-400">{r.date ? new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}</span>
          <ChevronRight className="w-3 h-3 text-gray-300" />
        </div>
      ))}
    </div>
  );
}

function LiveActivityWidget({ data }) {
  const activities = data?.activities || [];
  if (activities.length === 0) return <p className="text-xs text-gray-400">No active projects</p>;
  return (
    <div className="space-y-1.5 text-xs">
      {activities.map((a, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full shrink-0 ${a.status === "in-progress" || a.status === "field-capture" ? "bg-blue-500 animate-pulse" : "bg-emerald-500"}`} />
          <span className="flex-1 text-gray-700">{a.text}</span>
          <span className="text-gray-400 text-[10px]">
            {a.time ? new Date(a.time).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
          </span>
        </div>
      ))}
    </div>
  );
}

function TicketStatusWidget({ data }) {
  return (
    <p className="text-xs text-gray-500">
      {data?.openCount ?? 0} open ticket{data?.openCount !== 1 ? "s" : ""} · {data?.resolvedThisWeek ?? 0} resolved this week
    </p>
  );
}

function NotificationsWidget() {
  return <p className="text-xs text-gray-500">Check your notification bell for latest updates</p>;
}

function SatisfactionWidget() {
  return <p className="text-xs text-gray-500">Satisfaction data coming soon</p>;
}

const WIDGET_RENDERERS = {
  "project-summary": (data) => <ProjectSummaryWidget data={data} />,
  "recent-reports": (data) => <ReportsWidget data={data} />,
  "live-activity": (data) => <LiveActivityWidget data={data} />,
  "ticket-status": (data) => <TicketStatusWidget data={data} />,
  "notifications": () => <NotificationsWidget />,
  "satisfaction": () => <SatisfactionWidget />,
};

export default function DashboardWidgets() {
  const { showAlert } = useAlert();
  const { userId } = useUser();
  const [editMode, setEditMode] = useState(false);

  const { data: prefData, isLoading: prefsLoading } = useWidgetPreferences(userId);
  const { data: widgetData } = useWidgetData(userId);
  const updateMutation = useUpdateWidgetPreferences();

  const availableWidgets = prefData?.availableWidgets || [];
  const preferences = prefData?.preferences || [];

  // Track local active widgets for optimistic UI
  const [localActive, setLocalActive] = useState(null);

  useEffect(() => {
    if (preferences.length > 0 && localActive === null) {
      setLocalActive(preferences.filter(p => p.enabled).map(p => p.widgetId));
    }
  }, [preferences, localActive]);

  const activeWidgets = localActive || preferences.filter(p => p.enabled).map(p => p.widgetId);

  function toggleWidget(id) {
    const newActive = activeWidgets.includes(id) ? activeWidgets.filter(w => w !== id) : [...activeWidgets, id];
    setLocalActive(newActive);

    // Persist
    const widgets = availableWidgets.map((w, idx) => ({
      widgetId: w.id,
      enabled: newActive.includes(w.id),
      order: idx,
    }));
    updateMutation.mutate({ userId, widgets }, {
      onError: () => showAlert("Failed to save widget preferences", "error"),
    });
  }

  if (prefsLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
        <p className="text-sm text-gray-500">Loading widgets…</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dashboard Widgets</h1>
            <p className="text-sm text-gray-500">Customize your dashboard — choose which widgets to display</p>
          </div>
        </div>
        <Button onClick={() => setEditMode(e => !e)} variant={editMode ? "default" : "outline"}
          className={editMode ? "bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5" : "gap-1.5"}>
          <Settings2 className="w-4 h-4" />{editMode ? "Done Editing" : "Edit Layout"}
        </Button>
      </div>

      {/* Available widgets palette (edit mode) */}
      {editMode && (
        <Card className="border-emerald-200 bg-emerald-50/30 mb-5">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Available Widgets — Toggle to show/hide</CardTitle></CardHeader>
          <CardContent className="pt-0 grid grid-cols-3 gap-2">
            {availableWidgets.map(w => {
              const Icon = ICON_MAP[w.icon] || LayoutDashboard;
              return (
                <button key={w.id} onClick={() => toggleWidget(w.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${activeWidgets.includes(w.id) ? "border-emerald-300 bg-white" : "border-gray-200 bg-white opacity-50 hover:opacity-70"}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 ${w.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900">{w.label}</p>
                    <p className="text-[10px] text-gray-400 truncate">{w.description}</p>
                  </div>
                  {activeWidgets.includes(w.id)
                    ? <Eye className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    : <EyeOff className="w-3.5 h-3.5 text-gray-300 shrink-0" />}
                </button>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Active widgets grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableWidgets.filter(w => activeWidgets.includes(w.id)).map(w => {
          const Icon = ICON_MAP[w.icon] || LayoutDashboard;
          const renderer = WIDGET_RENDERERS[w.id];
          const data = widgetData?.[w.id];
          return (
            <Card key={w.id} className={`border-gray-200 ${editMode ? "border-dashed" : ""}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  {editMode && <GripVertical className="w-3.5 h-3.5 text-gray-300 cursor-grab" />}
                  <div className={`w-5 h-5 rounded flex items-center justify-center text-white ${w.color}`}>
                    <Icon className="w-3 h-3" />
                  </div>
                  {w.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {renderer ? renderer(data) : <p className="text-xs text-gray-400">Widget content</p>}
              </CardContent>
            </Card>
          );
        })}
        {activeWidgets.length === 0 && (
          <div className="col-span-2 flex flex-col items-center justify-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
            <LayoutDashboard className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm">No widgets selected — click Edit Layout to add some</p>
          </div>
        )}
      </div>
    </div>
  );
}
