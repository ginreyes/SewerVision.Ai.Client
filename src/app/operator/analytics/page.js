"use client";

import React, { useEffect, useRef, useMemo } from "react";
import {
  BarChart2,
  FolderOpen,
  CheckCircle2,
  Clock,
  Wifi,
  TrendingUp,
  Activity,
  Cpu,
  CalendarDays,
} from "lucide-react";
import Chart from "chart.js/auto";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/components/providers/UserContext";
import { useTheme } from "@/components/providers/ThemeProvider";
import { applyChartTheme } from "@/lib/chartTheme";
import { DashboardSkeleton } from "@/components/shared/SkeletonLoading";
import {
  useOperatorAssignedProjects,
  useOperatorTimeEntries,
  useOperatorDevices,
} from "@/hooks/useQueryHooks";

// ── Helpers ──

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function last7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      key: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
    });
  }
  return days;
}

function last6Months() {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("en-US", { month: "short" }),
    });
  }
  return months;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ── Stat Card ──

function StatCard({ icon: Icon, label, value, suffix, sub, gradient, iconColor }) {
  return (
    <Card className="border-0 shadow-sm dark:bg-[#2b2a33] dark:border-[#3b3a44] hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${gradient}`}
          >
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        </div>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-3">
          {value}
          {suffix && (
            <span className="text-base font-medium text-gray-400 ml-0.5">
              {suffix}
            </span>
          )}
        </p>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {label}
        </p>
        {sub && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {sub}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main Page ──

export default function OperatorAnalyticsPage() {
  const { userId } = useUser();
  const { isDark } = useTheme();

  // Apply Chart.js theme
  useEffect(() => {
    applyChartTheme(isDark);
  }, [isDark]);

  // ── Data fetching ──
  const { data: projectsRaw, isLoading: loadingProjects } =
    useOperatorAssignedProjects(userId, 200, { refetchInterval: 60000 });
  const { data: timeEntriesRaw, isLoading: loadingTime } =
    useOperatorTimeEntries(userId, {}, { refetchInterval: 60000 });
  const { data: devicesRaw, isLoading: loadingDevices } =
    useOperatorDevices(userId, { refetchInterval: 60000 });

  // ── Normalize data ──
  const projects = useMemo(() => {
    const raw = projectsRaw?.data ?? projectsRaw;
    return Array.isArray(raw) ? raw : [];
  }, [projectsRaw]);

  const timeEntries = useMemo(() => {
    const raw = timeEntriesRaw?.data ?? timeEntriesRaw;
    return Array.isArray(raw) ? raw : [];
  }, [timeEntriesRaw]);

  const devices = useMemo(() => {
    const raw = devicesRaw?.data ?? devicesRaw;
    return Array.isArray(raw) ? raw : [];
  }, [devicesRaw]);

  // ── Computed stats ──
  const totalProjects = projects.length;
  const completedProjects = projects.filter(
    (p) => p.status === "completed"
  ).length;

  // Hours this week
  const hoursThisWeek = useMemo(() => {
    const weekStart = startOfWeek(new Date());
    let total = 0;
    timeEntries.forEach((entry) => {
      const entryDate = new Date(entry.date || entry.startTime || entry.createdAt);
      if (entryDate >= weekStart) {
        total += entry.hours || entry.duration || 0;
      }
    });
    return Math.round(total * 10) / 10;
  }, [timeEntries]);

  // Device uptime
  const deviceUptime = useMemo(() => {
    if (!devices.length) return 0;
    const online = devices.filter(
      (d) => d.status === "online" || d.status === "recording" || d.status === "running"
    ).length;
    return Math.round((online / devices.length) * 100);
  }, [devices]);

  // ── Weekly hours chart data ──
  const days = useMemo(() => last7Days(), []);
  const weeklyHoursData = useMemo(() => {
    const counts = {};
    days.forEach((d) => {
      counts[d.key] = 0;
    });
    timeEntries.forEach((entry) => {
      const dateStr = (
        entry.date ||
        entry.startTime ||
        entry.createdAt ||
        ""
      ).slice(0, 10);
      if (counts[dateStr] !== undefined) {
        counts[dateStr] += entry.hours || entry.duration || 0;
      }
    });
    return days.map((d) => ({
      label: d.label,
      value: Math.round((counts[d.key] || 0) * 10) / 10,
    }));
  }, [timeEntries, days]);

  // ── Project status distribution ──
  const statusDistribution = useMemo(() => {
    const counts = {};
    projects.forEach((p) => {
      const s = p.status || "unknown";
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [projects]);

  // ── AI processing stats ──
  const aiStats = useMemo(() => {
    const aiProjects = projects.filter(
      (p) =>
        p.status === "ai-processing" ||
        p.status === "completed" ||
        p.status === "qc-review"
    );
    const processed = projects.filter(
      (p) => p.status === "completed" || p.status === "qc-review"
    ).length;
    const total = aiProjects.length;
    const rate = total > 0 ? Math.round((processed / total) * 100) : 0;
    return { processed, total, rate };
  }, [projects]);

  // ── Monthly completions ──
  const months = useMemo(() => last6Months(), []);
  const monthlyCompletions = useMemo(() => {
    const counts = {};
    months.forEach((m) => {
      counts[m.key] = 0;
    });
    projects.forEach((p) => {
      if (p.status === "completed" && (p.completedAt || p.updatedAt)) {
        const d = new Date(p.completedAt || p.updatedAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (counts[key] !== undefined) counts[key]++;
      }
    });
    return months.map((m) => ({
      label: m.label,
      value: counts[m.key] || 0,
    }));
  }, [projects, months]);

  // ── Recent completed projects ──
  const recentCompleted = useMemo(() => {
    return projects
      .filter((p) => p.status === "completed")
      .sort(
        (a, b) =>
          new Date(b.completedAt || b.updatedAt || 0) -
          new Date(a.completedAt || a.updatedAt || 0)
      )
      .slice(0, 5);
  }, [projects]);

  // ── Chart refs ──
  const weeklyChartRef = useRef(null);
  const weeklyChartInstance = useRef(null);
  const statusChartRef = useRef(null);
  const statusChartInstance = useRef(null);
  const monthlyChartRef = useRef(null);
  const monthlyChartInstance = useRef(null);

  // ── Weekly Hours Bar Chart ──
  useEffect(() => {
    if (weeklyChartInstance.current) weeklyChartInstance.current.destroy();
    if (!weeklyChartRef.current) return;

    weeklyChartInstance.current = new Chart(weeklyChartRef.current, {
      type: "bar",
      data: {
        labels: weeklyHoursData.map((d) => d.label),
        datasets: [
          {
            label: "Hours",
            data: weeklyHoursData.map((d) => d.value),
            backgroundColor: isDark
              ? "rgba(59, 130, 246, 0.7)"
              : "rgba(59, 130, 246, 0.8)",
            borderColor: "#3B82F6",
            borderWidth: 1,
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6" },
            ticks: { font: { size: 11 } },
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 } },
          },
        },
      },
    });

    return () => {
      if (weeklyChartInstance.current) weeklyChartInstance.current.destroy();
    };
  }, [weeklyHoursData, isDark]);

  // ── Project Status Donut Chart ──
  useEffect(() => {
    if (statusChartInstance.current) statusChartInstance.current.destroy();
    if (!statusChartRef.current) return;

    const statusLabels = Object.keys(statusDistribution);
    const statusValues = Object.values(statusDistribution);
    const statusColors = statusLabels.map((s) => {
      switch (s) {
        case "completed":
          return "#10B981";
        case "field-capture":
          return "#3B82F6";
        case "ai-processing":
          return "#8B5CF6";
        case "qc-review":
          return "#F59E0B";
        case "uploading":
          return "#6366F1";
        default:
          return "#9CA3AF";
      }
    });

    statusChartInstance.current = new Chart(statusChartRef.current, {
      type: "doughnut",
      data: {
        labels: statusLabels.map(
          (s) => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
        ),
        datasets: [
          {
            data: statusValues,
            backgroundColor: statusColors,
            borderWidth: 2,
            borderColor: isDark ? "#2b2a33" : "#ffffff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "65%",
        plugins: {
          legend: {
            display: true,
            position: "bottom",
            labels: { boxWidth: 12, font: { size: 11 }, padding: 12 },
          },
        },
      },
    });

    return () => {
      if (statusChartInstance.current) statusChartInstance.current.destroy();
    };
  }, [statusDistribution, isDark]);

  // ── Monthly Completions Bar Chart ──
  useEffect(() => {
    if (monthlyChartInstance.current) monthlyChartInstance.current.destroy();
    if (!monthlyChartRef.current) return;

    monthlyChartInstance.current = new Chart(monthlyChartRef.current, {
      type: "bar",
      data: {
        labels: monthlyCompletions.map((d) => d.label),
        datasets: [
          {
            label: "Completions",
            data: monthlyCompletions.map((d) => d.value),
            backgroundColor: isDark
              ? "rgba(16, 185, 129, 0.7)"
              : "rgba(16, 185, 129, 0.8)",
            borderColor: "#10B981",
            borderWidth: 1,
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6" },
            ticks: {
              stepSize: 1,
              font: { size: 11 },
            },
          },
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 } },
          },
        },
      },
    });

    return () => {
      if (monthlyChartInstance.current) monthlyChartInstance.current.destroy();
    };
  }, [monthlyCompletions, isDark]);

  // ── Loading state ──
  if (loadingProjects && loadingTime && loadingDevices) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
          <BarChart2 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Analytics
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Performance metrics and operational insights
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={FolderOpen}
          label="Total Projects"
          value={totalProjects}
          sub="All assigned projects"
          gradient="bg-blue-50 dark:bg-blue-900/30"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={completedProjects}
          sub={
            totalProjects > 0
              ? `${Math.round((completedProjects / totalProjects) * 100)}% completion rate`
              : "No projects yet"
          }
          gradient="bg-emerald-50 dark:bg-emerald-900/30"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          icon={Clock}
          label="Hours This Week"
          value={hoursThisWeek}
          suffix="h"
          sub="Current work week"
          gradient="bg-amber-50 dark:bg-amber-900/30"
          iconColor="text-amber-600 dark:text-amber-400"
        />
        <StatCard
          icon={Wifi}
          label="Device Uptime"
          value={deviceUptime}
          suffix="%"
          sub={`${devices.length} device${devices.length !== 1 ? "s" : ""} total`}
          gradient="bg-purple-50 dark:bg-purple-900/30"
          iconColor="text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* Charts Grid (2x2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weekly Hours */}
        <Card className="border-0 shadow-sm dark:bg-[#2b2a33] dark:border-[#3b3a44]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              Weekly Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              {weeklyHoursData.some((d) => d.value > 0) ? (
                <canvas ref={weeklyChartRef} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                  <div className="text-center">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No time entries this week</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Project Status Distribution */}
        <Card className="border-0 shadow-sm dark:bg-[#2b2a33] dark:border-[#3b3a44]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-indigo-500" />
              Project Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              {Object.keys(statusDistribution).length > 0 ? (
                <canvas ref={statusChartRef} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                  <div className="text-center">
                    <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No project data available</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Processing Success Rate */}
        <Card className="border-0 shadow-sm dark:bg-[#2b2a33] dark:border-[#3b3a44]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-violet-500" />
              AI Processing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center">
              {aiStats.total > 0 ? (
                <div className="text-center space-y-3">
                  <div className="relative inline-flex items-center justify-center">
                    <svg width={120} height={120} className="-rotate-90">
                      <circle
                        cx={60}
                        cy={60}
                        r={50}
                        fill="none"
                        stroke={isDark ? "#374151" : "#e5e7eb"}
                        strokeWidth={10}
                      />
                      <circle
                        cx={60}
                        cy={60}
                        r={50}
                        fill="none"
                        stroke="#8B5CF6"
                        strokeWidth={10}
                        strokeDasharray={2 * Math.PI * 50}
                        strokeDashoffset={
                          2 * Math.PI * 50 -
                          (aiStats.rate / 100) * 2 * Math.PI * 50
                        }
                        strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 0.8s ease" }}
                      />
                    </svg>
                    <span className="absolute text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {aiStats.rate}%
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Success Rate
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {aiStats.processed} of {aiStats.total} processed
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 dark:text-gray-500">
                  <Cpu className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No AI processing data</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card className="border-0 shadow-sm dark:bg-[#2b2a33] dark:border-[#3b3a44]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Monthly Completions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              {monthlyCompletions.some((d) => d.value > 0) ? (
                <canvas ref={monthlyChartRef} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                  <div className="text-center">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No completions yet</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-sm dark:bg-[#2b2a33] dark:border-[#3b3a44]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              Recent Completed Projects
            </CardTitle>
            {recentCompleted.length > 0 && (
              <Badge
                variant="secondary"
                className="text-xs dark:bg-[#3b3a44] dark:text-gray-300"
              >
                Last {recentCompleted.length}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {recentCompleted.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {recentCompleted.map((project) => (
                <div
                  key={project._id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {project.name || project.projectName || "Untitled Project"}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {project.location || project.client || ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(project.completedAt || project.updatedAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No completed projects yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
