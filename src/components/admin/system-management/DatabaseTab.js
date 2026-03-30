"use client";

import React, { useState } from "react";
import { Database, Download, RefreshCw, AlertTriangle, CheckCircle2, Clock, HardDrive, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const COLLECTIONS = [
  { name: "projects", docs: 0, size: "—", indexes: 0 },
  { name: "users", docs: 0, size: "—", indexes: 0 },
  { name: "aidetections", docs: 0, size: "—", indexes: 0 },
  { name: "observations", docs: 0, size: "—", indexes: 0 },
  { name: "snapshots", docs: 0, size: "—", indexes: 0 },
  { name: "videofiles", docs: 0, size: "—", indexes: 0 },
  { name: "reports", docs: 0, size: "—", indexes: 0 },
  { name: "supporttickets", docs: 0, size: "—", indexes: 0 },
  { name: "notifications", docs: 0, size: "—", indexes: 0 },
  { name: "securitymodules", docs: 0, size: "—", indexes: 0 },
];

export default function DatabaseTab({ data }) {
  const [backupLoading, setBackupLoading] = useState(false);
  const collections = data?.collections || COLLECTIONS;
  const dbStats = data?.stats || {};

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Collections", value: collections.length, icon: Database, bg: "bg-rose-50", color: "text-rose-600" },
          { label: "Total Documents", value: dbStats.totalDocs?.toLocaleString() || "—", icon: HardDrive, bg: "bg-blue-50", color: "text-blue-600" },
          { label: "DB Size", value: dbStats.dataSize || "—", icon: HardDrive, bg: "bg-amber-50", color: "text-amber-600" },
          { label: "Last Backup", value: dbStats.lastBackup || "Never", icon: Clock, bg: "bg-emerald-50", color: "text-emerald-600" },
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
        <Button variant="outline" size="sm" className="gap-1.5" disabled={backupLoading}
          onClick={() => { setBackupLoading(true); setTimeout(() => setBackupLoading(false), 2000); }}>
          {backupLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          Create Backup
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" />Run Migration Check
        </Button>
      </div>

      {/* Collections table */}
      <Card className="border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="w-4 h-4 text-rose-500" />Collections
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                {["Collection", "Documents", "Size", "Indexes", "Status"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {collections.map(c => (
                <tr key={c.name} className="border-b border-gray-50 hover:bg-gray-50/60">
                  <td className="px-4 py-3 text-xs font-mono font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-xs text-gray-700">{c.docs?.toLocaleString() || "—"}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{c.size || "—"}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{c.indexes || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
