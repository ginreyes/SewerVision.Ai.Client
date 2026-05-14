"use client";

import React, { useMemo, useState } from "react";
import {
  CheckSquare,
  Check,
  X,
  Clock,
  AlertTriangle,
  Inbox,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAlert } from "@/components/providers/AlertProvider";
import {
  useApprovalsQueue,
  useApproveApprovalItem,
  useRejectApprovalItem,
} from "@/hooks/useSharedHooks";

/**
 * User → Approvals.
 *
 * Unified pending-decisions view for the team lead. Today it surfaces
 * overtime requests routed to the `team-lead` tier; new approvable
 * types will plug into the same queue without a new page (backend
 * dispatch on the `kind` discriminator).
 *
 * Backend: GET /api/user/approvals?status=pending|all
 *          PATCH /api/user/approvals/:kind/:id/approve
 *          PATCH /api/user/approvals/:kind/:id/reject
 */

const KIND_TONES = {
  overtime: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/40 dark:text-violet-300",
};

export default function UserApprovalsPage() {
  const { showAlert } = useAlert();
  const [tab, setTab] = useState("pending");
  const { data, isLoading, isError, error } = useApprovalsQueue(tab);

  const approveMutation = useApproveApprovalItem();
  const rejectMutation = useRejectApprovalItem();

  const items = data?.items || [];
  const counts = data?.counts || { total: 0, pending: 0, staleOver24h: 0 };

  const handleApprove = async (kind, id) => {
    try {
      await approveMutation.mutateAsync({ kind, id });
      showAlert("Approved", "success");
    } catch (err) {
      showAlert(err?.message || "Failed to approve", "error");
    }
  };

  const handleReject = async (kind, id) => {
    try {
      await rejectMutation.mutateAsync({ kind, id });
      showAlert("Rejected", "success");
    } catch (err) {
      showAlert(err?.message || "Failed to reject", "error");
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <Header counts={counts} />

        <SummaryCards counts={counts} loading={isLoading} />

        {isError ? (
          <Card className="border-rose-200 dark:border-rose-900/40">
            <CardContent className="py-6 text-sm text-rose-700 dark:text-rose-300">
              Failed to load approvals — {error?.message || "unknown error"}.
            </CardContent>
          </Card>
        ) : (
          <Tabs value={tab} onValueChange={setTab} className="space-y-4">
            <TabsList className="grid grid-cols-2 w-fit">
              <TabsTrigger value="pending">Pending ({counts.pending ?? 0})</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
            <TabsContent value="pending">
              <ApprovalsList
                items={items}
                loading={isLoading}
                onApprove={handleApprove}
                onReject={handleReject}
                emptyHint="No pending approvals. Nice — inbox zero on requests."
              />
            </TabsContent>
            <TabsContent value="all">
              <ApprovalsList
                items={items}
                loading={isLoading}
                onApprove={handleApprove}
                onReject={handleReject}
                emptyHint="No approval records yet."
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

function Header({ counts }) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md">
          <CheckSquare className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Approvals
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Unified queue of pending decisions routed to you as team lead.
          </p>
        </div>
      </div>
      {counts.staleOver24h > 0 ? (
        <Badge className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300">
          <AlertTriangle className="w-3.5 h-3.5 mr-1" />
          {counts.staleOver24h} pending {">"} 24h
        </Badge>
      ) : null}
    </div>
  );
}

function SummaryCards({ counts, loading }) {
  const cards = [
    {
      icon: Clock,
      label: "Pending",
      value: counts.pending ?? 0,
      tone: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    },
    {
      icon: AlertTriangle,
      label: "Stale > 24h",
      value: counts.staleOver24h ?? 0,
      tone: "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
    },
    {
      icon: CheckSquare,
      label: "Total in view",
      value: counts.total ?? 0,
      tone: "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
    },
  ];
  return (
    <div className="grid grid-cols-3 gap-3">
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

function ApprovalsList({ items, loading, onApprove, onReject, emptyHint }) {
  if (loading) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-10 flex items-center justify-center gap-2 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading approvals…</span>
        </CardContent>
      </Card>
    );
  }
  if (!items || items.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-10 flex flex-col items-center gap-2 text-gray-500">
          <Inbox className="w-6 h-6" />
          <span className="text-sm text-center">{emptyHint}</span>
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <ApprovalRow
          key={`${item.kind}-${item.id}`}
          item={item}
          onApprove={onApprove}
          onReject={onReject}
        />
      ))}
    </div>
  );
}

function ApprovalRow({ item, onApprove, onReject }) {
  const kindTone = KIND_TONES[item.kind] || KIND_TONES.overtime;
  const stale = item.ageHours >= 24 && item.status === "pending";
  const isActionable = item.status === "pending";
  return (
    <Card className="border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={`text-[10px] h-4 px-1.5 ${kindTone}`}>
                {item.kind}
              </Badge>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {item.requester?.name || "Unknown"}
              </span>
              <span className="text-xs text-gray-500">· {item.requester?.role}</span>
              {stale ? (
                <Badge className="text-[10px] h-4 px-1.5 bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300">
                  {item.ageHours}h waiting
                </Badge>
              ) : null}
            </div>
            <div className="text-sm text-gray-800 dark:text-gray-200 mt-1.5">
              {item.summary}
            </div>
            {item.reason ? (
              <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                {item.reason}
              </div>
            ) : null}
            <div className="text-[11px] text-gray-400 mt-1.5">
              Submitted {formatRelative(item.submittedAt)} · status: {item.status}
            </div>
          </div>
          {isActionable ? (
            <div className="flex flex-col gap-2 shrink-0">
              <Button
                size="sm"
                onClick={() => onApprove(item.kind, item.id)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onReject(item.kind, item.id)}
                className="border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-900/40 dark:text-rose-300 dark:hover:bg-rose-900/20"
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Reject
              </Button>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
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
