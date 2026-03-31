"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Database, Download, RefreshCw, HardDrive, Clock, Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/helper";

export default function DatabaseTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await api("/api/system-health/db-stats", "GET");
      if (res.ok && res.data?.data) setData(res.data.data);
    } catch (err) {
      console.error("Failed to fetch DB stats:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const collections = data?.collections || [];
  const stats = data?.stats || {};

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-rose-500" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Collections", value: stats.collectionCount || 0, icon: Database, bg: "bg-rose-50", color: "text-rose-600" },
          { label: "Total Documents", value: stats.totalDocs?.toLocaleString() || "0", icon: HardDrive, bg: "bg-blue-50", color: "text-blue-600" },
          { label: "Data Size", value: stats.dataSize || "—", icon: HardDrive, bg: "bg-amber-50", color: "text-amber-600" },
          { label: "Index Size", value: stats.indexSize || "—", icon: Clock, bg: "bg-emerald-50", color: "text-emerald-600" },
        ].map(s => (
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

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => fetchStats(true)} disabled={refreshing}>
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />Refresh Stats
        </Button>
        {stats.dbName && (
          <span className="text-xs text-gray-400">Database: <span className="font-mono text-gray-600">{stats.dbName}</span></span>
        )}
      </div>

      {/* Collections table */}
      <Card className="border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="w-4 h-4 text-rose-500" />Collections ({collections.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                {["Collection", "Documents", "Data Size", "Avg Doc Size", "Indexes", "Index Size"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {collections.map(c => (
                <tr key={c.name} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-2.5 text-xs font-mono font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-2.5 text-xs text-gray-700 font-medium">{c.docs?.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-xs text-gray-500">{c.size}</td>
                  <td className="px-4 py-2.5 text-xs text-gray-400">{c.avgObjSize}</td>
                  <td className="px-4 py-2.5 text-xs text-gray-500">{c.indexes}</td>
                  <td className="px-4 py-2.5 text-xs text-gray-400">{c.indexSize}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
