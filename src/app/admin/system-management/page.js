"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Settings2, Database, HardDrive, Activity, Brain,
  Loader2, RefreshCw, CheckCircle2, AlertTriangle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/helper";
import { DatabaseTab, StorageTab, AiModelTab } from "@/components/admin/system-management";
import { ServiceCard, MetricGauge, ServerInfoCard } from "@/components/admin/system-health";

const HEALTH_KEY = ["admin", "system-health"];

export default function SystemManagement() {
  const {
    data: healthData,
    isLoading: healthLoading,
    isFetching: refreshing,
    dataUpdatedAt,
    refetch,
  } = useQuery({
    queryKey: HEALTH_KEY,
    queryFn: async () => {
      const res = await api("/api/system-health/status", "GET");
      if (!res.ok || !res.data?.data) throw new Error("Failed to fetch health");
      return res.data.data;
    },
    refetchInterval: 30000,
    staleTime: 1000 * 15,
  });

  const lastRefresh = dataUpdatedAt ? new Date(dataUpdatedAt) : new Date();

  const services = healthData?.services || [];
  const resources = healthData?.resources || {};
  const overallStatus = healthData?.overallStatus || "operational";
  const online = services.filter(s => s.status === "online").length;
  const degraded = services.filter(s => s.status === "degraded").length;
  const offline = services.filter(s => s.status === "offline").length;

  const statusLabel = overallStatus === "incident" ? "Incident Detected" : overallStatus === "degraded" ? "Degraded Performance" : "All Systems Operational";
  const statusColor = overallStatus === "incident" ? "text-red-600 bg-red-50 border-red-200" : overallStatus === "degraded" ? "text-amber-600 bg-amber-50 border-amber-200" : "text-emerald-600 bg-emerald-50 border-emerald-200";

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-red-700 flex items-center justify-center text-white shadow-md">
            <Settings2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">System Management</h1>
            <p className="text-sm text-gray-500">Database, storage, system health, and AI model management</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>Updated {lastRefresh.toLocaleTimeString()}</span>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={refreshing}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />Refresh
          </Button>
        </div>
      </div>

      {/* Overall status banner */}
      <div className={`flex items-center gap-3 p-3.5 rounded-xl border mb-5 ${statusColor}`}>
        {overallStatus === "operational" ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
        <div>
          <p className="font-semibold text-sm">{statusLabel}</p>
          <p className="text-xs opacity-75">{online} online · {degraded} degraded · {offline} offline</p>
        </div>
      </div>

      <Tabs defaultValue="health" className="w-full">
        <TabsList className="mb-5 bg-gray-100/80 dark:bg-[#1e1d26] p-1 rounded-xl h-auto">
          <TabsTrigger value="health" className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 data-[state=active]:bg-white dark:data-[state=active]:bg-[#2b2a33] data-[state=active]:text-rose-700 dark:data-[state=active]:text-rose-400 data-[state=active]:shadow-sm rounded-lg px-5 py-2.5">
            <Activity className="w-4 h-4 shrink-0" /><span className="text-sm font-medium">System Health</span>
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 data-[state=active]:bg-white dark:data-[state=active]:bg-[#2b2a33] data-[state=active]:text-rose-700 dark:data-[state=active]:text-rose-400 data-[state=active]:shadow-sm rounded-lg px-5 py-2.5">
            <Database className="w-4 h-4 shrink-0" /><span className="text-sm font-medium">Database</span>
          </TabsTrigger>
          <TabsTrigger value="storage" className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 data-[state=active]:bg-white dark:data-[state=active]:bg-[#2b2a33] data-[state=active]:text-rose-700 dark:data-[state=active]:text-rose-400 data-[state=active]:shadow-sm rounded-lg px-5 py-2.5">
            <HardDrive className="w-4 h-4 shrink-0" /><span className="text-sm font-medium">Storage</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 data-[state=active]:bg-white dark:data-[state=active]:bg-[#2b2a33] data-[state=active]:text-rose-700 dark:data-[state=active]:text-rose-400 data-[state=active]:shadow-sm rounded-lg px-5 py-2.5">
            <Brain className="w-4 h-4 shrink-0" /><span className="text-sm font-medium">AI Models</span>
          </TabsTrigger>
        </TabsList>

        {/* System Health Tab */}
        <TabsContent value="health" className="mt-0">
          {healthLoading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-rose-500" /></div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Service Status</h3>
                {services.map(s => <ServiceCard key={s.name} service={s} />)}
              </div>
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Resource Usage</h3>
                <Card className="border-gray-200">
                  <CardContent className="p-4 space-y-4">
                    {resources.cpu && (
                      <MetricGauge label={`CPU (${resources.cpu.cores} cores)`} value={resources.cpu.value} max={resources.cpu.max} unit={resources.cpu.unit} color="text-emerald-600" />
                    )}
                    {resources.memory && (
                      <MetricGauge label="Memory" value={resources.memory.value} max={resources.memory.max} unit={resources.memory.unit} color="text-blue-600" />
                    )}
                  </CardContent>
                </Card>
                <ServerInfoCard resources={resources} />
              </div>
            </div>
          )}
        </TabsContent>

        {/* Database Tab */}
        <TabsContent value="database" className="mt-0">
          <DatabaseTab />
        </TabsContent>

        {/* Storage Tab */}
        <TabsContent value="storage" className="mt-0">
          <StorageTab />
        </TabsContent>

        {/* AI Models Tab */}
        <TabsContent value="ai" className="mt-0">
          <AiModelTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
