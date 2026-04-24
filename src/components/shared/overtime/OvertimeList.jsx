"use client";

import React from "react";
import { Trash2, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAlert } from "@/components/providers/AlertProvider";
import { useWithdrawOvertimeRequest } from "@/hooks/useQueryHooks";
import OvertimeStatusBadge from "./OvertimeStatusBadge";
import FadeIn from "@/components/shared/FadeIn";

const Pulse = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
);

const formatDate = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
};

export default function OvertimeList({ requests = [], isLoading }) {
  const { showAlert } = useAlert();
  const withdraw = useWithdrawOvertimeRequest();

  const handleWithdraw = (id) => {
    withdraw.mutate(id, {
      onSuccess: () => showAlert("Overtime request withdrawn", "success"),
      onError: (err) => showAlert(err?.message || "Failed to withdraw", "error"),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardContent className="p-4 flex items-start justify-between gap-3">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Pulse className="h-4 w-32" />
                  <Pulse className="h-4 w-14 rounded-full" />
                </div>
                <Pulse className="h-3 w-56 max-w-full" />
              </div>
              <Pulse className="h-8 w-20 rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!requests.length) {
    return (
      <FadeIn>
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
          <Clock className="w-10 h-10 mb-2 opacity-40" />
          <p className="text-sm font-medium">No overtime requests yet</p>
          <p className="text-xs mt-1">Submit a request when you work beyond your scheduled hours</p>
        </div>
      </FadeIn>
    );
  }

  return (
    <FadeIn className="space-y-2 block">
      {requests.map((r) => (
        <Card
          key={r._id}
          className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
        >
          <CardContent className="p-4 flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {formatDate(r.date)}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  {r.hoursRequested}h
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
                <span className="text-xs text-gray-600 dark:text-gray-300 truncate max-w-[200px]">
                  {r.projectCode || "General"}
                </span>
                <OvertimeStatusBadge status={r.status} />
              </div>
              {r.reason && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 line-clamp-2">
                  {r.reason}
                </p>
              )}
              {r.reviewNote && r.status !== "pending" && (
                <p className="text-[11px] italic text-gray-500 dark:text-gray-500 mt-1">
                  Reviewer note: {r.reviewNote}
                </p>
              )}
            </div>
            {r.status === "pending" && (
              <Button
                variant="outline"
                size="sm"
                disabled={withdraw.isPending}
                onClick={() => handleWithdraw(r._id)}
                className="text-rose-600 hover:text-rose-700 border-rose-200 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-900/20"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Withdraw
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </FadeIn>
  );
}
