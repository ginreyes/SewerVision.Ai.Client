"use client";

import React, { useState, useCallback } from "react";
import {
  Send,
  ArrowLeft,
  User,
  Calendar,
  Loader2,
  Reply,
} from "lucide-react";
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
} from "@/hooks/useQueryHooks";
import { getUserName } from "../constants";
import { STATUS_COLORS, PRIORITY_COLORS, STATUS_ICONS } from "./constants";

export default function TicketDetail({ ticketId, onBack }) {
  const { userId } = useUser();
  const { showAlert } = useAlert();
  const [replyText, setReplyText] = useState("");

  const { data: ticket, isLoading } = useSupportTicket(ticketId);
  const updateMutation = useUpdateSupportTicket();
  const responseMutation = useAddTicketResponse();

  const customer = ticket?.customerId;
  const customerName = getUserName(customer);

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
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Thread */}
        <div className="lg:col-span-2 space-y-4">
          {/* Ticket Header */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2">{ticket.subject}</h2>
              <div className="flex items-center gap-2 flex-wrap mb-4">
                <Badge className={`${STATUS_COLORS[ticket.status]} text-xs`}>
                  {StatusIcon && <StatusIcon className="w-3 h-3 mr-1 inline" />}
                  {ticket.status}
                </Badge>
                <Badge className={`${PRIORITY_COLORS[ticket.priority]} text-xs`}>
                  {ticket.priority} priority
                </Badge>
                <Badge variant="outline" className="text-xs capitalize">{ticket.category}</Badge>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-teal-600" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">{customerName}</span>
                    <span className="text-xs text-gray-400 ml-2">
                      {ticket.created_at ? new Date(ticket.created_at).toLocaleString() : ""}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{ticket.message}</p>
              </div>
            </CardContent>
          </Card>

          {/* Responses */}
          {ticket.responses?.length > 0 && (
            <div className="space-y-3">
              {ticket.responses.map((resp, idx) => {
                const sender = resp.senderId;
                const senderName = getUserName(sender);
                const isSupport = resp.senderRole === "support" || resp.senderRole === "admin";
                return (
                  <Card key={idx} className={`border-0 shadow-sm ${isSupport ? "ml-8" : ""}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isSupport ? "bg-blue-100" : "bg-teal-100"}`}>
                          <User className={`w-3.5 h-3.5 ${isSupport ? "text-blue-600" : "text-teal-600"}`} />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{senderName}</span>
                        <Badge variant="outline" className="text-[10px]">{resp.senderRole}</Badge>
                        <span className="text-xs text-gray-400">
                          {resp.timestamp ? new Date(resp.timestamp).toLocaleString() : ""}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{resp.text}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Reply Box */}
          {ticket.status !== "closed" && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <Textarea placeholder="Type your response..." value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={3} className="mb-3" />
                <div className="flex justify-end">
                  <Button size="sm" onClick={handleReply} disabled={!replyText.trim() || responseMutation.isPending} className="bg-teal-600 hover:bg-teal-700">
                    {responseMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}
                    Send Reply
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Status</label>
                <Select value={ticket.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Priority</label>
                <Select value={ticket.priority} onValueChange={handlePriorityChange}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Customer</label>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{customerName}</p>
                    <p className="text-xs text-gray-400">{customer?.email || ""}</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Category</label>
                <Badge variant="outline" className="capitalize">{ticket.category}</Badge>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Created</label>
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Calendar className="w-3.5 h-3.5" />
                  {ticket.created_at ? new Date(ticket.created_at).toLocaleString() : "—"}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Responses</label>
                <span className="text-sm font-medium text-gray-900">{ticket.responses?.length || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
