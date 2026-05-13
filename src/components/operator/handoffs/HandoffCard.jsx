"use client";

import { ClipboardCheck, AlertTriangle, MapPin, ArrowRight, User, Check, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAcknowledgeShiftHandoff } from "@/hooks/useOperatorHooks";
import { useAlert } from "@/components/providers/AlertProvider";

/**
 * HandoffCard — single row in the operator handoffs list. Reusable so the
 * same shape renders in the dashboard "Recent handoffs" widget AND on the
 * dedicated /operator/handoffs page.
 *
 * @param {{
 *   handoff: {
 *     _id: string,
 *     operatorId?: { first_name?: string, last_name?: string, username?: string } | string,
 *     nextShiftFor?: { first_name?: string, last_name?: string, username?: string } | null,
 *     projectIds?: Array<{ name?: string, workOrder?: string } | string>,
 *     observationsCreated: number,
 *     incidentsLogged: number,
 *     notes: string,
 *     shiftEnd: string,
 *   },
 *   currentUserId?: string,
 * }} props
 */
export default function HandoffCard({ handoff, currentUserId }) {
  const outgoingName = resolveName(handoff.operatorId);
  const incomingName = resolveName(handoff.nextShiftFor);
  const isIncoming = currentUserId && getId(handoff.nextShiftFor) === String(currentUserId);
  const projects = (handoff.projectIds || []).filter((p) => p && typeof p === "object");
  const isAcknowledged = !!handoff.acknowledgedAt;
  const canAcknowledge = isIncoming && !isAcknowledged;

  const { showAlert } = useAlert();
  const acknowledgeMutation = useAcknowledgeShiftHandoff();

  const handleAcknowledge = async () => {
    try {
      await acknowledgeMutation.mutateAsync(handoff._id);
      showAlert("Handoff acknowledged", "success");
    } catch (err) {
      showAlert(err?.message || "Failed to acknowledge handoff", "error");
    }
  };

  return (
    <Card className="border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-gray-500" />
              <span className="font-medium text-gray-900 dark:text-gray-200">{outgoingName}</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
            <span className={incomingName ? "text-gray-700 dark:text-gray-300" : "text-gray-400 italic"}>
              {incomingName || "No specific operator"}
            </span>
            {isIncoming && (
              <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1.5">
                For you
              </Badge>
            )}
            {isAcknowledged && (
              <Badge className="ml-1 text-[10px] h-4 px-1.5 bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300">
                <Check className="w-2.5 h-2.5 mr-0.5" />
                Acknowledged {formatRelative(handoff.acknowledgedAt)}
              </Badge>
            )}
          </div>
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {formatDate(handoff.shiftEnd)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Stat icon={MapPin} label="Observations" value={handoff.observationsCreated} tone="blue" />
          <Stat icon={AlertTriangle} label="Incidents" value={handoff.incidentsLogged} tone="amber" />
          <Stat icon={ClipboardCheck} label="Projects" value={projects.length} tone="indigo" />
        </div>

        {handoff.notes ? (
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line border-l-2 border-blue-300 pl-3 italic">
            {handoff.notes}
          </p>
        ) : (
          <p className="text-xs text-gray-400 italic">No notes left.</p>
        )}

        {projects.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {projects.map((p, i) => (
              <Badge key={p._id || p.workOrder || i} variant="outline" className="text-[10px]">
                {p.name || p.workOrder || "Project"}
              </Badge>
            ))}
          </div>
        )}

        {canAcknowledge && (
          <div className="pt-1">
            <Button
              type="button"
              size="sm"
              onClick={handleAcknowledge}
              disabled={acknowledgeMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {acknowledgeMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Acknowledging…
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 mr-1.5" />
                  Acknowledge handoff
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatRelative(value) {
  if (!value) return "";
  try {
    const d = new Date(value);
    const now = new Date();
    const diffMin = Math.floor((now - d) / 60000);
    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffMin < 60 * 24) return `${Math.floor(diffMin / 60)}h ago`;
    return d.toLocaleDateString();
  } catch {
    return "";
  }
}

function Stat({ icon: Icon, label, value, tone }) {
  const palette = {
    blue: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300",
    amber: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border ${palette[tone] || palette.blue}`}>
      <Icon className="w-3 h-3" />
      <span className="font-semibold tabular-nums">{value}</span>
      <span className="opacity-80">{label}</span>
    </span>
  );
}

function resolveName(person) {
  if (!person) return null;
  if (typeof person === "string") return null;
  const full = [person.first_name, person.last_name].filter(Boolean).join(" ").trim();
  return full || person.username || null;
}

function getId(person) {
  if (!person) return null;
  return typeof person === "string" ? person : String(person._id || "");
}

function formatDate(value) {
  if (!value) return "";
  try {
    const d = new Date(value);
    const now = new Date();
    const diffMin = Math.floor((now - d) / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffMin < 60 * 24) return `${Math.floor(diffMin / 60)}h ago`;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}
