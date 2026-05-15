"use client";

import React, { useState, useEffect } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

/**
 * ResolveIssueDialog — back-office form for closing out an equipment issue
 * with optional resolution notes that get persisted on the row.
 */
export default function ResolveIssueDialog({ open, onOpenChange, issue, onResolve }) {
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) setNotes("");
  }, [open]);

  if (!issue) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onResolve(issue.id, notes.trim() || undefined);
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Resolve issue</DialogTitle>
          <DialogDescription>
            Mark this issue as resolved and leave a short note so the operator
            knows what was done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-md border border-gray-200 dark:border-gray-700 p-3 bg-gray-50/60 dark:bg-gray-900/40">
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Issue
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">
              {issue.title}
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">
              {issue.deviceName || "No device"} · reported by {issue.operatorName || "unknown"}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="resolutionNotes">Resolution notes (optional)</Label>
            <Textarea
              id="resolutionNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, 5000))}
              placeholder="e.g. Replaced cable assembly, swapped the camera with serial 4118-B."
              rows={4}
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
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              Mark resolved
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
