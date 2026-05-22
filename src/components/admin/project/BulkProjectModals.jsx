"use client";

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Tag, UserPlus, ListChecks } from "lucide-react";
import { useAllUsers } from "@/hooks/useAdminHooks";

const PROJECT_STATUS_OPTIONS = [
  { value: "planning", label: "Planning" },
  { value: "field-capture", label: "Field Capture" },
  { value: "uploading", label: "Uploading" },
  { value: "ai-processing", label: "AI Processing" },
  { value: "qc-review", label: "QC Review" },
  { value: "completed", label: "Completed" },
  { value: "customer-notified", label: "Customer Notified" },
  { value: "on-hold", label: "On Hold" },
];

export function BulkAssignModal({ open, onClose, selectedCount, isPending, onConfirm }) {
  const [assigneeId, setAssigneeId] = useState("");
  const { data, isLoading } = useAllUsers({ role: "operator", limit: 200 });
  const operators = useMemo(() => data?.users || [], [data]);

  const handleConfirm = () => {
    if (!assigneeId) return;
    onConfirm({ assigneeId });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <UserPlus className="w-4 h-4 text-rose-600" />
            Reassign {selectedCount} project{selectedCount === 1 ? "" : "s"}
          </DialogTitle>
          <DialogDescription>
            The selected projects will all have their assigned operator updated.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700">Operator</label>
          {isLoading ? (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading operators…
            </div>
          ) : (
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full h-9 rounded-md border border-gray-200 bg-white px-2 text-sm"
            >
              <option value="">Select an operator…</option>
              {operators.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.first_name || u.username} {u.last_name || ""} ({u.email})
                </option>
              ))}
            </select>
          )}
          {!isLoading && operators.length === 0 && (
            <p className="text-[11px] text-gray-400">No operators found in the user directory.</p>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleConfirm} disabled={!assigneeId || isPending}>
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}
            Reassign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function BulkStatusModal({ open, onClose, selectedCount, isPending, onConfirm }) {
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");

  const handleConfirm = () => {
    if (!status) return;
    onConfirm({ status, note: note.trim() || undefined });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <ListChecks className="w-4 h-4 text-rose-600" />
            Change status for {selectedCount} project{selectedCount === 1 ? "" : "s"}
          </DialogTitle>
          <DialogDescription>
            A status-history entry will be appended to every selected project.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">New status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full h-9 rounded-md border border-gray-200 bg-white px-2 text-sm"
            >
              <option value="">Select a status…</option>
              {PROJECT_STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Note (optional)</label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Reverted from QC after customer feedback"
              className="text-sm"
            />
            <p className="text-[10px] text-gray-400">Appears in each project's status history.</p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleConfirm} disabled={!status || isPending}>
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}
            Apply status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function BulkTagModal({ open, onClose, selectedCount, isPending, onConfirm }) {
  const [tag, setTag] = useState("");

  const handleConfirm = () => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    onConfirm({ tag: trimmed });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Tag className="w-4 h-4 text-rose-600" />
            Add tag to {selectedCount} project{selectedCount === 1 ? "" : "s"}
          </DialogTitle>
          <DialogDescription>
            Existing tags on each project are preserved; the new tag is appended if not already present.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">Tag</label>
          <Input
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="e.g. priority-q2, customer-acme"
            className="text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleConfirm();
            }}
            autoFocus
          />
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleConfirm} disabled={!tag.trim() || isPending}>
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}
            Add tag
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
