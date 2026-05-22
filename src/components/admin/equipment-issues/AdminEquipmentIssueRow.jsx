"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Wrench,
  HardDrive,
  Camera,
  Battery,
  Cable,
  Calendar,
  Clock,
  User,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const SEVERITY_TONES = {
  critical: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300",
  high: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/40 dark:text-orange-300",
  medium: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300",
  low: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300",
};

const STATUS_TONES = {
  open: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300",
  acknowledged: "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300",
  in_repair: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300",
  resolved: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300",
};

const CATEGORY_ICON = {
  camera: Camera,
  battery: Battery,
  cable: Cable,
  housing: HardDrive,
  other: Wrench,
};

export default function AdminEquipmentIssueRow({
  issue,
  onAcknowledge,
  onResolve,
  busy,
  selectable = false,
  selected = false,
  onToggleSelect,
}) {
  const Icon = CATEGORY_ICON[issue.category] || Wrench;
  const sevClass = SEVERITY_TONES[issue.severity] || SEVERITY_TONES.medium;
  const statusClass = STATUS_TONES[issue.status] || STATUS_TONES.open;
  const canAcknowledge = issue.status === "open";
  const canResolve = issue.status !== "resolved";
  const selectableHere = selectable && (canAcknowledge || canResolve);

  return (
    <Card
      className={`border transition-shadow hover:shadow-md ${
        selected
          ? "border-rose-300 dark:border-rose-700 ring-1 ring-rose-200 dark:ring-rose-900/40"
          : "border-gray-200 dark:border-gray-700"
      }`}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {selectableHere ? (
              <Checkbox
                checked={selected}
                onCheckedChange={() => onToggleSelect?.(issue.id)}
                aria-label={`Select issue ${issue.title}`}
                className="mt-1.5"
              />
            ) : null}
            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0">
              <Icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                  {issue.title}
                </h3>
                <Badge variant="outline" className={`text-[10px] h-4 px-1.5 ${sevClass}`}>
                  {issue.severity}
                </Badge>
                <Badge variant="outline" className={`text-[10px] h-4 px-1.5 ${statusClass}`}>
                  {formatStatus(issue.status)}
                </Badge>
                <Badge variant="outline" className="text-[10px] h-4 px-1.5 bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-300">
                  {issue.category}
                </Badge>
              </div>
              {issue.description ? (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {issue.description}
                </p>
              ) : null}
              {issue.resolutionNotes ? (
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1.5 italic">
                  Resolution: {issue.resolutionNotes}
                </p>
              ) : null}
              <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-500 flex-wrap">
                <span className="inline-flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {issue.operatorName || "Unknown operator"}
                </span>
                {issue.deviceName ? (
                  <span className="inline-flex items-center gap-1">
                    <HardDrive className="w-3 h-3" />
                    {issue.deviceName}
                  </span>
                ) : null}
                {issue.projectName ? (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {issue.projectName}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatRelative(issue.reportedAt)}
                </span>
                {issue.resolvedAt ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-3 h-3" />
                    resolved {formatRelative(issue.resolvedAt)}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            {canAcknowledge ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => onAcknowledge(issue.id)}
              >
                <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                Acknowledge
              </Button>
            ) : null}
            {canResolve ? (
              <Button
                type="button"
                size="sm"
                disabled={busy}
                onClick={() => onResolve(issue)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                Resolve
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatStatus(value) {
  if (!value) return "";
  return value.replace(/_/g, " ");
}

function formatRelative(value) {
  if (!value) return "";
  try {
    const d = new Date(value);
    const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffMin < 60 * 24) return `${Math.floor(diffMin / 60)}h ago`;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}
