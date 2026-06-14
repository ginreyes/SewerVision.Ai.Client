"use client";
import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ROLE_BADGE_CLASSES } from "@/lib/roleThemes";
import { api } from "@/lib/helper";
import { useAlert } from "@/components/providers/AlertProvider";

// June 16 — admin inline role change with impact-confirm dialog.
// Drops into the admin/users table row; calls GET /role-impact for the
// preview and PATCH /role on confirm. All audit-log writes happen server-side.

const ROLE_OPTIONS = [
  "admin",
  "user",
  "operator",
  "qc-technician",
  "customer-rep",
  "viewer",
  "customer",
];

export default function InlineRoleSelect({ user, onChanged }) {
  const [pending, setPending] = useState(null); // target role string when dialog open
  const [impact, setImpact] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadingImpact, setLoadingImpact] = useState(false);
  const { showAlert } = useAlert();

  async function handlePick(nextRole) {
    if (!nextRole || nextRole === user.role) return;
    setPending(nextRole);
    setLoadingImpact(true);
    setImpact(null);
    try {
      const res = await api(
        `/api/users/${user._id}/role-impact?role=${encodeURIComponent(nextRole)}`,
      );
      setImpact(res?.data || null);
    } catch (e) {
      showAlert?.({ kind: "error", message: "Could not load impact preview" });
    } finally {
      setLoadingImpact(false);
    }
  }

  async function handleConfirm() {
    if (!pending) return;
    setSaving(true);
    try {
      const res = await api(`/api/users/${user._id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: pending }),
      });
      if (res?.status === "success") {
        showAlert?.({ kind: "success", message: `Role changed to ${pending}` });
        onChanged?.({ ...user, role: pending });
        setPending(null);
        setImpact(null);
      } else {
        showAlert?.({ kind: "error", message: res?.message || "Role change failed" });
      }
    } catch (e) {
      showAlert?.({ kind: "error", message: "Role change failed" });
    } finally {
      setSaving(false);
    }
  }

  const blocked = impact && impact.allowed === false;

  return (
    <>
      <Select value={user.role} onValueChange={handlePick}>
        <SelectTrigger className={`h-8 w-[160px] text-xs ${ROLE_BADGE_CLASSES[user.role] || ""}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ROLE_OPTIONS.map((r) => (
            <SelectItem key={r} value={r} className="text-xs">
              {r}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={!!pending} onOpenChange={(open) => !open && setPending(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Change role: {user.first_name || user.username} to <span className="capitalize">{pending}</span>
            </DialogTitle>
            <DialogDescription>
              {loadingImpact
                ? "Computing impact…"
                : blocked
                  ? `Blocked: ${impact.reason}`
                  : "Review the impact before confirming."}
            </DialogDescription>
          </DialogHeader>

          {impact && !loadingImpact ? (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-3 gap-2">
                <Stat label="Projects" value={impact.impact?.losesAccessTo?.projects ?? 0} />
                <Stat label="Devices" value={impact.impact?.losesAccessTo?.devices ?? 0} />
                <Stat label="Managed" value={impact.impact?.losesAccessTo?.managedMembers ?? 0} />
              </div>
              {(impact.impact?.warnings || []).length > 0 && (
                <ul className="space-y-1 rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                  {impact.impact.warnings.map((w, i) => (
                    <li key={i}>• {w}</li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setPending(null)} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={saving || blocked || loadingImpact}
              className={blocked ? "bg-rose-500 hover:bg-rose-600" : ""}
            >
              {saving ? "Saving…" : `Confirm ${pending}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded border bg-white p-2 text-center">
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-xs uppercase tracking-wide text-zinc-500">{label}</div>
    </div>
  );
}
