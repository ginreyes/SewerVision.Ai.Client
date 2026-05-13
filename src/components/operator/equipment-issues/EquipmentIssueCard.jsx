"use client";

import {
  AlertTriangle,
  Wrench,
  HardDrive,
  Camera,
  Battery,
  Cable,
  Calendar,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

/**
 * EquipmentIssueCard — one row in the issues list. Reused across the
 * "Open" and "Resolved" tabs so the visual language is consistent.
 *
 * @param {{
 *   issue: {
 *     id: string,
 *     deviceName?: string,
 *     category: 'camera' | 'battery' | 'cable' | 'housing' | 'other',
 *     severity: 'critical' | 'high' | 'medium' | 'low',
 *     status: 'open' | 'acknowledged' | 'in_repair' | 'resolved',
 *     title: string,
 *     description?: string,
 *     reportedAt: string,
 *     resolvedAt?: string | null,
 *     projectName?: string,
 *   },
 *   onAcknowledge?: (id: string) => void,
 * }} props
 */
export default function EquipmentIssueCard({ issue, onAcknowledge }) {
  const Icon = CATEGORY_ICON[issue.category] || Wrench;
  const sevClass = SEVERITY_TONES[issue.severity] || SEVERITY_TONES.medium;
  const statusClass = STATUS_TONES[issue.status] || STATUS_TONES.open;
  const canAcknowledge = issue.status === "open" && typeof onAcknowledge === "function";

  return (
    <Card className="border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0">
              <Icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
                  {issue.title}
                </h3>
                <Badge variant="outline" className={`text-[10px] h-4 px-1.5 ${sevClass}`}>
                  {issue.severity}
                </Badge>
                <Badge variant="outline" className={`text-[10px] h-4 px-1.5 ${statusClass}`}>
                  {formatStatus(issue.status)}
                </Badge>
              </div>
              {issue.description ? (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {issue.description}
                </p>
              ) : null}
              <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-500">
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
              </div>
            </div>
          </div>
          {canAcknowledge ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onAcknowledge(issue.id)}
              className="shrink-0"
            >
              <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
              Acknowledge
            </Button>
          ) : null}
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
