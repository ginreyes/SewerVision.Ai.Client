"use client";

import React, { useState, useCallback } from "react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
function fileProxyUrl(filename) {
  if (!filename) return "";
  return `${BACKEND}/api/complaints/file?file=${encodeURIComponent(filename)}`;
}
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
  Tag,
  Globe,
  Clock,
  CheckCircle2,
  Paperclip,
  FileText,
  Download,
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
import { UserAvatar } from "@/components/ui/UserAvatar";

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

  const handleStatusChange = useCallback(async (newStatus) => {
    try {
      await updateMutation.mutateAsync({ complaintId, status: newStatus });
      showAlert("Status updated", "success");
    } catch (e) {
      showAlert(e.message, "error");
    }
  }, [complaintId, updateMutation, showAlert]);

  const handleSeverityChange = useCallback(async (newSeverity) => {
    try {
      await updateMutation.mutateAsync({ complaintId, severity: newSeverity });
      showAlert("Severity updated", "success");
    } catch (e) {
      showAlert(e.message, "error");
    }
  }, [complaintId, updateMutation, showAlert]);

  const handleAssignChange = useCallback(async (newAssignedTo) => {
    try {
      await updateMutation.mutateAsync({
        complaintId,
        assignedTo: newAssignedTo === "unassigned" ? null : newAssignedTo,
      });
      showAlert("Assignment updated", "success");
    } catch (e) {
      showAlert(e.message, "error");
    }
  }, [complaintId, updateMutation, showAlert]);

  const handleAddNote = useCallback(async () => {
    if (!noteText.trim()) return;
    try {
      await noteMutation.mutateAsync({ complaintId, text: noteText.trim(), authorId: userId });
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
        <Button variant="outline" size="sm" className="mt-3" onClick={onBack}>Go Back</Button>
      </div>
    );
  }

  const StatusIcon = STATUS_ICONS[complaint.status];
  const assignee = complaint.assignedTo;
  const linkedTicket = complaint.linkedTicketId;

  // Customer initials for avatar fallback
  const customerInitial = (complaint.customerName?.charAt(0) || "?").toUpperCase();

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
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Complaint title + badges */}
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-rose-400 to-orange-400" />
            <CardContent className="p-5">
              <h2 className="text-lg font-bold text-gray-900 mb-2 leading-snug">{complaint.title}</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`text-xs gap-1 ${STATUS_COLORS[complaint.status]}`}>
                  {StatusIcon && <StatusIcon className="w-3 h-3" />}
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
            </CardContent>
          </Card>

          {/* Complaint description — chat bubble style */}
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="bg-gray-50/60 border-b border-gray-100 px-5 py-3 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Complaint Description</span>
            </div>
            <CardContent className="p-5">
              <div className="flex items-end gap-3">
                {/* Customer avatar — initials only since complaints use customerName string */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${getAvatarColor(complaint.customerEmail)}`}>
                  {customerInitial}
                </div>
                <div className="flex-1 max-w-[88%]">
                  <div className="flex items-baseline gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-gray-700">{complaint.customerName}</span>
                    <span className="text-[10px] text-gray-400">
                      {complaint.created_at ? new Date(complaint.created_at).toLocaleString() : ""}
                    </span>
                    <Badge variant="outline" className="text-[10px] py-0 h-4">customer</Badge>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-xs">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{complaint.description}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attachments */}
          {complaint.attachments?.length > 0 && (
            <Card className="border-0 shadow-sm overflow-hidden">
              <div className="bg-rose-50/60 border-b border-rose-100 px-5 py-3 flex items-center gap-2">
                <Paperclip className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Attachments</span>
                <span className="ml-auto text-xs text-gray-400">{complaint.attachments.length} file{complaint.attachments.length !== 1 ? "s" : ""}</span>
              </div>
              <CardContent className="p-4">
                {/* Image grid */}
                {complaint.attachments.some(a => a.mimetype?.startsWith("image/")) && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {complaint.attachments
                      .filter(a => a.mimetype?.startsWith("image/"))
                      .map((att, i) => (
                        <a
                          key={i}
                          href={fileProxyUrl(att.filename)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group block"
                        >
                          <img
                            src={fileProxyUrl(att.filename)}
                            alt={att.originalname || att.filename}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <ExternalLink className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </a>
                      ))}
                  </div>
                )}
                {/* Non-image files */}
                {complaint.attachments
                  .filter(a => !a.mimetype?.startsWith("image/"))
                  .map((att, i) => {
                    const isVideo = att.mimetype?.startsWith("video/");
                    const isPdf = att.mimetype === "application/pdf";
                    return (
                      <a
                        key={i}
                        href={fileProxyUrl(att.filename)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-rose-200 hover:bg-rose-50/40 transition-colors mb-2 group"
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isPdf ? "bg-red-100" : isVideo ? "bg-purple-100" : "bg-gray-100"}`}>
                          <FileText className={`w-4 h-4 ${isPdf ? "text-red-500" : isVideo ? "text-purple-500" : "text-gray-500"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-800 truncate">{att.originalname || att.filename}</p>
                          <p className="text-[10px] text-gray-400">
                            {att.size ? `${(att.size / 1024).toFixed(1)} KB` : ""} · {att.mimetype}
                          </p>
                        </div>
                        <Download className="w-3.5 h-3.5 text-gray-300 group-hover:text-rose-400 transition-colors shrink-0" />
                      </a>
                    );
                  })}
              </CardContent>
            </Card>
          )}

          {/* Linked Ticket */}
          {linkedTicket && (
            <Card className="border-0 shadow-sm overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center">
                      <LinkIcon className="w-3.5 h-3.5 text-teal-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">Linked Ticket</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 h-7 text-xs"
                    onClick={() => onNavigateTicket?.(linkedTicket._id)}
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-1" />
                    View Ticket
                  </Button>
                </div>
                <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-teal-50 rounded-lg border border-teal-100 text-sm text-gray-700">
                  <Ticket className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                  <span className="flex-1 truncate">{linkedTicket.subject || "Untitled"}</span>
                  {linkedTicket.status && (
                    <Badge variant="outline" className="text-[10px] capitalize shrink-0">{linkedTicket.status}</Badge>
                  )}
                  {linkedTicket.priority && (
                    <Badge variant="outline" className="text-[10px] capitalize shrink-0">{linkedTicket.priority}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes thread */}
          {complaint.notes?.length > 0 && (
            <Card className="border-0 shadow-sm overflow-hidden">
              <div className="bg-amber-50/60 border-b border-amber-100 px-5 py-3 flex items-center gap-2">
                <StickyNote className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Internal Notes</span>
                <span className="ml-auto text-xs text-gray-400">{complaint.notes.length} note{complaint.notes.length !== 1 ? "s" : ""}</span>
              </div>
              <CardContent className="p-5 space-y-4">
                {complaint.notes.map((note, idx) => {
                  const author = note.authorId;
                  const authorName = getUserName(author);
                  return (
                    <div key={idx} className="flex items-end gap-3 flex-row-reverse">
                      <UserAvatar
                        src={author?.avatar}
                        fallback={(authorName?.charAt(0) || "?").toUpperCase()}
                        size="sm"
                      />
                      <div className="flex-1 max-w-[88%] flex flex-col items-end">
                        <div className="flex items-baseline gap-2 mb-1.5 flex-row-reverse">
                          <span className="text-xs font-semibold text-amber-700">{authorName}</span>
                          <span className="text-[10px] text-gray-400">
                            {note.timestamp ? new Date(note.timestamp).toLocaleString() : ""}
                          </span>
                          <Badge className="text-[10px] py-0 h-4 bg-amber-100 text-amber-700 border-amber-200">note</Badge>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl rounded-tr-sm px-4 py-3">
                          <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{note.text}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Add Note box */}
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <StickyNote className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <Textarea
                    placeholder="Add an internal note about this complaint..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    rows={3}
                    className="resize-none border-gray-200 focus:border-amber-400 focus:ring-amber-500/20 rounded-xl text-sm"
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      size="sm"
                      onClick={handleAddNote}
                      disabled={!noteText.trim() || noteMutation.isPending}
                      className="bg-amber-500 hover:bg-amber-600 text-white rounded-lg"
                    >
                      {noteMutation.isPending
                        ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                        : <Send className="w-4 h-4 mr-1.5" />}
                      Add Note
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">

          {/* Create Ticket action */}
          {!linkedTicket && (
            <Card className="border-0 shadow-sm overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-teal-400 to-cyan-500" />
              <CardContent className="p-4">
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
                  Create Ticket from Complaint
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Details card */}
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-rose-400 to-orange-400" />
            <CardHeader className="pb-3 pt-4">
              <CardTitle className="text-sm font-semibold text-gray-700">Complaint Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-0">

              {/* Status + Severity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5 block">Status</label>
                  <Select value={complaint.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
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
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5 block">Severity</label>
                  <Select value={complaint.severity} onValueChange={handleSeverityChange}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Customer info */}
              <div>
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Customer</label>
                <div className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${getAvatarColor(complaint.customerEmail)}`}>
                    {customerInitial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{complaint.customerName}</p>
                    <p className="text-xs text-gray-400 truncate">{complaint.customerEmail}</p>
                    {complaint.customerPhone && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />{complaint.customerPhone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Assigned To */}
              <div>
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Assigned To</label>
                <Select value={assignee?._id || "unassigned"} onValueChange={handleAssignChange}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {team.map((member) => (
                      <SelectItem key={member._id} value={member._id}>
                        {getUserName(member)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {assignee && (
                  <div className="flex items-center gap-3 mt-2 p-2.5 bg-teal-50 rounded-xl border border-teal-100">
                    <UserAvatar
                      src={assignee?.avatar}
                      fallback={(getUserName(assignee)?.charAt(0) || "?").toUpperCase()}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{getUserName(assignee)}</p>
                      <p className="text-xs text-teal-600 truncate">{assignee?.email || ""}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100" />

              {/* Meta */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Tag className="w-3.5 h-3.5" /> Category
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${CATEGORY_COLORS[complaint.category] || CATEGORY_COLORS.other}`}>
                    {complaint.category}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Globe className="w-3.5 h-3.5" /> Source
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${SOURCE_COLORS[complaint.source] || SOURCE_COLORS.other}`}>
                    {complaint.source?.replace("-", " ")}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 shrink-0">
                    <Clock className="w-3.5 h-3.5" /> Created
                  </div>
                  <span className="text-xs text-gray-600 text-right">
                    {complaint.created_at ? new Date(complaint.created_at).toLocaleString() : "—"}
                  </span>
                </div>
                {complaint.resolvedAt && (
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                    </div>
                    <span className="text-xs text-emerald-600 text-right">
                      {new Date(complaint.resolvedAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {complaint.tags?.length > 0 && (
                <>
                  <div className="border-t border-gray-100" />
                  <div>
                    <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Tags</label>
                    <div className="flex flex-wrap gap-1">
                      {complaint.tags.map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-[10px]">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </>
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
                <Select value={ticketForm.category} onValueChange={(v) => setTicketForm((prev) => ({ ...prev, category: v }))}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
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
                <Select value={ticketForm.priority} onValueChange={(v) => setTicketForm((prev) => ({ ...prev, priority: v }))}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
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
                onValueChange={(v) => setTicketForm((prev) => ({ ...prev, assignedTo: v === "unassigned" ? "" : v }))}
              >
                <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {team.map((member) => (
                    <SelectItem key={member._id} value={member._id}>{getUserName(member)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowCreateTicket(false)}>Cancel</Button>
            <Button
              size="sm"
              className="bg-teal-600 hover:bg-teal-700"
              onClick={handleCreateTicket}
              disabled={createTicketMutation.isPending}
            >
              {createTicketMutation.isPending
                ? <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                : <Ticket className="w-4 h-4 mr-1" />}
              Create Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
