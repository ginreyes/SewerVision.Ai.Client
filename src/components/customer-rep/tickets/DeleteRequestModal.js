"use client";

import React, { useState } from "react";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAlert } from "@/components/providers/AlertProvider";
import { useUser } from "@/components/providers/UserContext";
import { useRequestTicketDeletion } from "@/hooks/useQueryHooks";

export default function DeleteRequestModal({ open, onOpenChange, ticket }) {
  const { userId } = useUser();
  const { showAlert } = useAlert();
  const [reason, setReason] = useState("");
  const requestMutation = useRequestTicketDeletion();

  const handleSubmit = async () => {
    try {
      await requestMutation.mutateAsync({
        ticketId: ticket._id,
        requestedBy: userId,
        reason: reason.trim(),
      });
      showAlert("Deletion request submitted. A team leader will review it.", "success");
      setReason("");
      onOpenChange(false);
    } catch (e) {
      showAlert(e.message, "error");
    }
  };

  const handleClose = () => {
    setReason("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" />
            Request Ticket Deletion
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Requires approval</p>
              <p className="text-xs text-amber-700 mt-0.5">
                This request will be sent to a team leader for review. The ticket will not be deleted until approved.
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1">Ticket</p>
            <p className="text-sm font-medium text-gray-900 line-clamp-2">{ticket?.subject}</p>
          </div>

          <div>
            <Label className="text-xs font-medium text-gray-600">
              Reason for deletion <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this ticket should be deleted..."
              rows={3}
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleSubmit}
            disabled={!reason.trim() || requestMutation.isPending}
          >
            {requestMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-1.5" />
            )}
            Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
