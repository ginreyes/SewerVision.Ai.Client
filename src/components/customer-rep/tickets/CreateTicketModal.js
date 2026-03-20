"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  Loader2,
  Ticket,
  MessageSquareWarning,
  Search,
  User,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAlert } from "@/components/providers/AlertProvider";
import { useUser } from "@/components/providers/UserContext";
import {
  useCreateTicketFromComplaint,
  useComplaintsAll,
  useSupportTeam,
  useCreateSupportTicket,
} from "@/hooks/useQueryHooks";
import { getUserName } from "../constants";

const SEVERITY_BADGE = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-green-100 text-green-700 border-green-200",
};

const STATUS_BADGE = {
  new: "bg-amber-100 text-amber-700",
  investigating: "bg-blue-100 text-blue-700",
  "action-required": "bg-red-100 text-red-700",
  resolved: "bg-emerald-100 text-emerald-700",
  dismissed: "bg-gray-100 text-gray-600",
};

export default function CreateTicketModal({ open, onOpenChange, onCreated }) {
  const { userId } = useUser();
  const { showAlert } = useAlert();

  // Step: 1 = select complaint, 2 = fill ticket details
  const [step, setStep] = useState(1);
  const [complaintSearch, setComplaintSearch] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const [ticketForm, setTicketForm] = useState({
    subject: "",
    message: "",
    category: "complaint",
    priority: "medium",
    assignedTo: "",
  });

  // Fetch complaints and team
  const { data: complaintsData, isLoading: complaintsLoading } = useComplaintsAll(
    {},
    { enabled: open }
  );
  const { data: teamData } = useSupportTeam({ enabled: open });
  const createTicketFromComplaint = useCreateTicketFromComplaint();
  const createTicketDirect = useCreateSupportTicket();

  const complaints = useMemo(() => {
    const raw = complaintsData?.data ?? complaintsData;
    const arr = Array.isArray(raw) ? raw : [];
    // Only show complaints that don't already have a linked ticket
    return arr.filter((c) => !c.linkedTicketId);
  }, [complaintsData]);

  const filteredComplaints = useMemo(() => {
    if (!complaintSearch.trim()) return complaints;
    const q = complaintSearch.toLowerCase();
    return complaints.filter(
      (c) =>
        c.title?.toLowerCase().includes(q) ||
        c.customerName?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
    );
  }, [complaints, complaintSearch]);

  const team = useMemo(() => (Array.isArray(teamData) ? teamData : []), [teamData]);

  const handleSelectComplaint = useCallback((complaint) => {
    setSelectedComplaint(complaint);
    setTicketForm({
      subject: `[Complaint] ${complaint.title}`,
      message: `Complaint: ${complaint.title}\nCustomer: ${complaint.customerName}\nCategory: ${complaint.category}\nSeverity: ${complaint.severity}\n\n${complaint.description}`,
      category: "complaint",
      priority:
        complaint.severity === "critical" || complaint.severity === "high"
          ? "high"
          : "medium",
      assignedTo: complaint.assignedTo?._id || "",
    });
    setStep(2);
  }, []);

  const handleBack = useCallback(() => {
    setStep(1);
    setSelectedComplaint(null);
    setTicketForm({
      subject: "",
      message: "",
      category: "complaint",
      priority: "medium",
      assignedTo: "",
    });
  }, []);

  const handleCreate = useCallback(async () => {
    if (!ticketForm.subject.trim() || !ticketForm.message.trim()) {
      showAlert("Subject and message are required", "error");
      return;
    }

    try {
      if (selectedComplaint) {
        // Create ticket linked to complaint
        await createTicketFromComplaint.mutateAsync({
          complaintId: selectedComplaint._id,
          subject: ticketForm.subject.trim(),
          message: ticketForm.message.trim(),
          category: ticketForm.category,
          priority: ticketForm.priority,
          assignedTo: ticketForm.assignedTo || undefined,
        });
      } else {
        // Direct ticket creation (no complaint linked)
        await createTicketDirect.mutateAsync({
          subject: ticketForm.subject.trim(),
          message: ticketForm.message.trim(),
          category: ticketForm.category,
          priority: ticketForm.priority,
          customerId: userId,
          assignedTo: ticketForm.assignedTo || undefined,
        });
      }

      showAlert("Ticket created successfully", "success");
      // Reset
      setStep(1);
      setSelectedComplaint(null);
      setComplaintSearch("");
      setTicketForm({ subject: "", message: "", category: "complaint", priority: "medium", assignedTo: "" });
      onOpenChange(false);
      onCreated?.();
    } catch (e) {
      showAlert(e.message, "error");
    }
  }, [
    selectedComplaint,
    ticketForm,
    userId,
    createTicketFromComplaint,
    createTicketDirect,
    showAlert,
    onOpenChange,
    onCreated,
  ]);

  const isPending = createTicketFromComplaint.isPending || createTicketDirect.isPending;

  const handleClose = useCallback(() => {
    setStep(1);
    setSelectedComplaint(null);
    setComplaintSearch("");
    setTicketForm({ subject: "", message: "", category: "complaint", priority: "medium", assignedTo: "" });
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-teal-600" />
            {step === 1 ? "Select a Complaint" : "Create Ticket"}
          </DialogTitle>
        </DialogHeader>

        {/* ── STEP 1: Select Complaint ── */}
        {step === 1 && (
          <div className="flex-1 overflow-hidden flex flex-col">
            <p className="text-sm text-gray-500 mb-3">
              Select a customer complaint to create a ticket from, or skip to create a standalone ticket.
            </p>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search complaints by title, customer, or category..."
                value={complaintSearch}
                onChange={(e) => setComplaintSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>

            {/* Complaint List */}
            <div className="flex-1 overflow-y-auto space-y-2 min-h-0 max-h-[340px] pr-1">
              {complaintsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-5 h-5 animate-spin text-teal-500" />
                </div>
              ) : filteredComplaints.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquareWarning className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    {complaints.length === 0
                      ? "No unlinked complaints available"
                      : "No complaints match your search"}
                  </p>
                </div>
              ) : (
                filteredComplaints.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => handleSelectComplaint(c)}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-teal-300 hover:bg-teal-50/30 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-teal-700">
                          {c.title}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-1">
                          <User className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-600">{c.customerName}</span>
                          <span className="text-xs text-gray-400">
                            &bull; {c.customerEmail}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Badge
                            variant="outline"
                            className={`text-[10px] capitalize ${SEVERITY_BADGE[c.severity] || ""}`}
                          >
                            {c.severity}
                          </Badge>
                          <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded capitalize">
                            {c.category}
                          </span>
                          <Badge className={`text-[10px] capitalize ${STATUS_BADGE[c.status] || ""}`}>
                            {c.status?.replace("-", " ")}
                          </Badge>
                          {c.source && (
                            <span className="text-[10px] text-gray-400">
                              via {c.source?.replace("-", " ")}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-teal-500 shrink-0 mt-1" />
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Footer: Skip */}
            <div className="flex justify-end pt-3 border-t mt-3">
              <Button variant="outline" size="sm" onClick={handleClose}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Ticket Details ── */}
        {step === 2 && (
          <div className="flex-1 overflow-y-auto space-y-4 py-1">
            {/* Selected complaint summary */}
            {selectedComplaint && (
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquareWarning className="w-4 h-4 text-teal-600" />
                  <span className="text-xs font-semibold text-teal-700">Linked Complaint</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{selectedComplaint.title}</p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {selectedComplaint.customerName} &bull; {selectedComplaint.category} &bull;{" "}
                  {selectedComplaint.severity}
                </p>
              </div>
            )}

            {/* Subject */}
            <div>
              <Label className="text-xs font-medium text-gray-600">
                Subject <span className="text-red-500">*</span>
              </Label>
              <Input
                value={ticketForm.subject}
                onChange={(e) =>
                  setTicketForm((prev) => ({ ...prev, subject: e.target.value }))
                }
                placeholder="Ticket subject"
                className="mt-1"
              />
            </div>

            {/* Message */}
            <div>
              <Label className="text-xs font-medium text-gray-600">
                Message <span className="text-red-500">*</span>
              </Label>
              <Textarea
                value={ticketForm.message}
                onChange={(e) =>
                  setTicketForm((prev) => ({ ...prev, message: e.target.value }))
                }
                placeholder="Ticket description..."
                rows={5}
                className="mt-1"
              />
            </div>

            {/* Category & Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium text-gray-600">Category</Label>
                <Select
                  value={ticketForm.category}
                  onValueChange={(v) =>
                    setTicketForm((prev) => ({ ...prev, category: v }))
                  }
                >
                  <SelectTrigger className="mt-1 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="complaint">Complaint</SelectItem>
                    <SelectItem value="report">Report</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="account">Account</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-600">Priority</Label>
                <Select
                  value={ticketForm.priority}
                  onValueChange={(v) =>
                    setTicketForm((prev) => ({ ...prev, priority: v }))
                  }
                >
                  <SelectTrigger className="mt-1 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Assign To Customer-Rep */}
            <div>
              <Label className="text-xs font-medium text-gray-600">
                Assign to Customer Rep <span className="text-red-500">*</span>
              </Label>
              <Select
                value={ticketForm.assignedTo || "unassigned"}
                onValueChange={(v) =>
                  setTicketForm((prev) => ({
                    ...prev,
                    assignedTo: v === "unassigned" ? "" : v,
                  }))
                }
              >
                <SelectTrigger className="mt-1 h-9">
                  <SelectValue placeholder="Select a team member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {team.map((member) => (
                    <SelectItem key={member._id} value={member._id}>
                      {getUserName(member)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Footer */}
            <DialogFooter className="pt-2">
              <Button variant="outline" size="sm" onClick={handleBack}>
                Back
              </Button>
              <Button
                size="sm"
                className="bg-teal-600 hover:bg-teal-700"
                onClick={handleCreate}
                disabled={
                  !ticketForm.subject.trim() ||
                  !ticketForm.message.trim() ||
                  isPending
                }
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Ticket className="w-4 h-4 mr-1" />
                )}
                Create Ticket
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
