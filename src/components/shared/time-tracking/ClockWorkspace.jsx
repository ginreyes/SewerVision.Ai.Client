"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Clock, Play, Square, Download, TrendingUp, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAlert } from "@/components/providers/AlertProvider";
import {
  useOperatorTimeEntries,
  useOperatorTimeSummary,
  useCreateTimeEntry,
  useDeleteTimeEntry,
} from "@/hooks/useQueryHooks";
import { TimeEntryRow, TYPE_OPTIONS as OPERATOR_TYPE_OPTIONS } from "@/components/operator/time-tracking";
import { TableSkeleton } from "@/components/shared/SkeletonLoading";

const ACCENT_CLASSES = {
  blue: {
    iconBg: "bg-gradient-to-br from-blue-600 to-indigo-700",
    runningBorder: "border-blue-400 bg-blue-50",
    runningText: "text-blue-700",
    button: "bg-blue-600 hover:bg-blue-700",
    statIconBg: "bg-blue-50",
    statIconColor: "text-blue-600",
  },
  indigo: {
    iconBg: "bg-gradient-to-br from-indigo-600 to-purple-700",
    runningBorder: "border-indigo-400 bg-indigo-50",
    runningText: "text-indigo-700",
    button: "bg-indigo-600 hover:bg-indigo-700",
    statIconBg: "bg-indigo-50",
    statIconColor: "text-indigo-600",
  },
  purple: {
    iconBg: "bg-gradient-to-br from-purple-600 to-pink-600",
    runningBorder: "border-purple-400 bg-purple-50",
    runningText: "text-purple-700",
    button: "bg-purple-600 hover:bg-purple-700",
    statIconBg: "bg-purple-50",
    statIconColor: "text-purple-600",
  },
  teal: {
    iconBg: "bg-gradient-to-br from-teal-600 to-cyan-700",
    runningBorder: "border-teal-400 bg-teal-50",
    runningText: "text-teal-700",
    button: "bg-teal-600 hover:bg-teal-700",
    statIconBg: "bg-teal-50",
    statIconColor: "text-teal-600",
  },
  // QC Technician theme — red-700 → amber-500 (matches sidebar gradient).
  red: {
    iconBg: "bg-gradient-to-br from-red-700 via-red-600 to-amber-500",
    runningBorder: "border-red-400 bg-red-50",
    runningText: "text-red-800",
    button: "bg-red-700 hover:bg-red-800",
    statIconBg: "bg-red-50",
    statIconColor: "text-red-700",
  },
};

function formatElapsed(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * ClockWorkspace — shared clock in/out + time entries workspace used across roles.
 *
 * Backed by the /api/time-entries endpoint (via the operator hooks — the API
 * accepts any user id under the `operator` query parameter).
 *
 * @param {{
 *   userId: string,
 *   projects?: Array<{ _id: string, name?: string, workOrder?: string }>,
 *   accent?: 'blue' | 'indigo' | 'purple' | 'teal' | 'red',
 *   title?: string,
 *   description?: string,
 *   showProject?: boolean,
 *   showExport?: boolean,
 *   typeOptions?: string[],
 *   defaultType?: string,
 * }} props
 */
export default function ClockWorkspace({
  userId,
  projects = [],
  accent = "blue",
  title = "Time Tracking",
  description = "Clock in/out and review your entries",
  showProject = true,
  showExport = true,
  typeOptions = OPERATOR_TYPE_OPTIONS,
  defaultType,
}) {
  const { showAlert } = useAlert();
  const theme = ACCENT_CLASSES[accent] || ACCENT_CLASSES.blue;

  const { data: rawEntries = [], isLoading } = useOperatorTimeEntries(userId);
  const entries = useMemo(
    () => (Array.isArray(rawEntries) ? rawEntries : rawEntries?.data || []),
    [rawEntries]
  );
  useOperatorTimeSummary(userId); // keep summary warm for cache sharing
  const createMutation = useCreateTimeEntry();
  useDeleteTimeEntry(); // reserved for future per-row delete

  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [activeType, setActiveType] = useState(defaultType || typeOptions[0] || "Shift");
  const [activeProject, setActiveProject] = useState("");
  const intervalRef = useRef(null);

  // Auto-select first project when loaded
  useEffect(() => {
    if (showProject && !activeProject && projects.length > 0) {
      setActiveProject(projects[0]._id);
    }
  }, [showProject, projects, activeProject]);

  // Live clock timer
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const handleClockIn = useCallback(() => {
    setIsRunning(true);
    setElapsed(0);
    showAlert("Clock-in started", "success");
  }, [showAlert]);

  const handleClockOut = useCallback(() => {
    setIsRunning(false);
    if (showProject && !activeProject) {
      showAlert("Please select a project before clocking out", "error");
      return;
    }
    const hours = Math.max(Math.round((elapsed / 3600) * 100) / 100, 0.01);
    const now = new Date();
    const start = new Date(now.getTime() - elapsed * 1000);
    const projectCode = showProject
      ? projects.find((p) => p._id === activeProject)?.name || activeProject
      : "Shift";

    createMutation.mutate(
      {
        operator: userId,
        date: now.toISOString().slice(0, 10),
        projectId: showProject ? activeProject : null,
        projectCode,
        type: activeType,
        startTime: start.toTimeString().slice(0, 5),
        endTime: now.toTimeString().slice(0, 5),
        hours,
        notes: "",
      },
      {
        onSuccess: () => {
          showAlert(`Clocked out — ${hours}h logged`, "success");
        },
        onError: (err) => showAlert(err?.message || "Failed to save time entry", "error"),
      }
    );
    setElapsed(0);
  }, [elapsed, showProject, activeProject, activeType, createMutation, userId, showAlert, projects]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayEntries = useMemo(
    () =>
      entries.filter((e) => {
        const d = e.date ? new Date(e.date).toISOString().slice(0, 10) : "";
        return d === todayStr;
      }),
    [entries, todayStr]
  );
  const todayHours = useMemo(
    () => todayEntries.reduce((s, e) => s + (e.hours || 0), 0),
    [todayEntries]
  );
  const weekHours = useMemo(
    () => entries.reduce((s, e) => s + (e.hours || 0), 0),
    [entries]
  );

  const grouped = useMemo(() => {
    const map = {};
    entries.forEach((e) => {
      const dateKey = e.date
        ? new Date(e.date).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })
        : "Unknown";
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(e);
    });
    return map;
  }, [entries]);

  const statsCards = useMemo(
    () => [
      {
        label: "Today",
        value: `${todayHours}h`,
        icon: Clock,
        color: theme.statIconColor,
        bg: theme.statIconBg,
      },
      {
        label: "This Week",
        value: `${weekHours}h`,
        icon: TrendingUp,
        color: "text-teal-600",
        bg: "bg-teal-50",
      },
      {
        label: "Entries",
        value: entries.length,
        icon: BarChart2,
        color: "text-purple-600",
        bg: "bg-purple-50",
      },
    ],
    [todayHours, weekHours, entries.length, theme]
  );

  if (isLoading) return <TableSkeleton />;

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${theme.iconBg} flex items-center justify-center text-white shadow-md`}>
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
        {showExport && (
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="w-4 h-4" /> Export Timesheet
          </Button>
        )}
      </div>

      {/* Clock widget */}
      <Card className={`border-2 mb-5 ${isRunning ? theme.runningBorder : "border-gray-200"}`}>
        <CardContent className="p-5">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="text-center">
              <p className={`text-4xl font-mono font-bold tracking-widest ${isRunning ? theme.runningText : "text-gray-700"}`}>
                {formatElapsed(elapsed)}
              </p>
              <p className="text-xs text-gray-400 mt-1">{isRunning ? "Running..." : "Stopped"}</p>
            </div>
            <div className={`flex-1 grid ${showProject ? "grid-cols-2" : "grid-cols-1"} gap-3 min-w-[200px]`}>
              {showProject && (
                <div>
                  <label className="text-xs text-gray-500 font-medium">Project</label>
                  <select
                    value={activeProject}
                    onChange={(e) => setActiveProject(e.target.value)}
                    disabled={isRunning}
                    className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:ring-1 focus:ring-blue-300 disabled:opacity-50"
                  >
                    <option value="">Select project</option>
                    {projects.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name || p.workOrder || p._id}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="text-xs text-gray-500 font-medium">Activity Type</label>
                <select
                  value={activeType}
                  onChange={(e) => setActiveType(e.target.value)}
                  disabled={isRunning}
                  className="mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:ring-1 focus:ring-blue-300 disabled:opacity-50"
                >
                  {typeOptions.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              {!isRunning ? (
                <Button onClick={handleClockIn} className={`${theme.button} text-white gap-1.5 px-6`}>
                  <Play className="w-4 h-4" /> Clock In
                </Button>
              ) : (
                <Button onClick={handleClockOut} className="bg-red-500 hover:bg-red-600 text-white gap-1.5 px-6">
                  <Square className="w-4 h-4" /> Clock Out
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {statsCards.map((s) => (
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

      {/* Entries grouped by date */}
      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Clock className="w-12 h-12 mb-3 opacity-40" />
          <p className="text-sm font-medium">No time entries yet</p>
          <p className="text-xs mt-1">Clock in to start tracking your time</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([date, dayEntries]) => {
            const total = dayEntries.reduce((s, e) => s + (e.hours || 0), 0);
            return (
              <div key={date}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {date}
                  </span>
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs font-bold text-gray-700">{total}h total</span>
                </div>
                <div className="space-y-1.5">
                  {dayEntries.map((e) => (
                    <TimeEntryRow key={e._id || e.id} entry={e} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
