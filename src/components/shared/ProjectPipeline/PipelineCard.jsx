"use client";

import { memo, useCallback, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Zap, Clock, User, CheckCircle } from "lucide-react";
import { pipelineKeys } from "@/data/pipelineApi";
import { api } from "@/lib/helper";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PRIORITY_COLORS = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-green-100 text-green-700 border-green-200",
};

const SLA_TARGETS = {
  planning: 2,
  "field-capture": 5,
  uploading: 1,
  "ai-processing": 1,
  "qc-review": 3,
  completed: 1,
  "customer-notified": 1,
};

function getTimeInStage(project) {
  const now = new Date();
  let enteredAt = null;

  if (project.statusHistory && project.statusHistory.length > 0) {
    const sorted = [...project.statusHistory].sort(
      (a, b) => new Date(b.changedAt || b.date) - new Date(a.changedAt || a.date)
    );
    const entry = sorted.find((h) => h.status === project.status);
    if (entry) {
      enteredAt = new Date(entry.changedAt || entry.date);
    }
  }

  if (!enteredAt) {
    enteredAt = new Date(project.updatedAt || project.created_at);
  }

  const diffMs = now - enteredAt;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return { label: `${diffDays}d`, hours: diffHours };
  if (diffHours > 0) return { label: `${diffHours}h`, hours: diffHours };
  return { label: "<1h", hours: 0 };
}

function getSLAStatus(project) {
  const target = SLA_TARGETS[project.status] || 3;
  const { hours } = getTimeInStage(project);
  const targetHours = target * 24;
  const ratio = hours / targetHours;

  if (ratio < 0.6) return "green";
  if (ratio < 1) return "amber";
  return "red";
}

function getInitials(name) {
  if (!name) return "?";
  if (typeof name === "object" && name.name) name = name.name;
  if (typeof name !== "string") return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * PipelineCard — rendered 50+ times in a kanban board.
 * Wrapped in React.memo so unchanged cards don't rerender when siblings
 * update; callback + derived values memoized to preserve memo benefit.
 */
function PipelineCard({
  project,
  quickActions = [],
  onClick,
  showSLA = false,
  selected = false,
  onSelect,
  accentColor = "rose",
}) {
  const queryClient = useQueryClient();
  const prefetchTimerRef = useRef(null);

  const timeInStage = useMemo(() => getTimeInStage(project), [project]);
  const slaStatus = useMemo(
    () => (showSLA ? getSLAStatus(project) : null),
    [project, showSLA]
  );

  const slaBarColor =
    slaStatus === "green"
      ? "bg-emerald-500"
      : slaStatus === "amber"
      ? "bg-amber-500"
      : "bg-red-500";

  const handleCardClick = useCallback(
    (e) => {
      // Avoid triggering card click when clicking checkbox or action buttons
      if (
        e.target.closest("button") ||
        e.target.closest('input[type="checkbox"]')
      )
        return;
      onClick?.(project);
    },
    [onClick, project]
  );

  // Prefetch the project summary on hover so the detail view feels instant.
  // Debounced 200ms so quick scroll-over doesn't fire a request per card.
  const handleMouseEnter = useCallback(() => {
    if (!project?._id) return;
    if (prefetchTimerRef.current) clearTimeout(prefetchTimerRef.current);
    prefetchTimerRef.current = setTimeout(() => {
      queryClient.prefetchQuery({
        queryKey: pipelineKeys.summary(project._id),
        queryFn: async () => {
          const res = await api(`/api/project-pipeline/${project._id}/summary`, "GET");
          if (!res.ok) throw new Error(res.data?.message || "prefetch failed");
          return res.data;
        },
        staleTime: 30_000,
      });
    }, 200);
  }, [project?._id, queryClient]);

  const handleMouseLeave = useCallback(() => {
    if (prefetchTimerRef.current) {
      clearTimeout(prefetchTimerRef.current);
      prefetchTimerRef.current = null;
    }
  }, []);

  return (
    <Card
      className={`cursor-pointer transition-shadow hover:shadow-md border ${
        selected ? `ring-2 ring-${accentColor}-400 border-${accentColor}-300` : "border-gray-200"
      }`}
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <CardContent className="p-3 space-y-2">
        {/* Top row: checkbox, name, priority */}
        <div className="flex items-start gap-2">
          {onSelect && (
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => onSelect(project._id, e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 cursor-pointer"
            />
          )}
          <span className="flex-1 text-sm font-semibold text-gray-900 truncate">
            {project.name}
          </span>
          {project.priority && (
            <Badge
              variant="outline"
              className={`text-[10px] px-1.5 py-0 leading-5 capitalize ${
                PRIORITY_COLORS[project.priority] || ""
              }`}
            >
              {project.priority}
            </Badge>
          )}
        </div>

        {/* Second row: client + location */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {project.client && (
            <span className="truncate">
              {typeof project.client === "object"
                ? project.client.name || project.client.companyName
                : project.client}
            </span>
          )}
          {project.location && (
            <span className="flex items-center gap-0.5 truncate">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {typeof project.location === "object"
                ? project.location.name || project.location.address
                : project.location}
            </span>
          )}
        </div>

        {/* Third row: avatars + days in stage */}
        <div className="flex items-center gap-2">
          {project.assignedOperator && (
            <span
              className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-[10px] font-medium"
              title={
                typeof project.assignedOperator === "object"
                  ? project.assignedOperator.name
                  : project.assignedOperator
              }
            >
              {getInitials(project.assignedOperator)}
            </span>
          )}
          {project.qcTechnician && (
            <span
              className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-[10px] font-medium"
              title={
                typeof project.qcTechnician === "object"
                  ? project.qcTechnician.name
                  : project.qcTechnician
              }
            >
              {getInitials(project.qcTechnician)}
            </span>
          )}
          <Badge
            variant="secondary"
            className="ml-auto text-[10px] px-1.5 py-0 leading-5 bg-gray-100 text-gray-600"
          >
            <Clock className="w-3 h-3 mr-0.5" />
            {timeInStage.label}
          </Badge>
        </div>

        {/* Fourth row: detection summary */}
        {project.aiDetections && project.aiDetections.total > 0 && (
          <div className="flex items-center gap-1">
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 leading-5 bg-purple-50 text-purple-700"
            >
              <Zap className="w-3 h-3 mr-0.5" />
              {project.aiDetections.total} detections
            </Badge>
          </div>
        )}

        {/* SLA bar */}
        {showSLA && slaStatus && (
          <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${slaBarColor}`}
              style={{
                width: `${Math.min(
                  (timeInStage.hours /
                    ((SLA_TARGETS[project.status] || 3) * 24)) *
                    100,
                  100
                )}%`,
              }}
            />
          </div>
        )}

        {/* Quick actions */}
        {quickActions.length > 0 && (
          <div className="flex items-center gap-1 pt-1 border-t border-gray-100">
            {quickActions.map((action, i) => {
              const Icon = action.icon;
              return (
                <Button
                  key={i}
                  variant={action.variant || "ghost"}
                  size="icon"
                  className="h-7 w-7"
                  disabled={action.disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick?.(project);
                  }}
                  title={action.label}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                </Button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default memo(PipelineCard);
