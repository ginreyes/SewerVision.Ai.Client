"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  FolderKanban,
  Minus,
  Plus,
  Repeat,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Check,
  Search,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useAlert } from "@/components/providers/AlertProvider";
import { useRequestOvertime } from "@/hooks/useQueryHooks";

const STEPS = [
  { key: "when", label: "When", icon: CalendarIcon },
  { key: "where", label: "Project", icon: FolderKanban },
  { key: "duration", label: "Hours", icon: Clock },
  { key: "why", label: "Reason", icon: Sparkles },
];

const ACCENT = {
  indigo: { ring: "focus:ring-indigo-400", btn: "bg-indigo-600 hover:bg-indigo-700", chipActive: "bg-indigo-100 text-indigo-700 border-indigo-300", iconBg: "bg-gradient-to-br from-indigo-500 to-purple-600" },
  blue: { ring: "focus:ring-blue-400", btn: "bg-blue-600 hover:bg-blue-700", chipActive: "bg-blue-100 text-blue-700 border-blue-300", iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600" },
  red: { ring: "focus:ring-red-400", btn: "bg-red-700 hover:bg-red-800", chipActive: "bg-red-100 text-red-700 border-red-300", iconBg: "bg-gradient-to-br from-red-600 to-amber-500" },
  purple: { ring: "focus:ring-purple-400", btn: "bg-purple-600 hover:bg-purple-700", chipActive: "bg-purple-100 text-purple-700 border-purple-300", iconBg: "bg-gradient-to-br from-purple-500 to-pink-600" },
  rose: { ring: "focus:ring-rose-400", btn: "bg-rose-600 hover:bg-rose-700", chipActive: "bg-rose-100 text-rose-700 border-rose-300", iconBg: "bg-gradient-to-br from-rose-500 to-pink-600" },
  teal: { ring: "focus:ring-teal-400", btn: "bg-teal-600 hover:bg-teal-700", chipActive: "bg-teal-100 text-teal-700 border-teal-300", iconBg: "bg-gradient-to-br from-teal-500 to-cyan-600" },
};

const QUICK_REASONS = [
  "Urgent client deadline",
  "Equipment failure recovery",
  "After-hours QC review",
  "Shift handoff coverage",
  "Critical defect investigation",
  "Project milestone push",
];

const QUICK_HOURS = [1, 2, 3, 4];

const today = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Advanced overtime request — 4-step wizard built on shadcn primitives.
 * Step 1: date (Calendar popover) + recurring toggle
 * Step 2: project picker w/ search
 * Step 3: hour stepper + quick-pick chips
 * Step 4: reason textarea + quick-reason chips
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
  const theme = ACCENT[accent] || ACCENT.indigo;

  const [stepIdx, setStepIdx] = useState(0);
  const [date, setDate] = useState(today());
  const [recurring, setRecurring] = useState("none"); // 'none' | 'daily' | 'weekly'
  const [projectId, setProjectId] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const [projectPopoverOpen, setProjectPopoverOpen] = useState(false);
  const [hours, setHours] = useState(1);
  const [reason, setReason] = useState("");

  // Reset to step 0 when re-opening so the user always starts fresh.
  useEffect(() => {
    if (open) {
      setStepIdx(0);
    }
  }, [open]);

  const filteredProjects = useMemo(() => {
    if (!projectSearch) return projects.slice(0, 20);
    const q = projectSearch.toLowerCase();
    return projects
      .filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.workOrder?.toLowerCase().includes(q) ||
          p.client?.toLowerCase().includes(q)
      )
      .slice(0, 20);
  }, [projects, projectSearch]);

  const selectedProject = useMemo(
    () => projects.find((p) => p._id === projectId) || null,
    [projects, projectId]
  );

  const skipProjectStep = !showProject;
  const visibleSteps = skipProjectStep ? STEPS.filter((s) => s.key !== "where") : STEPS;
  const currentStep = visibleSteps[stepIdx];

  const resetAndClose = () => {
    setStepIdx(0);
    setDate(today());
    setRecurring("none");
    setProjectId("");
    setProjectSearch("");
    setHours(1);
    setReason("");
    onClose?.();
  };

  const stepValid = useMemo(() => {
    if (currentStep.key === "when") return Boolean(date);
    if (currentStep.key === "where") return true; // project optional
    if (currentStep.key === "duration") return hours >= 0.25 && hours <= 16;
    if (currentStep.key === "why") return reason.trim().length > 0;
    return true;
  }, [currentStep, date, hours, reason]);

  const onNext = () => {
    if (stepIdx < visibleSteps.length - 1) setStepIdx((i) => i + 1);
    else handleSubmit();
  };
  const onBack = () => {
    if (stepIdx > 0) setStepIdx((i) => i - 1);
  };

  const handleSubmit = () => {
    if (!reason.trim()) {
      showAlert("Please provide a reason for the overtime", "error");
      setStepIdx(visibleSteps.findIndex((s) => s.key === "why"));
      return;
    }
    if (hours <= 0) {
      showAlert("Hours must be greater than 0", "error");
      setStepIdx(visibleSteps.findIndex((s) => s.key === "duration"));
      return;
    }

    const projectCode = showProject
      ? projects.find((p) => p._id === projectId)?.name || "General"
      : "Shift";

    requestOvertime.mutate(
      {
        requestedBy: userId,
        date: date.toISOString().slice(0, 10),
        projectId: showProject ? projectId || null : null,
        projectCode,
        hoursRequested: Number(hours),
        reason: reason.trim(),
        recurring: recurring !== "none" ? recurring : undefined,
      },
      {
        onSuccess: () => {
          showAlert("Overtime request submitted for approval", "success");
          resetAndClose();
        },
        onError: (err) =>
          showAlert(err?.message || "Failed to submit overtime request", "error"),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetAndClose(); }}>
      <DialogContent size="lg" className="p-0 overflow-hidden gap-0">
        <DialogHeader className="px-6 pt-6 pb-3">
          <DialogTitle className="flex items-center gap-3 text-lg">
            <span className={`w-9 h-9 rounded-xl ${theme.iconBg} flex items-center justify-center text-white shadow-sm`}>
              <Clock className="w-5 h-5" />
            </span>
            <span>
              Request Overtime
              <span className="block text-xs font-normal text-gray-500 dark:text-gray-400 mt-0.5">
                Step {stepIdx + 1} of {visibleSteps.length} — {currentStep.label}
              </span>
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Stepper rail */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-1.5">
            {visibleSteps.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === stepIdx;
              const isDone = i < stepIdx;
              return (
                <div key={s.key} className="flex items-center flex-1 last:flex-none">
                  <button
                    type="button"
                    onClick={() => i <= stepIdx && setStepIdx(i)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                      isActive
                        ? `${theme.chipActive} cursor-default`
                        : isDone
                          ? "bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                          : "bg-white text-gray-400 border-gray-200 cursor-not-allowed dark:bg-gray-900 dark:border-gray-700"
                    }`}
                  >
                    {isDone ? <Check className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
                    {s.label}
                  </button>
                  {i < visibleSteps.length - 1 && (
                    <div className={`flex-1 h-px mx-1 ${isDone ? "bg-gray-300" : "bg-gray-200 dark:bg-gray-700"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Step body */}
        <div className="px-6 py-6 min-h-[280px]">
          {currentStep.key === "when" && (
            <div className="space-y-4">
              <div>
                <Label className="text-xs uppercase tracking-wider text-gray-500">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal mt-1"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? date.toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "long", day: "numeric" }) : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(d) => d && setDate(d)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider text-gray-500">Recurring</Label>
                <div className="flex gap-2 mt-1">
                  {[
                    { key: "none", label: "Once" },
                    { key: "daily", label: "Daily this week" },
                    { key: "weekly", label: "Weekly" },
                  ].map((r) => (
                    <button
                      key={r.key}
                      type="button"
                      onClick={() => setRecurring(r.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        recurring === r.key
                          ? theme.chipActive
                          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700"
                      }`}
                    >
                      {r.key !== "none" && <Repeat className="w-3 h-3" />}
                      {r.label}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-gray-400 mt-1.5">
                  {recurring === "daily" && "A separate request will be created for each weekday this week."}
                  {recurring === "weekly" && "A separate request will be created for the same day in the next 4 weeks."}
                </p>
              </div>
            </div>
          )}

          {currentStep.key === "where" && (
            <div className="space-y-4">
              <Label className="text-xs uppercase tracking-wider text-gray-500">Project (optional)</Label>
              <Popover open={projectPopoverOpen} onOpenChange={setProjectPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between text-left font-normal"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <FolderKanban className="w-4 h-4 shrink-0 text-gray-400" />
                      <span className="truncate">
                        {selectedProject ? selectedProject.name : "— General / no project —"}
                      </span>
                    </span>
                    <ChevronRight className="w-4 h-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <Input
                        autoFocus
                        value={projectSearch}
                        onChange={(e) => setProjectSearch(e.target.value)}
                        placeholder="Search by name, work order, client..."
                        className="pl-8 h-8 text-sm border-0 focus-visible:ring-1"
                      />
                    </div>
                  </div>
                  <ScrollArea className="max-h-64">
                    <div className="p-1">
                      <button
                        type="button"
                        onClick={() => { setProjectId(""); setProjectPopoverOpen(false); }}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 ${
                          projectId === "" ? theme.chipActive : "hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                      >
                        <span className="w-6 h-6 rounded-md bg-gray-200 dark:bg-gray-700" />
                        — General / no project —
                      </button>
                      {filteredProjects.map((p) => (
                        <button
                          key={p._id}
                          type="button"
                          onClick={() => { setProjectId(p._id); setProjectPopoverOpen(false); }}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 ${
                            projectId === p._id ? theme.chipActive : "hover:bg-gray-50 dark:hover:bg-gray-800"
                          }`}
                        >
                          <span className="w-6 h-6 rounded-md bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300">
                            {(p.name?.[0] || "?").toUpperCase()}
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className="block font-medium truncate">{p.name}</span>
                            <span className="block text-[10px] text-gray-500 truncate">
                              {p.workOrder || "—"} · {p.client || "—"}
                            </span>
                          </span>
                        </button>
                      ))}
                      {filteredProjects.length === 0 && (
                        <div className="text-xs text-gray-400 py-6 text-center">No projects match "{projectSearch}"</div>
                      )}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>

              {selectedProject && (
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardContent className="p-3 flex items-center gap-3">
                    <span className={`w-9 h-9 rounded-lg ${theme.iconBg} text-white flex items-center justify-center font-bold text-sm`}>
                      {(selectedProject.name?.[0] || "?").toUpperCase()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{selectedProject.name}</p>
                      <p className="text-xs text-gray-500 truncate">{selectedProject.workOrder || "—"} · {selectedProject.client || "—"}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {currentStep.key === "duration" && (
            <div className="space-y-6">
              <div className="flex flex-col items-center">
                <Label className="text-xs uppercase tracking-wider text-gray-500 mb-3">Hours requested</Label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setHours((h) => Math.max(0.25, +(h - 0.25).toFixed(2)))}
                    aria-label="Decrease hours"
                    className="h-12 w-12 rounded-full"
                  >
                    <Minus className="w-5 h-5" />
                  </Button>
                  <div className="flex flex-col items-center min-w-[140px]">
                    <span className="text-5xl font-bold tabular-nums tracking-tight text-gray-900 dark:text-gray-100">
                      {Number(hours).toFixed(2).replace(/\.00$/, "")}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">hours</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setHours((h) => Math.min(16, +(h + 0.25).toFixed(2)))}
                    aria-label="Increase hours"
                    className="h-12 w-12 rounded-full"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-[11px] text-gray-400 mt-2">Step ¼ hour · min 0.25 · max 16</p>
              </div>

              <div>
                <Label className="text-xs uppercase tracking-wider text-gray-500">Quick pick</Label>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {QUICK_HOURS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setHours(h)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        hours === h
                          ? theme.chipActive
                          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700"
                      }`}
                    >
                      {h}h
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep.key === "why" && (
            <div className="space-y-4">
              <div>
                <Label className="text-xs uppercase tracking-wider text-gray-500">Reason</Label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  maxLength={1000}
                  placeholder="Briefly explain why overtime is needed…"
                  className={`mt-1 text-sm ${theme.ring}`}
                  autoFocus
                />
                <div className="text-[11px] text-gray-400 text-right mt-1">{reason.length}/1000</div>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider text-gray-500">Quick reasons</Label>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {QUICK_REASONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setReason((prev) => (prev ? `${prev}\n${r}` : r))}
                      className="px-3 py-1.5 rounded-full text-xs font-medium border bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 transition-colors"
                    >
                      + {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary card so the user sees what they're about to submit */}
              <Card className="border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <CardContent className="p-3 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-gray-400">Date</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Hours</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{hours}h</p>
                  </div>
                  {showProject && (
                    <div>
                      <p className="text-gray-400">Project</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{selectedProject?.name || "General"}</p>
                    </div>
                  )}
                  {recurring !== "none" && (
                    <div>
                      <p className="text-gray-400">Recurring</p>
                      <Badge variant="secondary" className="text-[10px]">{recurring}</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <Separator />

        <DialogFooter className="px-6 py-4 flex flex-row sm:flex-row sm:justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            disabled={stepIdx === 0}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={resetAndClose}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onNext}
              disabled={!stepValid || requestOvertime.isPending}
              className={`${theme.btn} text-white gap-1`}
            >
              {stepIdx === visibleSteps.length - 1
                ? (requestOvertime.isPending ? "Submitting…" : "Submit Request")
                : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
