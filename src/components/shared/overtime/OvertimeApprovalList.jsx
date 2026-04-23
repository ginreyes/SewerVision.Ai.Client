"use client";

import React, { useState, useMemo } from "react";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Filter,
  Search,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/components/providers/UserContext";
import { useAlert } from "@/components/providers/AlertProvider";
import {
  useOvertimeApprovalQueue,
  useApproveOvertimeRequest,
  useRejectOvertimeRequest,
} from "@/hooks/useQueryHooks";
import OvertimeStatusBadge from "./OvertimeStatusBadge";
import OvertimeSkeleton from "./OvertimeSkeleton";
import FadeIn from "@/components/shared/FadeIn";

const ACCENT_CLASSES = {
  rose: {
    iconBg: "bg-gradient-to-br from-rose-500 to-red-600",
    filterBtn: "bg-rose-600 border-rose-600",
  },
  indigo: {
    iconBg: "bg-gradient-to-br from-indigo-500 to-purple-600",
    filterBtn: "bg-indigo-600 border-indigo-600",
  },
};

const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const memberName = (u) => {
  if (!u) return "Unknown";
  if (typeof u === "string") return u;
  const full = [u.first_name, u.last_name].filter(Boolean).join(" ").trim();
  return full || u.username || u.email || "Unknown";
};

const FILTERS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
];

/**
 * OvertimeApprovalList — shared queue view for admins and team leads.
 *
 * Props:
 *  - approverTier: 'admin' | 'team-lead' — drives the backend filter
 *  - managedBy: optional userId — when set, backend scopes to that lead's
 *                                  managedMembers (used for team-lead view)
 *  - title / description / accent — cosmetic header tuning per consumer
 */
export default function OvertimeApprovalList({
  approverTier,
  managedBy,
  title = "Overtime Approvals",
  description = "Review and approve overtime requests",
  accent = "rose",
}) {
  const { userId } = useUser();
  const { showAlert } = useAlert();
  const [filter, setFilter] = useState("pending");
  const [search, setSearch] = useState("");

  const theme = ACCENT_CLASSES[accent] || ACCENT_CLASSES.rose;

  const queryFilters = useMemo(() => {
    const f = { approverTier };
    if (filter !== "all") f.status = filter;
    if (managedBy) f.managedBy = managedBy;
    return f;
  }, [approverTier, filter, managedBy]);

  const { data: requests = [], isLoading } = useOvertimeApprovalQueue(queryFilters);
  const approve = useApproveOvertimeRequest();
  const reject = useRejectOvertimeRequest();

  const visibleRequests = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return requests;
    return requests.filter((r) => {
      const name = memberName(r.requestedBy).toLowerCase();
      return (
        name.includes(q) ||
        (r.projectCode || "").toLowerCase().includes(q) ||
        (r.reason || "").toLowerCase().includes(q)
      );
    });
  }, [requests, search]);

  const summary = useMemo(() => {
    const list = Array.isArray(requests) ? requests : [];
    return {
      pending: list.filter((r) => r.status === "pending").length,
      approved: list.filter((r) => r.status === "approved").length,
      rejected: list.filter((r) => r.status === "rejected").length,
      totalPendingHours: list
        .filter((r) => r.status === "pending")
        .reduce((s, r) => s + (r.hoursRequested || 0), 0),
      totalApprovedHours: list
        .filter((r) => r.status === "approved")
        .reduce((s, r) => s + (r.hoursRequested || 0), 0),
    };
  }, [requests]);

  const statCards = [
    {
      label: "Pending",
      value: summary.pending,
      sub: `${summary.totalPendingHours}h awaiting`,
      icon: AlertCircle,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-900/30",
    },
    {
      label: "Approved",
      value: summary.approved,
      sub: `${summary.totalApprovedHours}h logged`,
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-900/30",
    },
    {
      label: "Rejected",
      value: summary.rejected,
      sub: "Past decisions",
      icon: XCircle,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-900/30",
    },
    {
      label: "Total",
      value: summary.pending + summary.approved + summary.rejected,
      sub: "This scope",
      icon: TrendingUp,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-900/30",
    },
  ];

  const handleApprove = (id) => {
    approve.mutate(
      { id, reviewedBy: userId, reviewNote: "" },
      {
        onSuccess: () => showAlert("Overtime request approved", "success"),
        onError: (err) => showAlert(err?.message || "Failed to approve", "error"),
      }
    );
  };

  const handleReject = (id) => {
    const note =
      typeof window !== "undefined"
        ? window.prompt("Reason for rejection (optional):", "")
        : "";
    reject.mutate(
      { id, reviewedBy: userId, reviewNote: note || "" },
      {
        onSuccess: () => showAlert("Overtime request rejected", "success"),
        onError: (err) => showAlert(err?.message || "Failed to reject", "error"),
      }
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl ${theme.iconBg} flex items-center justify-center text-white shadow-md`}
          >
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {statCards.map((s) => (
          <Card
            key={s.label}
            className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.bg}`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight">
                  {s.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {s.label} · {s.sub}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filter === f.value
                  ? `${theme.filterBtn} text-white`
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, project, reason…"
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <OvertimeSkeleton statCount={4} rowCount={5} />
      ) : visibleRequests.length === 0 ? (
        <FadeIn>
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
            <Clock className="w-12 h-12 mb-3 opacity-40" />
            <p className="text-sm font-medium">No requests match your filters</p>
          </div>
        </FadeIn>
      ) : (
        <FadeIn className="space-y-2 block">
          {visibleRequests.map((r) => (
            <Card
              key={r._id}
              className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {memberName(r.requestedBy)}
                      </span>
                      {r.requestedByRole && (
                        <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                          {r.requestedByRole}
                        </span>
                      )}
                      <OvertimeStatusBadge status={r.status} />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>{formatDate(r.date)}</span>
                      <span>•</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {r.hoursRequested}h
                      </span>
                      <span>•</span>
                      <span className="truncate max-w-[200px]">
                        {r.projectCode || "General"}
                      </span>
                    </div>
                    {r.reason && (
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">
                        <span className="font-medium">Reason:</span> {r.reason}
                      </p>
                    )}
                    {r.reviewNote && r.status !== "pending" && (
                      <p className="text-[11px] italic text-gray-500 dark:text-gray-500 mt-1">
                        Reviewer note: {r.reviewNote}
                      </p>
                    )}
                    {r.reviewedBy && r.status !== "pending" && (
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                        Reviewed by {memberName(r.reviewedBy)}
                        {r.reviewedAt ? ` · ${formatDate(r.reviewedAt)}` : ""}
                      </p>
                    )}
                  </div>

                  {r.status === "pending" && (
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(r._id)}
                        disabled={approve.isPending}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(r._id)}
                        disabled={reject.isPending}
                        className="text-rose-600 hover:text-rose-700 border-rose-200 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-900/20 gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </FadeIn>
      )}
    </div>
  );
}
