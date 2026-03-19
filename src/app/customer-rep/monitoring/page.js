"use client";

import React, { useMemo } from "react";
import {
  Activity,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BarChart2,
  Timer,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useSupportGlobalStats, useSupportAllTickets } from "@/hooks/useQueryHooks";

// Extracted components
import SlaCard from "@/components/customer-rep/monitoring/SlaCard";
import DistributionCard from "@/components/customer-rep/monitoring/DistributionCard";

export default function CustomerRepMonitoring() {
  
  const { data: stats, isLoading: statsLoading } = useSupportGlobalStats({ refetchInterval: 15000 });
  const { data: ticketsData } = useSupportAllTickets({}, { refetchInterval: 15000 });

  const tickets = useMemo(() => {
    const raw = ticketsData?.data ?? ticketsData;
    return Array.isArray(raw) ? raw : [];
  }, [ticketsData]);

  const slaMetrics = useMemo(() => {
    if (!tickets.length) return { avgFirstResponse: 0, avgResolution: 0, slaCompliance: 0, openOverdue: 0 };

    const now = new Date();
    const SLA_HOURS = 24;

    const withResponses = tickets.filter((t) => t.responses?.length > 0);
    let totalFirstResponseMs = 0;
    withResponses.forEach((t) => {
      const created = new Date(t.created_at || t.createdAt);
      const firstResp = new Date(t.responses[0].timestamp);
      totalFirstResponseMs += firstResp - created;
    });
    const avgFirstResponse = withResponses.length > 0
      ? Math.round((totalFirstResponseMs / withResponses.length / 3600000) * 10) / 10 : 0;

    const resolved = tickets.filter((t) => t.status === "resolved" || t.status === "closed");
    let totalResolutionMs = 0;
    resolved.forEach((t) => {
      const created = new Date(t.created_at || t.createdAt);
      const updated = new Date(t.updated_at || t.updatedAt || created);
      totalResolutionMs += updated - created;
    });
    const avgResolution = resolved.length > 0
      ? Math.round((totalResolutionMs / resolved.length / 3600000) * 10) / 10 : 0;

    const withinSla = resolved.filter((t) => {
      const created = new Date(t.created_at || t.createdAt);
      const updated = new Date(t.updated_at || t.updatedAt || created);
      return (updated - created) <= SLA_HOURS * 3600000;
    });
    const slaCompliance = resolved.length > 0 ? Math.round((withinSla.length / resolved.length) * 100) : 100;

    const openTickets = tickets.filter((t) => t.status === "open" || t.status === "in-progress");
    const openOverdue = openTickets.filter((t) => {
      const created = new Date(t.created_at || t.createdAt);
      return (now - created) > SLA_HOURS * 3600000;
    }).length;

    return { avgFirstResponse, avgResolution, slaCompliance, openOverdue };
  }, [tickets]);

  const statusItems = useMemo(() => {
    if (!stats?.total) return [];
    return [
      { label: "Open", count: stats.byStatus?.open || 0, pct: Math.round(((stats.byStatus?.open || 0) / stats.total) * 100), color: "bg-amber-500" },
      { label: "In Progress", count: stats.byStatus?.["in-progress"] || 0, pct: Math.round(((stats.byStatus?.["in-progress"] || 0) / stats.total) * 100), color: "bg-blue-500" },
      { label: "Resolved", count: stats.byStatus?.resolved || 0, pct: Math.round(((stats.byStatus?.resolved || 0) / stats.total) * 100), color: "bg-emerald-500" },
      { label: "Closed", count: stats.byStatus?.closed || 0, pct: Math.round(((stats.byStatus?.closed || 0) / stats.total) * 100), color: "bg-gray-400" },
    ];
  }, [stats]);

  const categoryItems = useMemo(() => {
    const cats = stats?.byCategory || {};
    const total = Object.values(cats).reduce((a, b) => a + b, 0);
    return Object.entries(cats)
      .map(([name, count]) => ({ label: name, count, pct: total > 0 ? Math.round((count / total) * 100) : 0, color: "bg-teal-500" }))
      .sort((a, b) => b.count - a.count);
  }, [stats]);

  if (statsLoading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="mb-8 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gray-200 animate-pulse" />
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}><CardContent className="p-5"><div className="h-16 bg-gray-100 rounded animate-pulse" /></CardContent></Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-md">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">SLA Monitoring</h1>
            <p className="text-sm text-gray-500">Response times, compliance, and performance metrics</p>
          </div>
        </div>

        {/* SLA KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <SlaCard title="Avg First Response" value={slaMetrics.avgFirstResponse} unit="h" target="4h" icon={Timer} color="text-blue-600" gradient="bg-gradient-to-br from-blue-50 to-indigo-50" />
          <SlaCard title="Avg Resolution" value={slaMetrics.avgResolution} unit="h" target="24h" icon={Clock} color="text-teal-600" gradient="bg-gradient-to-br from-teal-50 to-cyan-50" />
          <SlaCard title="SLA Compliance" value={slaMetrics.slaCompliance} unit="%" target="95%" icon={Target} color="text-emerald-600" gradient="bg-gradient-to-br from-emerald-50 to-green-50" />
          <SlaCard title="Overdue Tickets" value={slaMetrics.openOverdue} target="Needs attention" icon={AlertTriangle} color="text-red-600" gradient="bg-gradient-to-br from-red-50 to-orange-50" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <DistributionCard title="Status Distribution" icon={<BarChart2 className="w-4 h-4 text-teal-500" />} items={statusItems} />
          <DistributionCard title="Category Breakdown" icon={<TrendingUp className="w-4 h-4 text-blue-500" />} items={categoryItems} />
        </div>

        {/* SLA Compliance Progress */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" /> SLA Compliance Overview
            </CardTitle>
            <CardDescription>Percentage of tickets resolved within 24-hour SLA target</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1"><Progress value={slaMetrics.slaCompliance} className="h-4" /></div>
              <Badge variant="outline" className={`text-sm font-semibold ${
                slaMetrics.slaCompliance >= 95 ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                slaMetrics.slaCompliance >= 80 ? "bg-amber-100 text-amber-700 border-amber-200" :
                "bg-red-100 text-red-700 border-red-200"
              }`}>
                {slaMetrics.slaCompliance}%
              </Badge>
            </div>
            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
              <span>0%</span>
              <span className="text-emerald-600 font-medium">Target: 95%</span>
              <span>100%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
