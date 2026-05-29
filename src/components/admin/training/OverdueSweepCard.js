"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Clock3, Loader2, Play, AlertTriangle } from "lucide-react";
import {
  useTrainingOverdueConfig,
  useUpdateTrainingOverdueConfig,
  useRunTrainingOverdueSweepNow,
} from "@/hooks/useQueryHooks";
import { useAlert } from "@/components/providers/AlertProvider";

/**
 * Admin Settings card for the June 4 training overdue-sweep cron.
 *
 * Lets an admin toggle the cron without a redeploy and tune the reminder
 * cadence (1d / 3d / 7d). Surfaces the last sweep timestamp + counts so
 * the operator can sanity-check that the job is firing.
 */
export default function OverdueSweepCard() {
  const { showAlert } = useAlert();
  const { data: cfg, isLoading } = useTrainingOverdueConfig();
  const updateMutation = useUpdateTrainingOverdueConfig();
  const runNowMutation = useRunTrainingOverdueSweepNow();

  // Local mirror so the radio + toggle feel instant; we still trust the server
  // round-trip for the persisted state.
  const [pendingEnabled, setPendingEnabled] = useState(true);
  const [pendingCadence, setPendingCadence] = useState(3);

  useEffect(() => {
    if (cfg) {
      setPendingEnabled(cfg.enabled);
      setPendingCadence(cfg.cadenceDays);
    }
  }, [cfg]);

  const handleEnabledToggle = async () => {
    const next = !pendingEnabled;
    setPendingEnabled(next);
    try {
      await updateMutation.mutateAsync({ enabled: next });
      showAlert(`Overdue sweep ${next ? "enabled" : "disabled"}`, "success");
    } catch (e) {
      setPendingEnabled(!next);
      showAlert(e?.message || "Failed to update", "error");
    }
  };

  const handleCadenceChange = async (cadence) => {
    setPendingCadence(cadence);
    try {
      await updateMutation.mutateAsync({ cadenceDays: cadence });
      showAlert(`Reminder cadence set to ${cadence} day${cadence === 1 ? "" : "s"}`, "success");
    } catch (e) {
      showAlert(e?.message || "Failed to update cadence", "error");
    }
  };

  const handleRunNow = async () => {
    try {
      const result = await runNowMutation.mutateAsync();
      showAlert(
        `Sweep done — scanned ${result.scanned}, flipped ${result.flippedToOverdue}, reminded ${result.reminded}, cooldown-skipped ${result.skippedDueToCooldown}`,
        "success"
      );
    } catch (e) {
      showAlert(e?.message || "Sweep failed", "error");
    }
  };

  const counts = cfg?.lastSweepCounts;
  const lastSweepAt = cfg?.lastSweepAt;
  const allowedCadences = cfg?.allowedCadences || [1, 3, 7];

  return (
    <Card className="border-amber-200 bg-amber-50/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-500" />
          Overdue Sweep
          <Badge variant="outline" className="text-[10px] ml-1">cron · every 30m</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-xs">
        {isLoading ? (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading config…
          </div>
        ) : (
          <>
            {/* Enable toggle */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-800">Background sweep</div>
                <div className="text-[11px] text-gray-500">
                  When enabled, the cron promotes past-due assignments and fans reminders.
                </div>
              </div>
              <button
                onClick={handleEnabledToggle}
                disabled={updateMutation.isPending}
                className={`relative w-10 h-5 rounded-full transition-colors ${pendingEnabled ? "bg-emerald-500" : "bg-gray-300"}`}
                aria-label="Toggle overdue sweep"
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${pendingEnabled ? "translate-x-5" : ""}`}
                />
              </button>
            </div>

            {/* Cadence radio */}
            <div>
              <div className="text-sm font-medium text-gray-800 mb-1.5 flex items-center gap-1.5">
                <Clock3 className="w-3.5 h-3.5 text-amber-500" /> Reminder cadence
              </div>
              <div className="flex items-center gap-1.5">
                {allowedCadences.map((d) => (
                  <button
                    key={d}
                    onClick={() => handleCadenceChange(d)}
                    disabled={updateMutation.isPending}
                    className={`px-3 py-1 rounded-md text-[11px] font-medium transition-colors border ${
                      pendingCadence === d
                        ? "bg-amber-100 text-amber-700 border-amber-200"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-amber-50"
                    }`}
                  >
                    {d} day{d === 1 ? "" : "s"}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Each assignee gets at most one reminder per cadence window — overrides still work via the manual Remind button.
              </p>
            </div>

            {/* Run now + last sweep summary */}
            <div className="border-t border-amber-100 pt-3 flex items-center justify-between flex-wrap gap-2">
              <div className="text-[11px] text-gray-600">
                {lastSweepAt ? (
                  <>
                    Last sweep: <span className="font-medium">{new Date(lastSweepAt).toLocaleString()}</span>
                    {counts && (
                      <>
                        {" — "}
                        <span>{counts.scanned} scanned</span>
                        {" · "}
                        <span className="text-rose-600">{counts.flippedToOverdue} flipped</span>
                        {" · "}
                        <span className="text-emerald-600">{counts.reminded} reminded</span>
                        {counts.skippedDueToCooldown > 0 && (
                          <>
                            {" · "}
                            <span className="text-gray-500">{counts.skippedDueToCooldown} cooldown-skipped</span>
                          </>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <span className="text-gray-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> No sweep has run yet.
                  </span>
                )}
              </div>
              <Button
                onClick={handleRunNow}
                disabled={runNowMutation.isPending || !pendingEnabled}
                size="sm"
                variant="outline"
                className="text-[11px] h-7 gap-1.5"
              >
                {runNowMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                Run sweep now
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
