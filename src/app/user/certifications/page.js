"use client";

import React, { useMemo, useState } from "react";
import {
  GraduationCap,
  Plus,
  Loader2,
  Inbox,
  ShieldCheck,
  CalendarClock,
  AlertOctagon,
  BellRing,
  Download,
  CalendarPlus,
  BellPlus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAlert } from "@/components/providers/AlertProvider";
import {
  useTeamTraining,
  useCreateTrainingRecord,
  useUpdateTrainingRecord,
  useDeleteTrainingRecord,
  useRemindTrainingMember,
  useBulkRenewTraining,
  useBulkRemind,
  useExportTrainingRecords,
  useUserTeamMembers,
} from "@/hooks/useSharedHooks";

/**
 * User → Training & Certifications (May 19).
 *
 * Per-member compliance records owned by the team lead. Rows are colour-coded
 * by `derivedStatus` (computed server-side from expiryDate) and the team
 * lead can send a one-click reminder (24h cooldown) for upcoming or overdue
 * certifications. Distinct from the per-QC-tech Certifications model — this
 * view rolls up every team member regardless of role. Also distinct from
 * /user/training (the existing Training Center for modules/quizzes/paths) —
 * this page is the compliance-tracking surface.
 *
 * Backend: GET /api/user/training?memberId=&status=&category=&expiringWithin=
 *          POST /api/user/training
 *          PATCH /api/user/training/:id
 *          DELETE /api/user/training/:id
 *          POST /api/user/training/:id/remind
 */

const STATUS_TONES = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300",
  expiring: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300",
  expired: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300",
  pending: "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/40 dark:text-sky-300",
};

const CATEGORY_OPTIONS = [
  { value: "safety", label: "Safety" },
  { value: "qc_certification", label: "QC certification" },
  { value: "device_certification", label: "Device certification" },
  { value: "compliance", label: "Compliance" },
  { value: "onboarding", label: "Onboarding" },
  { value: "other", label: "Other" },
];

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "expiring", label: "Expiring" },
  { value: "expired", label: "Expired" },
  { value: "pending", label: "Pending" },
];

// Category facets share the same list as the create modal — the "all"
// sentinel here is filter-side only (the backend rejects unknown values).
const CATEGORY_FILTER_OPTIONS = [
  { value: "all", label: "All categories" },
  ...[
    { value: "safety", label: "Safety" },
    { value: "qc_certification", label: "QC certification" },
    { value: "device_certification", label: "Device certification" },
    { value: "compliance", label: "Compliance" },
    { value: "onboarding", label: "Onboarding" },
    { value: "other", label: "Other" },
  ],
];

const REMINDER_SCHEDULE_OPTIONS = [
  { value: "immediate", label: "Immediate (notify members now)" },
  { value: "daily", label: "Daily until renewed" },
  { value: "weekly", label: "Weekly until renewed" },
];

export default function UserCertificationsPage() {
  const { showAlert } = useAlert();
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [remindMenuOpen, setRemindMenuOpen] = useState(false);
  // Selection is keyed by record _id; the Set is read-only outside the
  // toggle/clear handlers so React skips re-renders on identity comparison.
  const [selected, setSelected] = useState(() => new Set());

  const filters = useMemo(() => {
    const f = {};
    if (statusFilter !== "all") f.status = statusFilter;
    if (categoryFilter !== "all") f.category = categoryFilter;
    return f;
  }, [statusFilter, categoryFilter]);

  const { data, isLoading, isError, error } = useTeamTraining(filters);
  const { data: members = [] } = useUserTeamMembers();

  const createMutation = useCreateTrainingRecord();
  const updateMutation = useUpdateTrainingRecord();
  const deleteMutation = useDeleteTrainingRecord();
  const remindMutation = useRemindTrainingMember();
  const bulkRenewMutation = useBulkRenewTraining();
  const bulkRemindMutation = useBulkRemind();
  const exportMutation = useExportTrainingRecords();

  const records = data?.records || [];
  const counts = data?.counts || {
    total: 0,
    active: 0,
    expiring: 0,
    expired: 0,
    pending: 0,
  };

  // Drop any selected ids that fell out of the visible set after a filter
  // change — otherwise the bulk action would target records the user can
  // no longer see, which is confusing UX and surprising telemetry.
  const visibleIds = useMemo(() => new Set(records.map((r) => r._id)), [records]);
  const selectedVisible = useMemo(
    () => Array.from(selected).filter((id) => visibleIds.has(id)),
    [selected, visibleIds]
  );
  const selectedCount = selectedVisible.length;

  const toggleOne = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleAll = () =>
    setSelected((prev) => {
      const allSelected = records.length > 0 && records.every((r) => prev.has(r._id));
      if (allSelected) return new Set();
      return new Set(records.map((r) => r._id));
    });
  const clearSelection = () => setSelected(new Set());

  const handleCreate = async (draft) => {
    try {
      await createMutation.mutateAsync(draft);
      showAlert("Training record added", "success");
      setModalOpen(false);
    } catch (err) {
      showAlert(err?.message || "Failed to add record", "error");
      throw err;
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateMutation.mutateAsync({ id, payload: { status } });
    } catch (err) {
      showAlert(err?.message || "Failed to update record", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this training record? This cannot be undone.")) return;
    try {
      await deleteMutation.mutateAsync(id);
      showAlert("Record deleted", "success");
    } catch (err) {
      showAlert(err?.message || "Failed to delete record", "error");
    }
  };

  const handleRemind = async (id) => {
    try {
      const result = await remindMutation.mutateAsync(id);
      showAlert(`Reminder sent (${result?.reminderCount ?? 1} total)`, "success");
    } catch (err) {
      showAlert(err?.message || "Failed to send reminder", "error");
    }
  };

  const handleBulkRenew = async (newExpiryDate) => {
    if (selectedVisible.length === 0) return;
    try {
      const result = await bulkRenewMutation.mutateAsync({
        recordIds: selectedVisible,
        newExpiryDate,
      });
      showAlert(
        `Renewed ${result?.renewed ?? selectedVisible.length} record${result?.renewed === 1 ? "" : "s"}`,
        "success"
      );
      setRenewModalOpen(false);
      clearSelection();
    } catch (err) {
      showAlert(err?.message || "Bulk renewal failed", "error");
    }
  };

  const handleBulkRemind = async (reminderSchedule) => {
    if (selectedVisible.length === 0) return;
    try {
      const result = await bulkRemindMutation.mutateAsync({
        recordIds: selectedVisible,
        reminderSchedule,
      });
      const verb = reminderSchedule === "immediate" ? "sent" : "scheduled";
      showAlert(
        `${verb === "sent" ? result?.notified ?? selectedVisible.length : result?.scheduled ?? selectedVisible.length} reminder${selectedVisible.length === 1 ? "" : "s"} ${verb}`,
        "success"
      );
      setRemindMenuOpen(false);
      clearSelection();
    } catch (err) {
      showAlert(err?.message || "Bulk reminder failed", "error");
    }
  };

  const handleExport = async () => {
    try {
      const csv = await exportMutation.mutateAsync(filters);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `training-records-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showAlert("Export downloaded", "success");
    } catch (err) {
      showAlert(err?.message || "Export failed", "error");
    }
  };

  const allSelectedOnPage =
    records.length > 0 && records.every((r) => selected.has(r._id));

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <Header
          onAdd={() => setModalOpen(true)}
          onExport={handleExport}
          exporting={exportMutation.isPending}
        />

        <SummaryCards counts={counts} loading={isLoading} />

        <FilterBar
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
        />

        {selectedCount > 0 && (
          <BulkActionBar
            count={selectedCount}
            onRenew={() => setRenewModalOpen(true)}
            onRemind={() => setRemindMenuOpen(true)}
            onClear={clearSelection}
            busy={bulkRenewMutation.isPending || bulkRemindMutation.isPending}
          />
        )}

        {isError ? (
          <Card className="border-rose-200 dark:border-rose-900/40">
            <CardContent className="py-6 text-sm text-rose-700 dark:text-rose-300">
              Failed to load training records — {error?.message || "unknown error"}.
            </CardContent>
          </Card>
        ) : isLoading ? (
          <Card className="border-dashed">
            <CardContent className="py-10 flex items-center justify-center gap-2 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading training records…</span>
            </CardContent>
          </Card>
        ) : records.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-10 flex flex-col items-center gap-2 text-gray-500">
              <Inbox className="w-6 h-6" />
              <span className="text-sm text-center">
                No training records yet. Click &ldquo;Add record&rdquo; to track a member&apos;s certification.
              </span>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Checkbox
                checked={allSelectedOnPage}
                onCheckedChange={toggleAll}
                aria-label="Select all visible"
              />
              <span className="text-xs text-gray-500">
                Select all visible ({records.length})
              </span>
            </div>
            {records.map((record) => (
              <RecordRow
                key={record._id}
                record={record}
                selected={selected.has(record._id)}
                onToggleSelect={() => toggleOne(record._id)}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                onRemind={handleRemind}
                reminding={remindMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>

      <CreateRecordModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onCreate={handleCreate}
        members={members}
      />
      <BulkRenewModal
        open={renewModalOpen}
        onOpenChange={setRenewModalOpen}
        count={selectedCount}
        onConfirm={handleBulkRenew}
        busy={bulkRenewMutation.isPending}
      />
      <BulkRemindModal
        open={remindMenuOpen}
        onOpenChange={setRemindMenuOpen}
        count={selectedCount}
        onConfirm={handleBulkRemind}
        busy={bulkRemindMutation.isPending}
      />
    </div>
  );
}

function Header({ onAdd, onExport, exporting }) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Training &amp; Certifications
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track team training and compliance. Send reminders before things expire.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={onExport}
          disabled={exporting}
          title="Export filtered records as CSV"
        >
          {exporting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Export
        </Button>
        <Button onClick={onAdd} className="bg-cyan-600 hover:bg-cyan-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add record
        </Button>
      </div>
    </div>
  );
}

function FilterBar({ statusFilter, onStatusChange, categoryFilter, onCategoryChange }) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2">
        <Label className="text-xs text-gray-500">Status</Label>
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[150px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Label className="text-xs text-gray-500">Category</Label>
        <Select value={categoryFilter} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-[180px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_FILTER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function BulkActionBar({ count, onRenew, onRemind, onClear, busy }) {
  return (
    <Card className="border-cyan-200 bg-cyan-50/50 dark:bg-cyan-900/10 dark:border-cyan-900/40">
      <CardContent className="py-3 px-4 flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-cyan-900 dark:text-cyan-100">
          {count} record{count === 1 ? "" : "s"} selected
        </span>
        <div className="flex items-center gap-2 ml-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={onRenew}
            disabled={busy}
            className="border-cyan-300 text-cyan-700 hover:bg-cyan-100 dark:border-cyan-800 dark:text-cyan-200"
          >
            <CalendarPlus className="w-3.5 h-3.5 mr-1.5" />
            Renew selected
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onRemind}
            disabled={busy}
            className="border-cyan-300 text-cyan-700 hover:bg-cyan-100 dark:border-cyan-800 dark:text-cyan-200"
          >
            <BellPlus className="w-3.5 h-3.5 mr-1.5" />
            Schedule reminder
          </Button>
          <Button size="sm" variant="ghost" onClick={onClear} disabled={busy}>
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryCards({ counts, loading }) {
  const cards = [
    {
      icon: GraduationCap,
      label: "Total",
      value: counts.total ?? 0,
      tone: "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
    },
    {
      icon: ShieldCheck,
      label: "Active",
      value: counts.active ?? 0,
      tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    },
    {
      icon: CalendarClock,
      label: "Expiring",
      value: counts.expiring ?? 0,
      tone: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    },
    {
      icon: AlertOctagon,
      label: "Expired",
      value: counts.expired ?? 0,
      tone: "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
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

function formatExpiryLabel(daysUntilExpiry, derivedStatus) {
  if (derivedStatus === "pending") return "Pending verification";
  if (daysUntilExpiry === null || daysUntilExpiry === undefined) return "No expiry on file";
  if (daysUntilExpiry < 0) return `Expired ${Math.abs(daysUntilExpiry)}d ago`;
  if (daysUntilExpiry === 0) return "Expires today";
  return `Expires in ${daysUntilExpiry}d`;
}

function RecordRow({
  record,
  selected,
  onToggleSelect,
  onStatusChange,
  onDelete,
  onRemind,
  reminding,
}) {
  const derived = record.derivedStatus || record.status;
  const tone = STATUS_TONES[derived] || STATUS_TONES.active;
  const memberName =
    record.memberId && typeof record.memberId === "object"
      ? [record.memberId.first_name, record.memberId.last_name]
          .filter(Boolean)
          .join(" ")
          .trim() || record.memberId.username
      : "Unknown member";
  const categoryLabel =
    CATEGORY_OPTIONS.find((c) => c.value === record.category)?.label || "Other";
  const expiryLabel = formatExpiryLabel(record.daysUntilExpiry, derived);
  const showRemind = derived === "expiring" || derived === "expired";

  return (
    <Card
      className={`border transition-shadow hover:shadow-md ${
        selected
          ? "border-cyan-400 dark:border-cyan-600 ring-1 ring-cyan-200 dark:ring-cyan-900/40"
          : "border-gray-200 dark:border-gray-700"
      }`}
    >
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <Checkbox
            checked={selected}
            onCheckedChange={onToggleSelect}
            aria-label={`Select ${record.name}`}
            className="mt-1 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                {record.name}
              </h3>
              <Badge variant="outline" className={`text-[10px] h-4 px-1.5 ${tone}`}>
                {derived}
              </Badge>
              <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-normal">
                {categoryLabel}
              </Badge>
              <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-normal">
                {memberName}
              </Badge>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {expiryLabel}
              {record.issuer ? ` · ${record.issuer}` : ""}
              {record.reminderCount > 0
                ? ` · ${record.reminderCount} reminder${record.reminderCount === 1 ? "" : "s"} sent`
                : ""}
            </div>
            {record.notes ? (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                {record.notes}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {showRemind ? (
              <Button
                size="sm"
                variant="outline"
                className="text-amber-700 border-amber-200 hover:bg-amber-50 dark:border-amber-900/40 dark:hover:bg-amber-900/20"
                onClick={() => onRemind(record._id)}
                disabled={reminding}
              >
                <BellRing className="w-3.5 h-3.5 mr-1" />
                Remind
              </Button>
            ) : null}
            <Select
              value={derived}
              onValueChange={(v) => onStatusChange(record._id, v)}
            >
              <SelectTrigger className="w-[120px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="expiring">Expiring</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="outline"
              className="text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900/40 dark:hover:bg-rose-900/20"
              onClick={() => onDelete(record._id)}
            >
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CreateRecordModal({ open, onOpenChange, onCreate, members }) {
  const [name, setName] = useState("");
  const [memberId, setMemberId] = useState("");
  const [category, setCategory] = useState("safety");
  const [issuer, setIssuer] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setName("");
    setMemberId("");
    setCategory("safety");
    setIssuer("");
    setExpiryDate("");
    setNotes("");
    setSubmitting(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !memberId) return;
    setSubmitting(true);
    try {
      await onCreate({
        name: name.trim(),
        memberId,
        category,
        issuer: issuer.trim() || undefined,
        expiryDate: expiryDate || undefined,
        notes: notes.trim() || undefined,
      });
      reset();
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !submitting) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New training record</DialogTitle>
          <DialogDescription>
            Track a certification or training for a team member. Add an expiry date to get reminders.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="training-name">Training name</Label>
            <Input
              id="training-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. OSHA-10 Construction Safety"
              autoFocus
              disabled={submitting}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Member</Label>
            <Select value={memberId} onValueChange={setMemberId} disabled={submitting}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a member" />
              </SelectTrigger>
              <SelectContent>
                {(members || []).map((m) => (
                  <SelectItem key={m._id} value={m._id}>
                    {[m.first_name, m.last_name].filter(Boolean).join(" ").trim() || m.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory} disabled={submitting}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="training-expiry">Expiry date</Label>
              <Input
                id="training-expiry"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="training-issuer">Issuer (optional)</Label>
            <Input
              id="training-issuer"
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
              placeholder="e.g. OSHA, Red Cross, internal"
              disabled={submitting}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="training-notes">Notes (optional)</Label>
            <Textarea
              id="training-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Renewal cost, scheduling notes, etc."
              disabled={submitting}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !name.trim() || !memberId}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                "Add record"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function BulkRenewModal({ open, onOpenChange, count, onConfirm, busy }) {
  // Default the renewal expiry to 12 months out — the most common cadence for
  // safety + compliance certs. The team-lead can override per renewal.
  const defaultExpiry = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().slice(0, 10);
  }, []);
  const [newExpiryDate, setNewExpiryDate] = useState(defaultExpiry);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newExpiryDate) return;
    await onConfirm(newExpiryDate);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Renew selected records</DialogTitle>
          <DialogDescription>
            Set a new expiry date for {count} selected record{count === 1 ? "" : "s"}. Status
            is recomputed from the new expiry.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="bulk-renew-expiry">New expiry date</Label>
            <Input
              id="bulk-renew-expiry"
              type="date"
              value={newExpiryDate}
              onChange={(e) => setNewExpiryDate(e.target.value)}
              disabled={busy}
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={busy || !newExpiryDate}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              {busy ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Renewing…
                </>
              ) : (
                `Renew ${count}`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function BulkRemindModal({ open, onOpenChange, count, onConfirm, busy }) {
  const [schedule, setSchedule] = useState("immediate");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onConfirm(schedule);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Schedule reminder</DialogTitle>
          <DialogDescription>
            Send a notification to the members on {count} selected record{count === 1 ? "" : "s"}.
            Daily and weekly cadences are stamped on the record and picked up by the reminder
            job.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label>Cadence</Label>
            <Select value={schedule} onValueChange={setSchedule} disabled={busy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REMINDER_SCHEDULE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={busy}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              {busy ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Scheduling…
                </>
              ) : schedule === "immediate" ? (
                `Send ${count} reminder${count === 1 ? "" : "s"}`
              ) : (
                `Schedule ${count}`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
