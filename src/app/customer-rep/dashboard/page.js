"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Ticket,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  MessageSquare,
  BarChart2,
  ChevronRight,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUser } from "@/components/providers/UserContext";
import EmptySewerComponent from "@/components/shared/EmptySewerComponent";
import { useSupportGlobalStats, useSupportAssignedTickets, useSupportTeam } from "@/hooks/useQueryHooks";

// Extracted components
import StatCard from "@/components/customer-rep/dashboard/StatCard";
import TicketRow from "@/components/customer-rep/dashboard/TicketRow";
import QuickActions from "@/components/customer-rep/dashboard/QuickActions";
import BreakdownCard from "@/components/customer-rep/dashboard/BreakdownCard";

export default function CustomerRepDashboard() {
  const router = useRouter();
  const { userId, userData } = useUser();

  const { data: globalStats, isLoading: statsLoading } = useSupportGlobalStats({ refetchInterval: 30000 });
  const { data: assignedRaw } = useSupportAssignedTickets(userId, { refetchInterval: 30000 });
  const { data: teamRaw } = useSupportTeam();

  const stats = useMemo(() => ({
    open: globalStats?.byStatus?.open || 0,
    inProgress: globalStats?.byStatus?.["in-progress"] || 0,
    resolved: globalStats?.byStatus?.resolved || 0,
    total: globalStats?.total || 0,
    todayNew: globalStats?.todayNew || 0,
    avgResponseHours: globalStats?.avgResponseHours || 0,
  }), [globalStats]);

  const assigned = Array.isArray(assignedRaw) ? assignedRaw : [];
  const team = Array.isArray(teamRaw) ? teamRaw : [];
  const myOpen = assigned.filter((t) => t.status === "open" || t.status === "in-progress");

  const categoryItems = useMemo(() => {
    if (!globalStats?.byCategory) return [];
    return Object.entries(globalStats.byCategory).map(([name, count]) => ({ name, count }));
  }, [globalStats]);

  const priorityItems = useMemo(() => [
    { name: "High", count: globalStats?.byPriority?.high || 0, color: "bg-red-500" },
    { name: "Medium", count: globalStats?.byPriority?.medium || 0, color: "bg-amber-500" },
    { name: "Low", count: globalStats?.byPriority?.low || 0, color: "bg-green-500" },
  ], [globalStats]);

  // Skeleton loading
  if (statsLoading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="mb-8 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gray-200 animate-pulse" />
            <div>
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-64 bg-gray-100 rounded animate-pulse mt-2" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border-0 shadow-sm">
                <CardContent className="p-5"><div className="h-16 bg-gray-100 rounded animate-pulse" /></CardContent>
              </Card>
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
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-md">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Support Dashboard</h1>
                <p className="text-sm text-gray-500">
                  Welcome back, {userData?.first_name || "Support Rep"}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
              <Users className="w-3 h-3 mr-1" />
              {team.length} team members
            </Badge>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Open Tickets" value={stats.open} icon={Ticket} color="text-amber-600"
            gradient="bg-gradient-to-br from-amber-50 to-orange-50" subtitle="Awaiting response"
            onClick={() => router.push("/customer-rep/tickets")} />
          <StatCard title="In Progress" value={stats.inProgress} icon={Clock} color="text-blue-600"
            gradient="bg-gradient-to-br from-blue-50 to-indigo-50" subtitle="Being handled"
            onClick={() => router.push("/customer-rep/tickets")} />
          <StatCard title="Resolved" value={stats.resolved} icon={CheckCircle} color="text-emerald-600"
            gradient="bg-gradient-to-br from-emerald-50 to-green-50" subtitle="Successfully closed"
            onClick={() => router.push("/customer-rep/tickets")} />
          <StatCard title="Total Tickets" value={stats.total} icon={BarChart2} color="text-gray-700"
            gradient="bg-gradient-to-br from-gray-50 to-slate-50" subtitle={`${stats.todayNew} new today`} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Active Tickets */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <CardTitle className="text-base">My Active Tickets</CardTitle>
                    <Badge variant="outline" className="text-xs">{myOpen.length}</Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => router.push("/customer-rep/tickets")}>
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                <CardDescription>Tickets assigned to you that need attention</CardDescription>
              </CardHeader>
              <CardContent>
                {myOpen.length === 0 ? (
                  <EmptySewerComponent variant="no-tickets" title="All caught up!" subtitle="No active tickets assigned to you" size="sm" />
                ) : (
                  <div className="space-y-3">
                    {myOpen.slice(0, 5).map((ticket) => (
                      <TicketRow key={ticket._id} ticket={ticket} onClick={() => router.push(`/customer-rep/tickets?id=${ticket._id}`)} />
                    ))}
                    {myOpen.length > 5 && (
                      <p className="text-xs text-gray-400 text-center pt-1">+{myOpen.length - 5} more tickets</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance Overview */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-teal-500" />
                  <CardTitle className="text-base">Performance Overview</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-teal-50">
                    <p className="text-2xl font-bold text-teal-600">{stats.resolved}</p>
                    <p className="text-xs text-gray-500 mt-1">Resolved</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-blue-50">
                    <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                    <p className="text-xs text-gray-500 mt-1">In Progress</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-amber-50">
                    <p className="text-2xl font-bold text-amber-600">{stats.avgResponseHours}h</p>
                    <p className="text-xs text-gray-500 mt-1">Avg Response</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar (1 col) */}
          <div className="space-y-6">
            <QuickActions />
            <BreakdownCard title="By Category" items={categoryItems} />
            <BreakdownCard title="By Priority" variant="dot" items={priorityItems} />
          </div>
        </div>
      </div>
    </div>
  );
}
