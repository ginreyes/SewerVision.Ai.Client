"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Activity, CheckCircle2, AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/helper";
import { ServiceCard, MetricGauge, ServerInfoCard } from "@/components/admin/system-health";

export default function SystemHealth() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchHealth = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await api("/api/system-health/status", "GET");
      if (res.ok && res.data?.data) {
        setData(res.data.data);
        setLastRefresh(new Date());
      }
    } catch (err) {
      console.error("Failed to fetch health:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchHealth(); }, [fetchHealth]);

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => fetchHealth(true), 30000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500 mb-3" />
        <p className="text-sm text-gray-500">Loading system health…</p>
      </div>
    );
  }

  const services = data?.services || [];
  const resources = data?.resources || {};
  const overallStatus = data?.overallStatus || "operational";

  const online = services.filter(s => s.status === "online").length;
  const degraded = services.filter(s => s.status === "degraded").length;
  const offline = services.filter(s => s.status === "offline").length;

  const statusLabel = overallStatus === "incident" ? "Incident Detected" : overallStatus === "degraded" ? "Degraded Performance" : "All Systems Operational";
  const statusColor = overallStatus === "incident" ? "text-red-600 bg-red-50 border-red-200" : overallStatus === "degraded" ? "text-amber-600 bg-amber-50 border-amber-200" : "text-emerald-600 bg-emerald-50 border-emerald-200";

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-red-700 flex items-center justify-center text-white shadow-md">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">System Health Monitor</h1>
            <p className="text-sm text-gray-500">Real-time status of all backend services and infrastructure</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">Updated {lastRefresh.toLocaleTimeString()}</span>
          <Button variant="outline" size="sm" onClick={() => fetchHealth(true)} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />Refresh
          </Button>
        </div>
      </div>

      {/* Overall status banner */}
      <div className={`flex items-center gap-3 p-4 rounded-xl border mb-5 ${statusColor}`}>
        {overallStatus === "operational" ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
        <div>
          <p className="font-semibold text-sm">{statusLabel}</p>
          <p className="text-xs opacity-75">{online} online · {degraded} degraded · {offline} offline</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Services list */}
        <div className="col-span-2 space-y-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Service Status</h3>
          {services.map(s => <ServiceCard key={s.name} service={s} />)}
        </div>

        {/* Resource usage */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Resource Usage</h3>
          <Card className="border-gray-200">
            <CardContent className="p-4 space-y-4">
              {resources.cpu && (
                <MetricGauge label={`CPU Usage (${resources.cpu.cores} cores)`} value={resources.cpu.value} max={resources.cpu.max} unit={resources.cpu.unit} color="text-emerald-600" />
              )}
              {resources.memory && (
                <MetricGauge label="Memory" value={resources.memory.value} max={resources.memory.max} unit={resources.memory.unit} color="text-blue-600" />
              )}
            </CardContent>
          </Card>
          <ServerInfoCard resources={resources} />
        </div>
      </div>
    </div>
  );
}
