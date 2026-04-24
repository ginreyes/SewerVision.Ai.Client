"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Users as UsersIcon,
  Sparkles,
} from "lucide-react";
import permissionLevelApi from "@/data/permissionLevelApi";
import { getRoleLabel, getRoleTheme } from "@/lib/roleThemes";

/**
 * Preview + apply dialog for the Permission Module resync action.
 *
 * Life cycle:
 *   1. Opens → fetches a dry-run preview from the backend (no writes).
 *   2. Shows per-role diff: which modules will be added to which default level,
 *      and how many users will inherit the change.
 *   3. Admin clicks "Apply Resync" → calls the same endpoint WITHOUT dryRun,
 *      which seeds SecurityModule and backfills default permission levels.
 *   4. Shows the success summary, then closes + notifies the parent to refetch.
 */
export default function ResyncModulesModal({ open, onClose, onApplied }) {
  const [preview, setPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(null);
  const [error, setError] = useState(null);

  // Fetch preview whenever the modal opens
  useEffect(() => {
    if (!open) {
      // Reset state when dialog closes so next open starts fresh
      setPreview(null);
      setApplied(null);
      setError(null);
      setApplying(false);
      return;
    }
    let cancelled = false;
    const run = async () => {
      setLoadingPreview(true);
      setError(null);
      try {
        const res = await permissionLevelApi.resyncModules({ dryRun: true });
        const body = res?.data ?? res;
        if (cancelled) return;
        if (!res?.ok || !body?.ok) {
          setError(body?.message || "Failed to load preview.");
          return;
        }
        setPreview(body);
      } catch (err) {
        if (!cancelled) setError(err?.message || "Failed to load preview.");
      } finally {
        if (!cancelled) setLoadingPreview(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const handleApply = async () => {
    setApplying(true);
    setError(null);
    try {
      const res = await permissionLevelApi.resyncModules({ dryRun: false });
      const body = res?.data ?? res;
      if (!res?.ok || !body?.ok) {
        setError(body?.message || "Resync failed.");
        return;
      }
      setApplied(body);
      onApplied?.();
    } catch (err) {
      setError(err?.message || "Resync failed.");
    } finally {
      setApplying(false);
    }
  };

  // Derived summary values shown in the header strip
  const summary = (applied || preview)?.summary;
  const rolePlans = (applied || preview)?.rolePlans || [];
  const rolesWithChanges = rolePlans.filter((p) => p.missingModules?.length > 0);
  const rolesWithNoDefault = rolePlans.filter((p) => !p.defaultLevelId);
  const nothingToDo = !loadingPreview && preview && summary?.totalMissingModules === 0 && !applied;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose?.(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            Resync Permission Modules
          </DialogTitle>
          <DialogDescription>
            Aligns the permission system with the modules registered in code.
            New modules get added to each role&apos;s <strong>default</strong> permission level only —
            custom restricted levels stay untouched so your access rules are preserved.
          </DialogDescription>
        </DialogHeader>

        {/* Body states ─────────────────────────────────────────────────── */}
        {loadingPreview && (
          <div className="flex items-center justify-center py-10 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading preview…
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 px-3 py-2 rounded-md border border-red-200 bg-red-50 text-red-800 text-sm">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!loadingPreview && preview && (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
            {/* Summary strip */}
            <div className="grid grid-cols-3 gap-3">
              <SummaryCell
                label="Roles affected"
                value={applied ? rolePlans.filter((p) => p.addedModules?.length > 0).length : rolesWithChanges.length}
                icon={UsersIcon}
                color="blue"
              />
              <SummaryCell
                label="Modules to add"
                value={applied ? rolePlans.reduce((s, p) => s + (p.addedModules?.length || 0), 0) : summary?.totalMissingModules || 0}
                icon={Sparkles}
                color="emerald"
              />
              <SummaryCell
                label="SecurityModule seeds"
                value={summary ? (summary.securityModulesCreated + summary.securityModulesUpdated) : 0}
                icon={RefreshCw}
                color="purple"
              />
            </div>

            {/* Applied success banner */}
            {applied && (
              <div className="flex items-start gap-2 px-3 py-2 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-900 text-sm">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Resync applied successfully.</p>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    {rolePlans.reduce((s, p) => s + (p.addedModules?.length || 0), 0)} module
                    {rolePlans.reduce((s, p) => s + (p.addedModules?.length || 0), 0) === 1 ? "" : "s"} added
                    across {rolePlans.filter((p) => p.addedModules?.length > 0).length} role{rolePlans.filter((p) => p.addedModules?.length > 0).length === 1 ? "" : "s"}.
                    Users assigned to those default levels now have updated access.
                  </p>
                </div>
              </div>
            )}

            {/* Nothing to do */}
            {nothingToDo && (
              <div className="flex items-start gap-2 px-3 py-2 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-900 text-sm">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Everything is already in sync.</p>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Every default permission level already includes all registered modules for its role.
                  </p>
                </div>
              </div>
            )}

            {/* Missing default levels warning */}
            {rolesWithNoDefault.length > 0 && !applied && (
              <div className="flex items-start gap-2 px-3 py-2 rounded-md border border-amber-200 bg-amber-50 text-amber-900 text-sm">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">
                    {rolesWithNoDefault.length} role{rolesWithNoDefault.length === 1 ? "" : "s"} have no default level yet:
                  </p>
                  <p className="text-xs mt-0.5">
                    {rolesWithNoDefault.map((r) => getRoleLabel(r.role)).join(", ")}. Resync only touches default
                    permission levels — create one per role first, then resync again.
                  </p>
                </div>
              </div>
            )}

            {/* Per-role diff */}
            <div className="space-y-2">
              {rolePlans.map((plan) => {
                const shown = applied ? plan.addedModules : plan.missingModules;
                const hasAny = (shown?.length || 0) > 0;
                if (!hasAny && plan.defaultLevelId) return null; // skip already-synced default levels

                const theme = getRoleTheme(plan.role);
                return (
                  <div
                    key={plan.role}
                    className="rounded-lg border border-gray-200 bg-white p-3 dark:bg-gray-800/40 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Badge className={`${theme?.badge || "bg-gray-100 text-gray-700"} text-xs`}>
                          {getRoleLabel(plan.role)}
                        </Badge>
                        {plan.defaultLevelName ? (
                          <span className="text-xs text-gray-500">
                            default level: <span className="font-medium text-gray-700">{plan.defaultLevelName}</span>
                          </span>
                        ) : (
                          <span className="text-xs text-amber-700">no default level</span>
                        )}
                      </div>
                      {plan.defaultLevelId && (
                        <span className="text-[11px] text-gray-500 flex items-center gap-1">
                          <UsersIcon className="w-3 h-3" />
                          {plan.usersAffected} user{plan.usersAffected === 1 ? "" : "s"} {applied ? "updated" : "will update"}
                        </span>
                      )}
                    </div>

                    {hasAny ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {shown.map((key) => (
                          <Badge
                            key={key}
                            variant="outline"
                            className="border-emerald-200 bg-emerald-50 text-emerald-700 text-[11px] dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300"
                          >
                            + {key}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-gray-400">No modules needed — already in sync.</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Help note */}
            {!applied && summary?.totalMissingModules > 0 && (
              <div className="flex items-start gap-2 px-3 py-2 rounded-md border border-blue-200 bg-blue-50 text-blue-900 text-xs">
                <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>
                  Users assigned to non-default (restricted) permission levels are NOT changed. If you want
                  them to see new modules, edit those levels manually.
                </span>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={applying}>
            {applied ? "Close" : "Cancel"}
          </Button>
          {!applied && preview && summary?.totalMissingModules > 0 && (
            <Button
              onClick={handleApply}
              disabled={applying || loadingPreview}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {applying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Applying…
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Apply Resync
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SummaryCell({ label, value, icon: Icon, color }) {
  const palette = {
    blue: { bg: "bg-blue-50", text: "text-blue-700", icon: "text-blue-500" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-700", icon: "text-emerald-500" },
    purple: { bg: "bg-purple-50", text: "text-purple-700", icon: "text-purple-500" },
  }[color] || { bg: "bg-gray-50", text: "text-gray-700", icon: "text-gray-500" };
  return (
    <div className={`p-3 rounded-lg ${palette.bg} border border-transparent`}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className={`w-3.5 h-3.5 ${palette.icon}`} />
        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-600">{label}</p>
      </div>
      <p className={`text-xl font-bold ${palette.text}`}>{value ?? 0}</p>
    </div>
  );
}
