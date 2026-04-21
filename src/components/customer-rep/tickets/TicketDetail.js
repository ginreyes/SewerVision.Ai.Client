"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  Send,
  ArrowLeft,
  User,
  Calendar,
  Loader2,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  Tag,
  MessageSquare,
  Clock,
  Eye,
  FileText,
  Download,
  Zap,
  Search,
  X,
  Globe,
  Lock,
} from "lucide-react";
import { BACKEND_URL } from "@/lib/config";

function fileProxyUrl(filename) {
  if (!filename) return "";
  return `${BACKEND_URL}/api/complaints/file?file=${encodeURIComponent(filename)}`;
}
function formatBytes(b) {
  if (!b) return "";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function AttachmentRow({ attachments, dark = false }) {
  if (!attachments?.length) return null;
  const images = attachments.filter(a => a.mimetype?.startsWith("image/"));
  const files = attachments.filter(a => !a.mimetype?.startsWith("image/"));
  return (
    <div className="mt-2 space-y-1.5">
      {images.length > 0 && (
        <div className={`grid gap-1.5 ${images.length === 1 ? "grid-cols-1 max-w-[180px]" : "grid-cols-2"}`}>
          {images.map((att, i) => (
            <a key={i} href={fileProxyUrl(att.filename)} target="_blank" rel="noopener noreferrer"
              className="relative rounded-xl overflow-hidden group block aspect-square border border-black/10">
              <img src={fileProxyUrl(att.filename)} alt={att.originalname || att.filename}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                <Eye className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </a>
          ))}
        </div>
      )}
      {files.map((att, i) => (
        <a key={i} href={fileProxyUrl(att.filename)} target="_blank" rel="noopener noreferrer"
          className={`flex items-center gap-2 px-3 py-2 rounded-xl group transition-colors ${dark ? "bg-black/10 hover:bg-black/20 border border-black/10" : "bg-gray-100 hover:bg-gray-200 border border-gray-200"}`}>
          <FileText className="w-4 h-4 shrink-0 opacity-70" />
          <span className="text-xs font-medium truncate flex-1">{att.originalname || att.filename}</span>
          {att.size ? <span className="text-[10px] opacity-60 shrink-0">{formatBytes(att.size)}</span> : null}
          <Download className="w-3 h-3 opacity-40 group-hover:opacity-90 shrink-0" />
        </a>
      ))}
    </div>
  );
}
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
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
  useSupportTicket,
  useUpdateSupportTicket,
  useAddTicketResponse,
  useCannedResponses,
} from "@/hooks/useQueryHooks";
import cannedResponseApi from "@/data/cannedResponseApi";
import { Input } from "@/components/ui/input";
import { getUserName } from "../constants";
import { STATUS_COLORS, PRIORITY_COLORS, STATUS_ICONS } from "./constants";
import DeleteRequestModal from "./DeleteRequestModal";
import DeletionReviewModal from "./DeletionReviewModal";
import { UserAvatar } from "@/components/ui/UserAvatar";

export default function TicketDetail({ ticketId, onBack }) {
  const { userId, userData } = useUser();
  const { showAlert } = useAlert();
  const [replyText, setReplyText] = useState("");
  const [showDeleteRequest, setShowDeleteRequest] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [templateSearch, setTemplateSearch] = useState("");
  const textareaRef = useRef(null);

  const { data: ticket, isLoading } = useSupportTicket(ticketId);
  const updateMutation = useUpdateSupportTicket();
  const responseMutation = useAddTicketResponse();
  const { data: cannedResponses } = useCannedResponses(userId);

  // Team leader = customer-rep with managedMembers
  const isTeamLeader = Array.isArray(userData?.managedMembers) && userData.managedMembers.length > 0;

  const customer = ticket?.customerId;
  const customerName = getUserName(customer);
  const deletionRequest = ticket?.deletionRequest;
  const hasPendingDeletion = deletionRequest?.status === "pending";

  const handleStatusChange = useCallback(async (newStatus) => {
    try {
      await updateMutation.mutateAsync({ ticketId, status: newStatus });
      showAlert("Status updated", "success");
    } catch (e) {
      showAlert(e.message, "error");
    }
  }, [ticketId, updateMutation, showAlert]);

  const handlePriorityChange = useCallback(async (newPriority) => {
    try {
      await updateMutation.mutateAsync({ ticketId, priority: newPriority });
      showAlert("Priority updated", "success");
    } catch (e) {
      showAlert(e.message, "error");
    }
  }, [ticketId, updateMutation, showAlert]);

  const handleReply = useCallback(async () => {
    if (!replyText.trim()) return;
    try {
      await responseMutation.mutateAsync({
        ticketId,
        text: replyText.trim(),
        senderId: userId,
        senderRole: "support",
      });
      setReplyText("");
      showAlert("Reply sent", "success");
    } catch (e) {
      showAlert(e.message, "error");
    }
  }, [ticketId, replyText, userId, responseMutation, showAlert]);

  const handleInsertTemplate = useCallback(async (template) => {
    const customer = ticket?.customerId;
    const agentName = getUserName(userData) || "Support";
    const resolved = (template.body || "")
      .replace(/\{\{customerName\}\}/g, getUserName(customer) || "Customer")
      .replace(/\{\{ticketId\}\}/g, ticketId || "")
      .replace(/\{\{agentName\}\}/g, agentName)
      .replace(/\{\{date\}\}/g, new Date().toLocaleDateString());
    setReplyText(resolved);
    setShowTemplatePicker(false);
    setTemplateSearch("");
    setTimeout(() => textareaRef.current?.focus(), 50);
    try { await cannedResponseApi.incrementUsage(template._id); } catch (_) {}
  }, [ticket, userData, ticketId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Ticket not found</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={onBack}>Go Back</Button>
      </div>
    );
  }

  const StatusIcon = STATUS_ICONS[ticket.status];

  return (
    <div className="space-y-6">
      {/* Back */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>

        {/* Deletion actions */}
        <div className="flex items-center gap-2">
          {hasPendingDeletion && isTeamLeader && (
            <Button
              size="sm"
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
              onClick={() => setShowReview(true)}
            >
              <ShieldCheck className="w-4 h-4 mr-1.5" />
              Review Deletion
            </Button>
          )}
          {!hasPendingDeletion && deletionRequest?.status !== "rejected" && (
            <Button
              size="sm"
              variant="outline"
              className="border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300"
              onClick={() => setShowDeleteRequest(true)}
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Request Deletion
            </Button>
          )}
        </div>
      </div>

      {/* Pending deletion banner */}
      {hasPendingDeletion && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800">Deletion Requested</p>
            <p className="text-xs text-amber-700 mt-0.5">
              {deletionRequest?.reason
                ? `Reason: ${deletionRequest.reason}`
                : "A deletion request is pending team leader approval."}
            </p>
          </div>
          {isTeamLeader && (
            <Button
              size="sm"
              variant="outline"
              className="shrink-0 border-amber-300 text-amber-700 hover:bg-amber-100 text-xs h-7"
              onClick={() => setShowReview(true)}
            >
              Review
            </Button>
          )}
        </div>
      )}

      {/* Rejected deletion note */}
      {deletionRequest?.status === "rejected" && (
        <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-600">Previous deletion request was rejected</p>
            {deletionRequest.rejectionNote && (
              <p className="text-xs text-gray-500 mt-0.5">Note: {deletionRequest.rejectionNote}</p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chat Thread */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Ticket subject + badges */}
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-teal-400 to-cyan-500" />
            <CardContent className="p-5">
              <h2 className="text-lg font-bold text-gray-900 mb-2 leading-snug">{ticket.subject}</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`${STATUS_COLORS[ticket.status]} text-xs gap-1`}>
                  {StatusIcon && <StatusIcon className="w-3 h-3" />}
                  {ticket.status}
                </Badge>
                <Badge className={`${PRIORITY_COLORS[ticket.priority]} text-xs`}>
                  {ticket.priority} priority
                </Badge>
                <Badge variant="outline" className="text-xs capitalize">{ticket.category}</Badge>
                {hasPendingDeletion && (
                  <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-200 gap-1">
                    <AlertTriangle className="w-3 h-3" /> Deletion Pending
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chat messages */}
          <Card className="border-0 shadow-sm overflow-hidden">
            <div className="bg-gray-50/60 border-b border-gray-100 px-5 py-3 flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-teal-500" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Conversation</span>
              <span className="ml-auto text-xs text-gray-400">{(ticket.responses?.length || 0) + 1} messages</span>
            </div>

            <CardContent className="p-5 space-y-5">
              {/* Opening message — customer, left aligned */}
              <div className="flex items-end gap-3">
                <UserAvatar
                  src={customer?.avatar}
                  fallback={(customerName?.charAt(0) || "?").toUpperCase()}
                  size="sm"
                />
                <div className="flex-1 max-w-[85%]">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-700">{customerName}</span>
                    <span className="text-[10px] text-gray-400">
                      {ticket.created_at ? new Date(ticket.created_at).toLocaleString() : ""}
                    </span>
                    <Badge variant="outline" className="text-[10px] py-0 h-4">customer</Badge>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-xs">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{ticket.message}</p>
                  </div>
                </div>
              </div>

              {/* Responses */}
              {ticket.responses?.map((resp, idx) => {
                const sender = resp.senderId;
                const senderName = getUserName(sender);
                const isSupport = resp.senderRole === "support" || resp.senderRole === "admin";

                if (isSupport) {
                  // Support — right aligned
                  return (
                    <div key={idx} className="flex items-end gap-3 flex-row-reverse">
                      <UserAvatar
                        src={sender?.avatar}
                        fallback={(senderName?.charAt(0) || "?").toUpperCase()}
                        size="sm"
                      />
                      <div className="flex-1 max-w-[85%] flex flex-col items-end">
                        <div className="flex items-baseline gap-2 mb-1 flex-row-reverse">
                          <span className="text-xs font-semibold text-teal-700">{senderName}</span>
                          <span className="text-[10px] text-gray-400">
                            {resp.timestamp ? new Date(resp.timestamp).toLocaleString() : ""}
                          </span>
                          <Badge className="text-[10px] py-0 h-4 bg-teal-100 text-teal-700 border-teal-200">support</Badge>
                        </div>
                        <div className="bg-teal-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-xs">
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{resp.text}</p>
                          <AttachmentRow attachments={resp.attachments} dark />
                        </div>
                      </div>
                    </div>
                  );
                }

                // Customer response — left aligned
                return (
                  <div key={idx} className="flex items-end gap-3">
                    <UserAvatar
                      src={sender?.avatar}
                      fallback={(senderName?.charAt(0) || "?").toUpperCase()}
                      size="sm"
                    />
                    <div className="flex-1 max-w-[85%]">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-xs font-semibold text-gray-700">{senderName}</span>
                        <span className="text-[10px] text-gray-400">
                          {resp.timestamp ? new Date(resp.timestamp).toLocaleString() : ""}
                        </span>
                        <Badge variant="outline" className="text-[10px] py-0 h-4">customer</Badge>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-xs">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{resp.text}</p>
                        <AttachmentRow attachments={resp.attachments} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Reply Box */}
          {ticket.status !== "closed" && (
            <Card className="border-0 shadow-sm overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <UserAvatar
                    src={userData?.avatar}
                    fallback={(getUserName(userData)?.charAt(0) || "Y").toUpperCase()}
                    size="sm"
                  />
                  <div className="flex-1">
                    {/* Template picker popover */}
                    {showTemplatePicker && (
                      <div className="mb-2 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden z-10">
                        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50">
                          <Zap className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                          <span className="text-xs font-semibold text-gray-600">Templates</span>
                          <div className="flex-1 relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                            <Input
                              autoFocus
                              value={templateSearch}
                              onChange={(e) => setTemplateSearch(e.target.value)}
                              placeholder="Search templates…"
                              className="h-6 pl-6 text-xs border-gray-200 rounded-md"
                            />
                          </div>
                          <button onClick={() => { setShowTemplatePicker(false); setTemplateSearch(""); }}
                            className="text-gray-400 hover:text-gray-600 ml-1">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="max-h-56 overflow-y-auto divide-y divide-gray-50">
                          {(() => {
                            const list = (Array.isArray(cannedResponses) ? cannedResponses : [])
                              .filter(t => !templateSearch ||
                                t.title.toLowerCase().includes(templateSearch.toLowerCase()) ||
                                (t.shortcut && t.shortcut.includes(templateSearch.toLowerCase())) ||
                                t.body.toLowerCase().includes(templateSearch.toLowerCase())
                              );
                            if (!list.length) return (
                              <div className="px-4 py-5 text-center text-xs text-gray-400">
                                No templates found. <a href="/customer-rep/templates" className="text-teal-600 hover:underline">Manage templates →</a>
                              </div>
                            );
                            return list.map(t => (
                              <button
                                key={t._id}
                                type="button"
                                onClick={() => handleInsertTemplate(t)}
                                className="w-full text-left px-4 py-2.5 hover:bg-teal-50 transition-colors group"
                              >
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-xs font-semibold text-gray-800 group-hover:text-teal-700 truncate flex-1">{t.title}</span>
                                  {t.shortcut && (
                                    <span className="text-[10px] font-mono text-teal-600 bg-teal-50 border border-teal-200 rounded px-1.5 shrink-0">/{t.shortcut}</span>
                                  )}
                                  {t.isShared
                                    ? <Globe className="w-3 h-3 text-gray-400 shrink-0" />
                                    : <Lock className="w-3 h-3 text-gray-400 shrink-0" />}
                                </div>
                                <p className="text-[11px] text-gray-400 truncate leading-relaxed">{t.body}</p>
                              </button>
                            ));
                          })()}
                        </div>
                      </div>
                    )}

                    <Textarea
                      ref={textareaRef}
                      placeholder="Write a reply… or click ⚡ for templates"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={3}
                      className="resize-none border-gray-200 focus:border-teal-400 focus:ring-teal-500/20 rounded-xl text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleReply();
                      }}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        onClick={() => setShowTemplatePicker(v => !v)}
                        className={`h-8 px-2.5 rounded-lg gap-1.5 text-xs ${showTemplatePicker ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'text-gray-400 hover:text-teal-600 hover:bg-teal-50'}`}
                      >
                        <Zap className="w-3.5 h-3.5" />
                        Templates
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleReply}
                        disabled={!replyText.trim() || responseMutation.isPending}
                        className="bg-teal-600 hover:bg-teal-700 rounded-lg"
                      >
                        {responseMutation.isPending
                          ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                          : <Send className="w-4 h-4 mr-1.5" />}
                        Send Reply
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="border-0 shadow-sm overflow-hidden">
            {/* Sidebar header accent */}
            <div className="h-1 bg-gradient-to-r from-teal-400 to-cyan-500" />
            <CardHeader className="pb-3 pt-4">
              <CardTitle className="text-sm font-semibold text-gray-700">Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-0">

              {/* Status + Priority row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5 block">Status</label>
                  <Select value={ticket.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5 block">Priority</label>
                  <Select value={ticket.priority} onValueChange={handlePriorityChange}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Customer */}
              <div>
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Customer</label>
                <div className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                  <UserAvatar
                    src={customer?.avatar}
                    fallback={(customerName?.charAt(0) || "?").toUpperCase()}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{customerName}</p>
                    <p className="text-xs text-gray-400 truncate">{customer?.email || ""}</p>
                  </div>
                </div>
              </div>

              {/* Assigned To */}
              <div>
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Assigned To</label>
                {ticket.assignedTo ? (
                  <div className="flex items-center gap-3 p-2.5 bg-teal-50 rounded-xl border border-teal-100">
                    <UserAvatar
                      src={ticket.assignedTo?.avatar}
                      fallback={(getUserName(ticket.assignedTo)?.charAt(0) || "?").toUpperCase()}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{getUserName(ticket.assignedTo)}</p>
                      <p className="text-xs text-teal-600 truncate">{ticket.assignedTo?.email || ""}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-sm text-gray-400 italic">Unassigned</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100" />

              {/* Meta info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Tag className="w-3.5 h-3.5" />
                    Category
                  </div>
                  <Badge variant="outline" className="capitalize text-xs">{ticket.category}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Responses
                  </div>
                  <span className="text-xs font-semibold text-gray-700">{ticket.responses?.length || 0}</span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                    Created
                  </div>
                  <span className="text-xs text-gray-600 text-right">
                    {ticket.created_at ? new Date(ticket.created_at).toLocaleString() : "—"}
                  </span>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <DeleteRequestModal
        open={showDeleteRequest}
        onOpenChange={setShowDeleteRequest}
        ticket={ticket}
      />
      <DeletionReviewModal
        open={showReview}
        onOpenChange={setShowReview}
        ticket={ticket}
        onApproved={onBack}
      />
    </div>
  );
}
