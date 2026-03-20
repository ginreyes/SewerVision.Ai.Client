"use client";

import React, { useState, useCallback } from "react";
import {
  ArrowLeft,
  User,
  Calendar,
  Loader2,
  Send,
  Ticket,
  Phone,
  Mail,
  StickyNote,
  LinkIcon,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAlert } from "@/components/providers/AlertProvider";
import { useUser } from "@/components/providers/UserContext";
import {
  useComplaint,
  useUpdateComplaint,
  useAddComplaintNote,
  useCreateTicketFromComplaint,
  useSupportTeam,
} from "@/hooks/useQueryHooks";
import { getUserName, getInitials, getAvatarColor } from "../constants";
import {
  STATUS_COLORS,
  SEVERITY_COLORS,
  CATEGORY_COLORS,
  SOURCE_COLORS,
  STATUS_ICONS,
} from "./constants";

export default function ComplaintDetail({ complaintId, onBack, onNavigateTicket }) {
  const { userId } = useUser();
  const { showAlert } = useAlert();
  const [noteText, setNoteText] = useState("");
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    message: "",
    category: "other",
    priority: "medium",
    assignedTo: "",
  });

  const { data: complaint, isLoading } = useComplaint(complaintId);
  const { data: teamData } = useSupportTeam();
  const updateMutation = useUpdateComplaint();
  const noteMutation = useAddComplaintNote();
  const createTicketMutation = useCreateTicketFromComplaint();

  const team = Array.isArray(teamData) ? teamData : [];

  const handleStatusChange = useCallback(
    async (newStatus) => {
      try {
        await updateMutation.mutateAsync({ complaintId, status: newStatus });
        showAlert("Status updated", "success");
      } catch (e) {
        showAlert(e.message, "error");
      }
    },
    [complaintId, updateMutation, showAlert]
  );

  const handleSeverityChange = useCallback(
    async (newSeverity) => {
      try {
        await updateMutation.mutateAsync({ complaintId, severity: newSeverity });
        showAlert("Severity updated", "success");
      } catch (e) {
        showAlert(e.message, "error");
      }
    },
    [complaintId, updateMutation, showAlert]
  );

  const handleAssignChange = useCallback(
    async (newAssignedTo) => {
      try {
        await updateMutation.mutateAsync({
          complaintId,
          assignedTo: newAssignedTo === "unassigned" ? null : newAssignedTo,
        });
        showAlert("Assignment updated", "success");
      } catch (e) {
        showAlert(e.message, "error");
      }
    },
    [complaintId, updateMutation, showAlert]
  );

  const handleAddNote = useCallback(async () => {
    if (!noteText.trim()) return;
    try {
      await noteMutation.mutateAsync({
        complaintId,
        text: noteText.trim(),
        authorId: userId,
      });
      setNoteText("");
      showAlert("Note added", "success");
    } catch (e) {
      showAlert(e.message, "error");
    }
  }, [complaintId, noteText, userId, noteMutation, showAlert]);

  const handleCreateTicket = useCallback(async () => {
    try {
      await createTicketMutation.mutateAsync({
        complaintId,
        subject: ticketForm.subject || undefined,
        message: ticketForm.message || undefined,
        category: ticketForm.category,
        priority: ticketForm.priority,
        assignedTo: ticketForm.assignedTo || undefined,
      });
      setShowCreateTicket(false);
      setTicketForm({ subject: "", message: "", category: "other", priority: "medium", assignedTo: "" });
      showAlert("Ticket created from complaint", "success");
    } catch (e) {
      showAlert(e.message, "error");
    }
  }, [complaintId, ticketForm, createTicketMutation, showAlert]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Complaint not found</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={onBack}>
          Go Back
        </Button>
      </div>
    );
  }

  const StatusIcon = STATUS_ICONS[complaint.status];
  const customer = complaint.customerId;
  const assignee = complaint.assignedTo;
  const linkedTicket = complaint.linkedTicketId;

  return (
    <div className="space-y-6">
      {/* Back */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Complaint Header */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2">{complaint.title}</h2>
              <div className="flex items-center gap-2 flex-wrap mb-4">
                <Badge className={`text-xs ${STATUS_COLORS[complaint.status]}`}>
                  {StatusIcon && <StatusIcon className="w-3 h-3 mr-1 inline" />}
                  {complaint.status?.replace("-", " ")}
                </Badge>
                <Badge variant="outline" className={`text-xs capitalize ${SEVERITY_COLORS[complaint.severity]}`}>
                  {complaint.severity}
                </Badge>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${CATEGORY_COLORS[complaint.category] || CATEGORY_COLORS.other}`}>
                  {complaint.category}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${SOURCE_COLORS[complaint.source] || SOURCE_COLORS.other}`}>
                  via {complaint.source?.replace("-", " ")}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-teal-600" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">{complaint.customerName}</span>
                    <span className="text-xs text-gray-400 ml-2">
                      {complaint.created_at ? new Date(complaint.created_at).toLocaleString() : ""}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{complaint.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Linked Ticket */}
          {linkedTicket && (
            <Card className="border-0 shadow-sm border-l-4 border-l-teal-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-teal-600" />
                    <span className="text-sm font-medium text-gray-900">Linked Ticket</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-teal-600 hover:text-teal-700"
                    onClick={() => onNavigateTicket?.(linkedTicket._id)}
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-1" />
                    View Ticket
                  </Button>
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                  <Ticket className="w-3.5 h-3.5" />
                  <span>{linkedTicket.subject || "Untitled"}</span>
                  {linkedTicket.status && (
                    <Badge variant="outline" className="text-[10px] capitalize">{linkedTicket.status}</Badge>
                  )}
                  {linkedTicket.priority && (
                    <Badge variant="outline" className="text-[10px] capitalize">{linkedTicket.priority}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {complaint.notes?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <StickyNote className="w-4 h-4" />
                Notes ({complaint.notes.length})
              </h3>
              {complaint.notes.map((note, idx) => {
                const author = note.authorId;
                const authorName = getUserName(author);
                return (
                  <Card key={idx} className="border-0 shadow-sm ml-4">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${getAvatarColor(author?._id)}`}>
                          {getInitials(author)}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{authorName}</span>
                        <span className="text-xs text-gray-400">
                          {note.timestamp ? new Date(note.timestamp).toLocaleString() : ""}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.text}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Add Note */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Add Note</h3>
              <Textarea
                placeholder="Add an internal note about this complaint..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={3}
                className="mb-3"
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={handleAddNote}
                  disabled={!noteText.trim() || noteMutation.isPending}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  {noteMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-1" />
                  )}
                  Add Note
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Actions */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!linkedTicket && (
                <Button
                  size="sm"
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  onClick={() => {
                    setTicketForm({
                      subject: `[Complaint] ${complaint.title}`,
                      message: `Complaint Reference ID: ${complaint._id}\n\n${complaint.description}`,
                      category: "complaint",
                      priority: complaint.severity === "critical" || complaint.severity === "high" ? "high" : "medium",
                      assignedTo: complaint.assignedTo?._id || "",
                    });
                    setShowCreateTicket(true);
                  }}
                >
                  <Ticket className="w-4 h-4 mr-1.5" />
                  Create Ticket
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Details */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Complaint Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Status</label>
                <Select value={complaint.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="action-required">Action Required</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="dismissed">Dismissed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Severity</label>
                <Select value={complaint.severity} onValueChange={handleSeverityChange}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Assigned To</label>
                <Select
                  value={assignee?._id || "unassigned"}
                  onValueChange={handleAssignChange}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
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
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Customer</label>
                <div className="p-2 bg-gray-50 rounded-lg space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <p className="text-sm font-medium text-gray-900">{complaint.customerName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <p className="text-xs text-gray-500">{complaint.customerEmail}</p>
                  </div>
                  {complaint.customerPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <p className="text-xs text-gray-500">{complaint.customerPhone}</p>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Category</label>
                <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${CATEGORY_COLORS[complaint.category] || CATEGORY_COLORS.other}`}>
                  {complaint.category}
                </span>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Source</label>
                <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${SOURCE_COLORS[complaint.source] || SOURCE_COLORS.other}`}>
                  {complaint.source?.replace("-", " ")}
                </span>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Created</label>
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Calendar className="w-3.5 h-3.5" />
                  {complaint.created_at ? new Date(complaint.created_at).toLocaleString() : "\u2014"}
                </div>
              </div>
              {complaint.resolvedAt && (
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Resolved</label>
                  <div className="flex items-center gap-1.5 text-sm text-emerald-600">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(complaint.resolvedAt).toLocaleString()}
                  </div>
                </div>
              )}
              {complaint.tags?.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Tags</label>
                  <div className="flex flex-wrap gap-1">
                    {complaint.tags.map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-[10px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Ticket Dialog */}
      <Dialog open={showCreateTicket} onOpenChange={setShowCreateTicket}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-teal-600" />
              Create Ticket from Complaint
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-medium text-gray-600">Subject</Label>
              <Input
                value={ticketForm.subject}
                onChange={(e) => setTicketForm((prev) => ({ ...prev, subject: e.target.value }))}
                placeholder="Ticket subject"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-600">Message</Label>
              <Textarea
                value={ticketForm.message}
                onChange={(e) => setTicketForm((prev) => ({ ...prev, message: e.target.value }))}
                placeholder="Ticket description"
                rows={4}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium text-gray-600">Category</Label>
                <Select
                  value={ticketForm.category}
                  onValueChange={(v) => setTicketForm((prev) => ({ ...prev, category: v }))}
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
                  onValueChange={(v) => setTicketForm((prev) => ({ ...prev, priority: v }))}
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
            <div>
              <Label className="text-xs font-medium text-gray-600">Assign To</Label>
              <Select
                value={ticketForm.assignedTo || "unassigned"}
                onValueChange={(v) =>
                  setTicketForm((prev) => ({ ...prev, assignedTo: v === "unassigned" ? "" : v }))
                }
              >
                <SelectTrigger className="mt-1 h-9">
                  <SelectValue />
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
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowCreateTicket(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-teal-600 hover:bg-teal-700"
              onClick={handleCreateTicket}
              disabled={createTicketMutation.isPending}
            >
              {createTicketMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Ticket className="w-4 h-4 mr-1" />
              )}
              Create Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
