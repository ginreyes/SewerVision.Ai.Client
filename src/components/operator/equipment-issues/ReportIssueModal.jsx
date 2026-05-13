"use client";

import React, { useState } from "react";
import { Loader2, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAlert } from "@/components/providers/AlertProvider";

const CATEGORIES = [
  { value: "camera", label: "Camera / Lens" },
  { value: "battery", label: "Battery / Power" },
  { value: "cable", label: "Cable / Connector" },
  { value: "housing", label: "Housing / Mount" },
  { value: "other", label: "Other" },
];

const SEVERITIES = [
  { value: "critical", label: "Critical — equipment unusable" },
  { value: "high", label: "High — major degradation" },
  { value: "medium", label: "Medium — workaround in place" },
  { value: "low", label: "Low — cosmetic / minor" },
];

const INITIAL_FORM = {
  title: "",
  category: "other",
  severity: "medium",
  deviceName: "",
  description: "",
};

/**
 * ReportIssueModal — operator-facing form for logging a new equipment
 * issue. Frontend-only for May 13 — the submit calls the provided
 * onCreate callback (page-level handler stages the issue into local
 * state). Backend wiring lands May 14.
 */
export default function ReportIssueModal({ open, onOpenChange, onCreate, devices = [] }) {
  const { showAlert } = useAlert();
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setForm(INITIAL_FORM);
    setSubmitting(false);
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.title.trim()) {
      showAlert("Give the issue a short title", "error");
      return;
    }
    setSubmitting(true);
    try {
      await onCreate?.({
        title: form.title.trim(),
        category: form.category,
        severity: form.severity,
        deviceName: form.deviceName.trim() || null,
        description: form.description.trim() || null,
      });
      reset();
      onOpenChange?.(false);
    } catch (err) {
      showAlert(err?.message || "Failed to report issue", "error");
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !submitting) reset();
        onOpenChange?.(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report equipment issue</DialogTitle>
          <DialogDescription>
            Log a problem with field gear so maintenance can pick it up. Stored
            locally for now — submitted to the back-office on May 14.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="issue-title">Title</Label>
            <Input
              id="issue-title"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="e.g. Camera lens fogging mid-job"
              disabled={submitting}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => handleChange("category", v)}
                disabled={submitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Severity</Label>
              <Select
                value={form.severity}
                onValueChange={(v) => handleChange("severity", v)}
                disabled={submitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEVERITIES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="issue-device">Device (optional)</Label>
            {devices.length > 0 ? (
              <Select
                value={form.deviceName}
                onValueChange={(v) => handleChange("deviceName", v)}
                disabled={submitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pick a device" />
                </SelectTrigger>
                <SelectContent>
                  {devices.map((d) => (
                    <SelectItem key={d.id || d.name} value={d.name || ""}>
                      {d.name || "Unnamed device"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="issue-device"
                value={form.deviceName}
                onChange={(e) => handleChange("deviceName", e.target.value)}
                placeholder="Device name or serial"
                disabled={submitting}
              />
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="issue-description">What happened?</Label>
            <Textarea
              id="issue-description"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Anything maintenance needs to know — when it started, what you tried, etc."
              rows={4}
              disabled={submitting}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange?.(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Report issue
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
