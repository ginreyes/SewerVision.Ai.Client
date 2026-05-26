"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  Clock, Users, Search, Calendar, ChevronLeft, ChevronRight,
  Loader2, UserCheck, Timer, TrendingUp, BarChart3, Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/helper";
import ExportButton from "@/components/shared/ExportButton";
import { applyChartTheme } from "@/lib/chartTheme";
import { useTheme } from "@/components/providers/ThemeProvider";

const ROLE_COLORS = {
  admin: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
  operator: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  "qc-technician": "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400",
  user: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400",
  customer: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  "customer-rep": "bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-400",
};

/**
 * AttendanceTab — advanced attendance management tab for admin users page.
 * Shows stats, weekly hours chart, attendance table with filters + pagination.
 */
export default function AttendanceTab() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 20;
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => { applyChartTheme(isDark); }, [isDark]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "attendance", { page, limit, role: roleFilter }],
    queryFn: async () => {
      const params = new URLSearchParams({ page, limit });
      if (roleFilter !== "all") params.set("role", roleFilter);
      const { data } = await api(`/api/time-entries?${params.toString()}`);
      return data || { data: [], pagination: {} };
    },
    staleTime: 1000 * 60,
    // v5: function form keeps the prior page on screen across page/role changes
    // (the bare keepPreviousData:true flag was removed in v5).
    placeholderData: keepPreviousData,
  });

  const entries = useMemo(() => {
    const raw = Array.isArray(data?.data) ? data.data : [];
    if (!search.trim()) return raw;
    const q = search.toLowerCase();
    return raw.filter(e =>
      (e.user?.name || e.user?.first_name || "").toLowerCase().includes(q) ||
      (e.user?.email || "").toLowerCase().includes(q) ||
      (e.type || "").toLowerCase().includes(q)
    );
  }, [data, search]);

  const totalPages = data?.pagination?.totalPages || 1;

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todayEntries = entries.filter(e => new Date(e.clockIn || e.createdAt).toDateString() === today);
    const activeNow = entries.filter(e => e.clockIn && !e.clockOut);
    const totalHours = entries.reduce((sum, e) => sum + (e.hoursWorked || 0), 0);
    const avgHours = entries.length > 0 ? totalHours / entries.length : 0;
    return {
      todayCount: todayEntries.length,
      activeNow: activeNow.length,
      totalHours: Math.round(totalHours * 10) / 10,
      avgHours: Math.round(avgHours * 10) / 10,
      totalEntries: entries.length,
    };
  }, [entries]);

  // Weekly hours chart
  useEffect(() => {
    if (!chartRef.current || typeof window === "undefined" || !window.Chart) return;
    if (chartInstanceRef.current) chartInstanceRef.current.destroy();

    const Chart = window.Chart;
    const days = [];
    const hours = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toLocaleDateString("en-US", { weekday: "short" }));
      const dayStr = d.toDateString();
      const dayHours = entries
        .filter(e => new Date(e.clockIn || e.createdAt).toDateString() === dayStr)
        .reduce((sum, e) => sum + (e.hoursWorked || 0), 0);
      hours.push(Math.round(dayHours * 10) / 10);
    }

    chartInstanceRef.current = new Chart(chartRef.current, {
      type: "bar",
      data: {
        labels: days,
        datasets: [{
          label: "Hours Worked",
          data: hours,
          backgroundColor: isDark ? "rgba(244, 63, 94, 0.6)" : "rgba(244, 63, 94, 0.8)",
          borderColor: "rgb(244, 63, 94)",
          borderWidth: 1,
          borderRadius: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: "Hours" } },
        },
      },
    });

    return () => { if (chartInstanceRef.current) chartInstanceRef.current.destroy(); };
  }, [entries, isDark]);

  // Lazy-load Chart.js
  useEffect(() => {
    import("chart.js/auto").then((mod) => { window.Chart = mod.default || mod; });
  }, []);

  return (
    <div className="p-6 space-y-6">

      {/* Chart + Filters Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly Hours Chart */}
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-rose-500" />
              Weekly Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <canvas ref={chartRef} />
            </div>
          </CardContent>
        </Card>

        {/* Quick Filters */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-9 text-sm" />
            </div>
            <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1); }}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="operator">Operator</SelectItem>
                <SelectItem value="qc-technician">QC Technician</SelectItem>
                <SelectItem value="user">Team Lead</SelectItem>
                <SelectItem value="customer-rep">Customer Rep</SelectItem>
              </SelectContent>
            </Select>
            <ExportButton
              data={entries.map(e => ({
                Employee: e.user?.name || `${e.user?.first_name || ""} ${e.user?.last_name || ""}`.trim(),
                Role: e.user?.role || "—",
                Type: e.type || "Shift",
                Date: e.clockIn ? new Date(e.clockIn).toLocaleDateString() : "—",
                "Clock In": e.clockIn ? new Date(e.clockIn).toLocaleTimeString() : "—",
                "Clock Out": e.clockOut ? new Date(e.clockOut).toLocaleTimeString() : "Active",
                Hours: e.hoursWorked?.toFixed(1) || "—",
              }))}
              columns={[
                { key: "Employee", label: "Employee" },
                { key: "Role", label: "Role" },
                { key: "Date", label: "Date" },
                { key: "Clock In", label: "Clock In" },
                { key: "Clock Out", label: "Clock Out" },
                { key: "Hours", label: "Hours" },
              ]}
              filename="attendance"
            />
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-[#374151]">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-[#1e1d26]">
              {["Employee", "Role", "Type", "Date", "Clock In", "Clock Out", "Hours", "Status"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-[#27272a]">
            {isLoading ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" /></td></tr>
            ) : entries.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">No attendance records found</td></tr>
            ) : entries.map((entry, i) => {
              const name = entry.user?.name || `${entry.user?.first_name || ""} ${entry.user?.last_name || ""}`.trim() || "Unknown";
              const role = entry.user?.role || entry.role || "—";
              const isActive = entry.clockIn && !entry.clockOut;
              return (
                <tr key={entry._id || i} className="hover:bg-gray-50 dark:hover:bg-[#1e1d26] transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{name}</td>
                  <td className="px-4 py-3">
                    <Badge className={`text-[10px] ${ROLE_COLORS[role] || "bg-gray-100 text-gray-600"}`}>
                      {role.replace(/-/g, " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{entry.type || "Shift"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{entry.clockIn ? new Date(entry.clockIn).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-700">{entry.clockIn ? new Date(entry.clockIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-700">{entry.clockOut ? new Date(entry.clockOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">{entry.hoursWorked ? `${entry.hoursWorked.toFixed(1)}h` : "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={isActive ? "default" : "secondary"} className={`text-[10px] ${isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400" : ""}`}>
                      {isActive ? "Active" : "Completed"}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
