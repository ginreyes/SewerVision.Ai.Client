"use client";

import React, { useState } from "react";
import { ShieldCheck, ShieldX, Loader2, Trash2, User } from "lucide-react";
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
import { useReviewTicketDeletion } from "@/hooks/useQueryHooks";
import { getUserName } from "../constants";

export default function DeletionReviewModal({ open, onOpenChange, ticket, onApproved }) {
  const { userId } = useUser();
  const { showAlert } = useAlert();
  const [rejectionNote, setRejectionNote] = useState("");
  const reviewMutation = useReviewTicketDeletion();

  const deletionRequest = ticket?.deletionRequest;
  const requesterName = getUserName(deletionRequest?.requestedBy);

  const handleReview = async (action) => {
    try {
      const result = await reviewMutation.mutateAsync({
        ticketId: ticket._id,
        action,
        reviewedBy: userId,
        rejectionNote: action === "reject" ? rejectionNote.trim() : undefined,
      });
      if (action === "approve") {
        showAlert("Ticket deleted successfully.", "success");
        onOpenChange(false);
        onApproved?.();
      } else {
        showAlert("Deletion request rejected.", "success");
        onOpenChange(false);
      }
    } catch (e) {
      showAlert(e.message, "error");
    }
  };

  const handleClose = () => {
    setRejectionNote("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-500" />
            Review Deletion Request
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Ticket info */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-1">
            <p className="text-xs text-gray-500">Ticket</p>
            <p className="text-sm font-semibold text-gray-900 line-clamp-2">{ticket?.subject}</p>
          </div>

          {/* Requester + reason */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">Requested by</span>
              <span className="text-sm font-medium text-gray-800">{requesterName}</span>
            </div>
            {deletionRequest?.reason && (
              <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                <p className="text-xs font-medium text-red-700 mb-1">Reason</p>
                <p className="text-sm text-red-800">{deletionRequest.reason}</p>
              </div>
            )}
          </div>

          {/* Rejection note (shown when reviewing) */}
          <div>
            <Label className="text-xs font-medium text-gray-600">
              Rejection note <span className="text-gray-400">(optional — only needed if rejecting)</span>
            </Label>
            <Textarea
              value={rejectionNote}
              onChange={(e) => setRejectionNote(e.target.value)}
              placeholder="Explain why the deletion was rejected..."
              rows={2}
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" size="sm" onClick={handleClose} disabled={reviewMutation.isPending}>
            Cancel
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => handleReview("reject")}
            disabled={reviewMutation.isPending}
          >
            {reviewMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
            ) : (
              <ShieldX className="w-4 h-4 mr-1.5" />
            )}
            Reject
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleReview("approve")}
            disabled={reviewMutation.isPending}
          >
            {reviewMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
            ) : (
              <ShieldCheck className="w-4 h-4 mr-1.5" />
            )}
            Approve & Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
