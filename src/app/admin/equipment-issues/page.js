"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Inbox,
  Search,
  Download,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAlert } from "@/components/providers/AlertProvider";
import {
  useAdminEquipmentIssues,
  useAdminAcknowledgeEquipmentIssue,
  useAdminResolveEquipmentIssue,
} from "@/hooks/useAdminHooks";
import {
  AdminEquipmentIssueRow,
  ResolveIssueDialog,
  BulkActionsBar,
} from "@/components/admin/equipment-issues";
import { exportToCSV } from "@/lib/csvExport";

/**
 * Admin → Equipment Issues.
 *
 * Cross-operator maintenance queue. Same backend (/api/maintenance/equipment-issues)
 * the operator page hits, but admin/maintenance callers see every row regardless
 * of operatorId. Filter by status / severity / category, search by title or
 * operator/device name, and Acknowledge/Resolve inline.
 */

const SEVERITY_FILTERS = [
  { value: "all", label: "Any severity" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const CATEGORY_FILTERS = [
  { value: "all", label: "Any category" },
  { value: "camera", label: "Camera / Lens" },
  { value: "battery", label: "Battery / Power" },
  { value: "cable", label: "Cable / Connector" },
  { value: "housing", label: "Housing / Mount" },
  { value: "other", label: "Other" },
];

const STATUS_FILTERS = [
  { value: "all", label: "Any status" },
  { value: "open", label: "Open" },
  { value: "acknowledged", label: "Acknowledged" },
  { value: "in_repair", label: "In repair" },
  { value: "resolved", label: "Resolved" },
];

export default function AdminEquipmentIssuesPage() {
  const { showAlert } = useAlert();
  const [tab, setTab] = useState("active");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [resolveTarget, setResolveTarget] = useState(null);
  // Selection state for bulk actions. Stored as a Set for O(1) membership
  // checks on every row render; the set itself is replaced (not mutated) on
  // every change so React/Memo can detect updates.
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  // Pull everything once, filter client-side: lets the user flip tabs / filters
  // without thrashing the backend, and the data volume here is bounded (~hundreds).
  const { data: rawIssues = [], isLoading, isError, error } =
    useAdminEquipmentIssues({ status: "all", limit: 500 });

  const ackMutation = useAdminAcknowledgeEquipmentIssue();
  const resolveMutation = useAdminResolveEquipmentIssue();

  const issues = useMemo(
    () =>
      (rawIssues || []).map((row) => ({
        id: row._id || row.id,
        deviceName: row.deviceName || row.deviceId?.name || null,
        projectName: row.projectId?.name || row.projectName || null,
        operatorName: buildOperatorName(row.operatorId),
        operatorId: row.operatorId?._id || row.operatorId || null,
        category: row.category,
        severity: row.severity,
        status: row.status,
        title: row.title,
        description: row.description,
        resolutionNotes: row.resolutionNotes,
        reportedAt: row.reportedAt,
        resolvedAt: row.resolvedAt || null,
        acknowledgedAt: row.acknowledgedAt || null,
      })),
    [rawIssues]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return issues.filter((issue) => {
      if (severityFilter !== "all" && issue.severity !== severityFilter) return false;
      if (categoryFilter !== "all" && issue.category !== categoryFilter) return false;
      if (statusFilter !== "all" && issue.status !== statusFilter) return false;
      if (term) {
        const hay = [issue.title, issue.operatorName, issue.deviceName, issue.projectName, issue.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [issues, severityFilter, categoryFilter, statusFilter, search]);

  const tabbed = useMemo(() => {
    const open = filtered.filter((i) => i.status === "open");
    const active = filtered.filter((i) => i.status !== "resolved");
    const resolved = filtered.filter((i) => i.status === "resolved");
    return { open, active, resolved };
  }, [filtered]);

  const counts = useMemo(() => {
    const all = issues.length;
    const open = issues.filter((i) => i.status === "open").length;
    const critical = issues.filter((i) => i.status !== "resolved" && i.severity === "critical").length;
    const resolved = issues.filter((i) => i.status === "resolved").length;
    return { all, open, critical, resolved };
  }, [issues]);

  const handleAcknowledge = useCallback(
    async (id) => {
      try {
        await ackMutation.mutateAsync(id);
        showAlert("Issue acknowledged", "success");
      } catch (err) {
        showAlert(err?.message || "Failed to acknowledge issue", "error");
      }
    },
    [ackMutation, showAlert]
  );

  const handleResolve = useCallback(
    async (id, resolutionNotes) => {
      try {
        await resolveMutation.mutateAsync({ id, resolutionNotes });
        showAlert("Issue resolved", "success");
      } catch (err) {
        showAlert(err?.message || "Failed to resolve issue", "error");
      }
    },
    [resolveMutation, showAlert]
  );

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Bulk operations dispatch the existing single-row mutations in parallel.
  // The backend doesn't expose a true bulk endpoint, and the per-row mutation
  // already handles cache invalidation, so this stays consistent with single-
  // row behavior. We tolerate partial failure: settle all, then report counts.
  const runBulk = useCallback(
    async (ids, op, kind) => {
      const list = Array.from(ids);
      if (list.length === 0) return;
      const results = await Promise.allSettled(list.map(op));
      const ok = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.length - ok;
      if (failed === 0) {
        showAlert(`${ok} ${kind}`, "success");
      } else if (ok === 0) {
        showAlert(`Failed to ${kind} (${failed})`, "error");
      } else {
        showAlert(`${ok} ${kind}, ${failed} failed`, "info");
      }
      clearSelection();
    },
    [showAlert, clearSelection]
  );

  const handleBulkAcknowledge = useCallback(() => {
    // Skip issues that aren't in the acknowledgeable state.
    const eligible = filtered
      .filter((i) => selectedIds.has(i.id) && i.status === "open")
      .map((i) => i.id);
    if (eligible.length === 0) {
      showAlert("No selected issues are in the open state", "info");
      return;
    }
    runBulk(eligible, (id) => ackMutation.mutateAsync(id), "acknowledged");
  }, [filtered, selectedIds, ackMutation, runBulk, showAlert]);

  const handleBulkResolve = useCallback(() => {
    const eligible = filtered
      .filter((i) => selectedIds.has(i.id) && i.status !== "resolved")
      .map((i) => i.id);
    if (eligible.length === 0) {
      showAlert("No selected issues need resolving", "info");
      return;
    }
    runBulk(
      eligible,
      (id) => resolveMutation.mutateAsync({ id, resolutionNotes: "Bulk resolved" }),
      "resolved"
    );
  }, [filtered, selectedIds, resolveMutation, runBulk, showAlert]);

  const handleExport = useCallback(() => {
    if (!filtered.length) {
      showAlert("Nothing to export in the current view", "info");
      return;
    }
    const columns = [
      { key: "title", label: "Title" },
      { key: "severity", label: "Severity" },
      { key: "status", label: "Status" },
      { key: "category", label: "Category" },
      { key: "operatorName", label: "Operator" },
      { key: "deviceName", label: "Device" },
      { key: "projectName", label: "Project" },
      { key: "reportedAt", label: "Reported At" },
      { key: "acknowledgedAt", label: "Acknowledged At" },
      { key: "resolvedAt", label: "Resolved At" },
      { key: "resolutionNotes", label: "Resolution Notes" },
    ];
    exportToCSV(filtered, columns, "equipment-issues");
  }, [filtered, showAlert]);

  const busy = ackMutation.isPending || resolveMutation.isPending;

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <Header counts={counts} onExport={handleExport} disabled={!filtered.length} />

        <SummaryCards counts={counts} loading={isLoading} />

        <FilterBar
          search={search}
          onSearch={setSearch}
          severity={severityFilter}
          onSeverity={setSeverityFilter}
          category={categoryFilter}
          onCategory={setCategoryFilter}
          status={statusFilter}
          onStatus={setStatusFilter}
        />

        <BulkActionsBar
          selectedCount={selectedIds.size}
          onClear={clearSelection}
          onBulkAcknowledge={handleBulkAcknowledge}
          onBulkResolve={handleBulkResolve}
          busy={busy}
        />

        {isError ? (
          <Card className="border-rose-200 dark:border-rose-900/40">
            <CardContent className="py-6 text-sm text-rose-700 dark:text-rose-300">
              Failed to load equipment issues — {error?.message || "unknown error"}.
            </CardContent>
          </Card>
        ) : (
          <Tabs value={tab} onValueChange={setTab} className="space-y-4">
            <TabsList className="grid grid-cols-4 w-fit">
              <TabsTrigger value="open">Open ({tabbed.open.length})</TabsTrigger>
              <TabsTrigger value="active">Active ({tabbed.active.length})</TabsTrigger>
              <TabsTrigger value="resolved">Resolved ({tabbed.resolved.length})</TabsTrigger>
              <TabsTrigger value="all">All ({filtered.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="open">
              <IssueList
                list={tabbed.open}
                loading={isLoading}
                onAcknowledge={handleAcknowledge}
                onResolve={setResolveTarget}
                busy={busy}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
                emptyHint="No open issues — every reported failure is in progress or resolved."
              />
            </TabsContent>
            <TabsContent value="active">
              <IssueList
                list={tabbed.active}
                loading={isLoading}
                onAcknowledge={handleAcknowledge}
                onResolve={setResolveTarget}
                busy={busy}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
                emptyHint="No active issues. Maintenance queue is clear."
              />
            </TabsContent>
            <TabsContent value="resolved">
              <IssueList
                list={tabbed.resolved}
                loading={isLoading}
                onAcknowledge={handleAcknowledge}
                onResolve={setResolveTarget}
                busy={busy}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
                emptyHint="No resolved issues yet in the current filter."
              />
            </TabsContent>
            <TabsContent value="all">
              <IssueList
                list={filtered}
                loading={isLoading}
                onAcknowledge={handleAcknowledge}
                onResolve={setResolveTarget}
                busy={busy}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
                emptyHint="No issues match the current filter."
              />
            </TabsContent>
          </Tabs>
        )}
      </div>

      <ResolveIssueDialog
        open={!!resolveTarget}
        onOpenChange={(next) => {
          if (!next) setResolveTarget(null);
        }}
        issue={resolveTarget}
        onResolve={handleResolve}
      />
    </div>
  );
}

function buildOperatorName(operatorRef) {
  if (!operatorRef) return null;
  if (typeof operatorRef === "string") return null;
  const { first_name, last_name, username } = operatorRef;
  const joined = [first_name, last_name].filter(Boolean).join(" ").trim();
  return joined || username || null;
}

function Header({ counts, onExport, disabled }) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-orange-600 flex items-center justify-center text-white shadow-md">
          <Wrench className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Equipment Issues
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Cross-operator maintenance queue — every broken-gear report rolls up here.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {counts.critical > 0 ? (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
            <AlertTriangle className="w-3.5 h-3.5" />
            {counts.critical} critical active
          </span>
        ) : null}
        <Button variant="outline" size="sm" onClick={onExport} disabled={disabled}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>
    </div>
  );
}

function SummaryCards({ counts, loading }) {
  const cards = [
    {
      icon: AlertTriangle,
      label: "Open",
      value: counts.open,
      tone: "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
    },
    {
      icon: AlertTriangle,
      label: "Critical active",
      value: counts.critical,
      tone: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    },
    {
      icon: Wrench,
      label: "Total",
      value: counts.all,
      tone: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    },
    {
      icon: CheckCircle2,
      label: "Resolved",
      value: counts.resolved,
      tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map(({ icon: Icon, label, value, tone }) => (
        <Card key={label} className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${tone}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold tabular-nums text-gray-900 dark:text-gray-100">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                ) : (
                  value
                )}
              </div>
              <div className="text-xs uppercase tracking-wide text-gray-500">
                {label}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function FilterBar({
  search,
  onSearch,
  severity,
  onSeverity,
  category,
  onCategory,
  status,
  onStatus,
}) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-3 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search title, operator, device, or project"
            className="pl-8 h-9"
          />
        </div>
        <Select value={severity} onValueChange={onSeverity}>
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SEVERITY_FILTERS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={onCategory}>
          <SelectTrigger className="w-[170px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_FILTERS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={onStatus}>
          <SelectTrigger className="w-[150px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}

function IssueList({
  list,
  emptyHint,
  onAcknowledge,
  onResolve,
  busy,
  loading,
  selectedIds,
  onToggleSelect,
}) {
  if (loading) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-10 flex items-center justify-center gap-2 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading issues…</span>
        </CardContent>
      </Card>
    );
  }
  if (list.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-10 flex flex-col items-center gap-2 text-gray-500">
          <Inbox className="w-6 h-6" />
          <span className="text-sm text-center">{emptyHint}</span>
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="space-y-3">
      {list.map((issue) => (
        <AdminEquipmentIssueRow
          key={issue.id}
          issue={issue}
          busy={busy}
          onAcknowledge={onAcknowledge}
          onResolve={onResolve}
          selectable
          selected={selectedIds?.has(issue.id)}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </div>
  );
}
