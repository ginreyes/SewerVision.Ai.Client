"use client";

import React, { useState, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  Shield, Search, Download, User, Settings, Trash2,
  LogIn, LogOut, Edit, Plus, AlertTriangle, Clock,
  Eye, Loader2, ChevronLeft, ChevronRight, Layers,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { api } from "@/lib/helper";
import { useAlert } from "@/components/providers/AlertProvider";

const ACTION_TYPES = [
  "login", "logout", "create", "update", "delete",
  "permission_change", "settings_change", "view",
  "user_created", "user_updated", "user_deleted", "password_changed_by_admin",
];
const ACTION_COLORS = {
  login: "bg-emerald-100 text-emerald-700",
  logout: "bg-gray-100 text-gray-600",
  create: "bg-blue-100 text-blue-700",
  user_created: "bg-blue-100 text-blue-700",
  update: "bg-amber-100 text-amber-700",
  user_updated: "bg-amber-100 text-amber-700",
  delete: "bg-red-100 text-red-700",
  user_deleted: "bg-red-100 text-red-700",
  permission_change: "bg-purple-100 text-purple-700",
  password_changed_by_admin: "bg-orange-100 text-orange-700",
  settings_change: "bg-orange-100 text-orange-700",
  view: "bg-teal-100 text-teal-700",
};
const ACTION_ICONS = {
  login: LogIn, logout: LogOut, create: Plus, update: Edit,
  delete: Trash2, permission_change: Shield, settings_change: Settings,
  view: Eye, user_created: Plus, user_updated: Edit, user_deleted: Trash2,
  password_changed_by_admin: Shield,
};

const SEVERITY_COLORS = {
  low: "bg-gray-100 text-gray-600 border-gray-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  critical: "bg-red-100 text-red-700 border-red-200",
};

// Color hint for the bulk-op action chips. Falls back to a neutral gray, and
// the *_delete actions inherit the red delete styling so destructive ops still
// read as destructive in the Bulk Operations view.
const BULK_ACTION_COLORS = {
  device_bulk_delete: "bg-red-100 text-red-700",
  project_bulk_delete: "bg-red-100 text-red-700",
  upload_bulk_delete: "bg-red-100 text-red-700",
  device_bulk_assign: "bg-blue-100 text-blue-700",
  project_bulk_assign: "bg-blue-100 text-blue-700",
  device_bulk_status: "bg-amber-100 text-amber-700",
  project_bulk_status: "bg-amber-100 text-amber-700",
  upload_bulk_status: "bg-amber-100 text-amber-700",
};

function formatTime(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatAction(action) {
  return (action || "").replace(/_/g, " ");
}

export default function AuditLogPage() {
  const { showAlert } = useAlert();
  // 'all' → full audit trail (/audit/all); 'bulk' → constrained admin bulk-op
  // trail (/audit/bulk, ADMIN_BULK_ACTIONS allow-list enforced server-side).
  const [view, setView] = useState("all");
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [page, setPage] = useState(1);
  // Row clicked open in the detail drawer (full metadata: ids / payload / counts).
  const [selectedLog, setSelectedLog] = useState(null);

  const isBulk = view === "bulk";

  const buildParams = () => {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("limit", "50");
    if (actionFilter !== "all") params.append("action", actionFilter);
    if (severityFilter !== "all") params.append("severity", severityFilter);
    if (search) params.append("search", search);
    return params.toString();
  };

  const { data: auditData, isLoading: loading } = useQuery({
    queryKey: ["admin", "audit-logs", view, { page, actionFilter, severityFilter, search }],
    queryFn: async () => {
      const endpoint = isBulk ? "/api/audit/bulk" : "/api/audit/all";
      const res = await api(`${endpoint}?${buildParams()}`, "GET");
      if (!res.ok) throw new Error("Failed to fetch audit logs");
      return res.data;
    },
    staleTime: 1000 * 60,
    // v5: keepPreviousData:true is a no-op; the function form keeps the prior
    // page on screen while paginating/filtering instead of flashing the spinner.
    placeholderData: keepPreviousData,
  });

  const logs = auditData?.logs || [];
  const total = auditData?.pagination?.total || 0;
  const totalPages = auditData?.pagination?.totalPages || 1;
  const stats = auditData?.stats || { total: 0, today: 0, critical: 0, high: 0 };
  // In the bulk view the action dropdown is driven by the server's allow-list
  // so the client never hard-codes ADMIN_BULK_ACTIONS.
  const bulkActions = auditData?.allowedActions || [];
  const actionOptions = isBulk ? bulkActions : ACTION_TYPES;

  // Reset page when filters or view change. Switching view also clears the
  // action filter since the two views have disjoint action vocabularies.
  useEffect(() => { setPage(1); }, [actionFilter, severityFilter, search, view]);
  useEffect(() => { setActionFilter("all"); }, [view]);

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (actionFilter !== "all") params.append("action", actionFilter);
      if (severityFilter !== "all") params.append("severity", severityFilter);
      if (search) params.append("search", search);

      // Export from the matching endpoint so the bulk view's CSV stays
      // constrained to ADMIN_BULK_ACTIONS rather than dumping the full trail.
      const endpoint = isBulk ? "/api/audit/bulk/export" : "/api/audit/export";
      const res = await api(`${endpoint}?${params}`, "GET");
      if (!res.ok) { showAlert("Failed to export", "error"); return; }

      const data = res.data?.data || [];
      if (data.length === 0) { showAlert("No logs to export", "info"); return; }

      // Build CSV
      const headers = ["Timestamp", "Actor", "Role", "Action", "Resource", "Severity", "Target User", "Target Email", "IP"];
      const rows = data.map(l => [
        l.createdAt ? new Date(l.createdAt).toISOString() : "",
        l.actor || "",
        l.actorRole || "",
        l.action || "",
        l.resource || "",
        l.severity || "",
        l.targetSnapshot?.username || "",
        l.targetSnapshot?.email || "",
        l.ipAddress || "",
      ]);

      const csv = [headers.join(","), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${isBulk ? "bulk-audit" : "audit"}-log-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showAlert("Audit log exported", "success");
    } catch (err) {
      showAlert("Export failed", "error");
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-red-700 flex items-center justify-center text-white shadow-md">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Audit Log</h1>
            <p className="text-sm text-gray-500">
              {isBulk
                ? "Bulk operations across devices, projects, and uploads"
                : "Searchable log of all user actions across the platform"}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExport}>
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      {/* View tabs */}
      <div className="flex items-center gap-1 mb-5 border-b border-gray-200">
        {[
          { key: "all", label: "All Events", icon: Shield },
          { key: "bulk", label: "Bulk Operations", icon: Layers },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              view === tab.key
                ? "border-rose-600 text-rose-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Stats — both endpoints now return a severity/today/total rollup
          ({/audit/all} global, {/audit/bulk} scoped to the bulk-op trail). */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total Events", value: stats.total, color: "text-rose-600", bg: "bg-rose-50", icon: Shield },
          { label: "Critical", value: stats.critical, color: "text-red-600", bg: "bg-red-50", icon: AlertTriangle },
          { label: "High Severity", value: stats.high, color: "text-orange-600", bg: "bg-orange-50", icon: AlertTriangle },
          { label: "Today", value: stats.today, color: "text-blue-600", bg: "bg-blue-50", icon: Clock },
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

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search by user, resource, IP…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-52 h-9 text-sm"><SelectValue placeholder="Action" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {actionOptions.map(a => <SelectItem key={a} value={a} className="capitalize">{formatAction(a)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-36 h-9 text-sm"><SelectValue placeholder="Severity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            {["low", "medium", "high", "critical"].map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-xs text-gray-400">{total} events</span>
      </div>

      {/* Log table */}
      <Card className="border-gray-200">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Time</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">User</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Action</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Resource / Target</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">IP</th>
                    <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => {
                    const Icon = ACTION_ICONS[log.action]
                      || (log.action?.includes("_delete") ? Trash2 : isBulk ? Layers : Eye);
                    const actorDisplay = log.actor || "system";
                    const resource = log.resource || log.targetSnapshot?.username || "";
                    const targetInfo = log.targetSnapshot?.email
                      ? `${log.targetSnapshot.username || ""} (${log.targetSnapshot.email})`
                      : resource;
                    return (
                      <tr key={log._id || i} onClick={() => setSelectedLog(log)} className={`border-b border-gray-50 hover:bg-gray-50/60 transition-colors cursor-pointer ${i % 2 === 0 ? "" : "bg-gray-50/20"}`}>
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatTime(log.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                              <User className="w-3 h-3 text-rose-600" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-900 truncate max-w-[160px]">{actorDisplay}</p>
                              {log.actorRole && <p className="text-[10px] text-gray-400 capitalize">{log.actorRole}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-medium rounded-full px-2 py-0.5 capitalize ${ACTION_COLORS[log.action] || BULK_ACTION_COLORS[log.action] || "bg-gray-100 text-gray-600"}`}>
                            <Icon className="w-2.5 h-2.5" />{formatAction(log.action)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-700 max-w-[220px] truncate">{targetInfo}</td>
                        <td className="px-4 py-3 text-xs font-mono text-gray-500">{log.ipAddress || "—"}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={`text-[10px] capitalize ${SEVERITY_COLORS[log.severity] || SEVERITY_COLORS.low}`}>
                            {log.severity || "low"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {logs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Shield className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-sm">No audit events found</p>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Page {page} of {totalPages} · {total} total events
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="w-8 h-8 p-0" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" className="w-8 h-8 p-0" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Row detail drawer — full metadata the table truncates (succeeded /
          failed ids, payload, counts) for the selected audit row. */}
      <Sheet open={!!selectedLog} onOpenChange={(open) => { if (!open) setSelectedLog(null); }}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selectedLog && (
            <>
              <SheetHeader>
                <SheetTitle className="capitalize">{formatAction(selectedLog.action)}</SheetTitle>
                <SheetDescription>{formatTime(selectedLog.createdAt)}</SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-3 text-sm">
                <DetailRow label="Actor" value={`${selectedLog.actor || "system"}${selectedLog.actorRole ? ` (${selectedLog.actorRole})` : ""}`} />
                <DetailRow label="Resource" value={selectedLog.resource || "—"} />
                <DetailRow label="Resource ID" value={selectedLog.resourceId || "—"} mono />
                <DetailRow label="Severity" value={selectedLog.severity || "low"} />
                <DetailRow label="IP" value={selectedLog.ipAddress || "—"} mono />
                {selectedLog.targetSnapshot?.username && (
                  <DetailRow label="Target" value={`${selectedLog.targetSnapshot.username}${selectedLog.targetSnapshot.email ? ` · ${selectedLog.targetSnapshot.email}` : ""}`} />
                )}
                {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">Metadata</p>
                    <pre className="text-[11px] leading-relaxed bg-gray-50 border border-gray-100 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-words">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function DetailRow({ label, value, mono = false }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs font-semibold text-gray-500 shrink-0">{label}</span>
      <span className={`text-xs text-gray-800 text-right break-all ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
