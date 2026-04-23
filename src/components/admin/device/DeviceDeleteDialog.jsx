"use client";

import React from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * DeviceDeleteDialog — confirmation modal for deleting a single device.
 * Informs the admin when a team leader is assigned so they know the
 * downstream effect.
 */
export default function DeviceDeleteDialog({
  device,
  open,
  onOpenChange,
  onConfirm,
  deleting,
}) {
  const tl = device?.teamLeader;
  const tlName =
    tl && typeof tl === "object"
      ? [tl.first_name, tl.last_name].filter(Boolean).join(" ") || tl.username || "Team Leader"
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <Trash2 className="w-5 h-5" />
            Delete device
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2">
              <p>
                This will permanently remove <strong>{device?.name}</strong> from
                Concertina. All data for this device will be removed. This action
                cannot be undone.
              </p>
              {tlName && (
                <div className="rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 p-3 text-sm text-amber-800 dark:text-amber-200">
                  <p className="font-medium">Assigned team leader</p>
                  <p className="mt-0.5">
                    This device is assigned to <strong>{tlName}</strong>. They will
                    no longer have access to this device after it is deleted.
                  </p>
                </div>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={deleting}>
            {deleting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            Delete device
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
