"use client";

import React, { useState } from "react";
import { X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAlert } from "@/components/providers/AlertProvider";
import { useRequestOvertime } from "@/hooks/useQueryHooks";

const today = () => new Date().toISOString().slice(0, 10);

const ACCENT_CLASSES = {
  indigo: {
    iconBg: "bg-gradient-to-br from-indigo-500 to-purple-600",
    button: "bg-indigo-600 hover:bg-indigo-700",
    focus: "focus:ring-indigo-400",
  },
  blue: {
    iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
    button: "bg-blue-600 hover:bg-blue-700",
    focus: "focus:ring-blue-400",
  },
  red: {
    iconBg: "bg-gradient-to-br from-red-600 to-amber-500",
    button: "bg-red-700 hover:bg-red-800",
    focus: "focus:ring-red-400",
  },
  purple: {
    iconBg: "bg-gradient-to-br from-purple-500 to-pink-600",
    button: "bg-purple-600 hover:bg-purple-700",
    focus: "focus:ring-purple-400",
  },
};

/**
 * Shared overtime request modal — used across operator, qc-tech, customer-rep,
 * and user time-tracking pages. Project picker is hidden when showProject=false
 * (qc-tech and customer-rep clock shifts without project binding).
 */
export default function OvertimeRequestModal({
  open,
  onClose,
  userId,
  projects = [],
  accent = "indigo",
  showProject = true,
}) {
  const { showAlert } = useAlert();
  const requestOvertime = useRequestOvertime();
  const theme = ACCENT_CLASSES[accent] || ACCENT_CLASSES.indigo;

  const [date, setDate] = useState(today());
  const [projectId, setProjectId] = useState("");
  const [hours, setHours] = useState(1);
  const [reason, setReason] = useState("");

  if (!open) return null;

  const resetAndClose = () => {
    setDate(today());
    setProjectId("");
    setHours(1);
    setReason("");
    onClose?.();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      showAlert("Please provide a reason for the overtime", "error");
      return;
    }
    if (hours <= 0) {
      showAlert("Hours must be greater than 0", "error");
      return;
    }
    const projectCode = showProject
      ? projects.find((p) => p._id === projectId)?.name || "General"
      : "Shift";

    requestOvertime.mutate(
      {
        requestedBy: userId,
        date,
        projectId: showProject ? projectId || null : null,
        projectCode,
        hoursRequested: Number(hours),
        reason: reason.trim(),
      },
      {
        onSuccess: () => {
          showAlert("Overtime request submitted for approval", "success");
          resetAndClose();
        },
        onError: (err) => showAlert(err?.message || "Failed to submit overtime request", "error"),
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg ${theme.iconBg} flex items-center justify-center text-white`}>
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Request Overtime
            </h3>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className={`w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-1 ${theme.focus}`}
            />
          </div>

          {showProject && (
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                Project (optional)
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className={`w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-1 ${theme.focus}`}
              >
                <option value="">— General / No project —</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name || p.workOrder || p._id}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
              Hours Requested
            </label>
            <input
              type="number"
              step="0.25"
              min="0.25"
              max="16"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              required
              className={`w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-1 ${theme.focus}`}
            />
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
              Between 0.25 and 16 hours.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
              Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              maxLength={1000}
              required
              placeholder="Briefly explain why overtime is needed…"
              className={`w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-1 ${theme.focus}`}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={resetAndClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={requestOvertime.isPending}
              className={`${theme.button} text-white`}
            >
              {requestOvertime.isPending ? "Submitting…" : "Submit Request"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
