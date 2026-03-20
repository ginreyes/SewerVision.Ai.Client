"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Search,
  Loader2,
  User,
  MessageSquare,
  Calendar,
  ArrowLeft,
  Send,
  Timer,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/components/providers/UserContext";
import { useAlert } from "@/components/providers/AlertProvider";
import EmptySewerComponent from "@/components/shared/EmptySewerComponent";
import { getUserName, formatRelativeTime, getInitials, getAvatarColor } from "@/components/customer-rep/constants";
import {
  useSupportAssignedTickets,
  useSupportTicket,
  useUpdateSupportTicket,
  useAddTicketResponse,
} from "@/hooks/useQueryHooks";

// ── Constants ──

const STATUS_ICONS = {
  open: AlertCircle,
  "in-progress": Clock,
  resolved: CheckCircle2,
  closed: XCircle,
};

const STATUS_COLORS = {
  open: "bg-amber-100 text-amber-700 border-amber-200",
  "in-progress": "bg-blue-100 text-blue-700 border-blue-200",
  resolved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  closed: "bg-gray-100 text-gray-600 border-gray-200",
};

const STATUS_CARD_ACCENT = {
  open: "border-l-amber-400",
  "in-progress": "border-l-blue-400",
  resolved: "border-l-emerald-400",
  closed: "border-l-gray-300",
};

const PRIORITY_COLORS = {
  low: "bg-green-100 text-green-700 border-green-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  high: "bg-red-100 text-red-700 border-red-200",
};

const SLA_HOURS = 24;

function getHoursAgo(dateStr) {
  if (!dateStr) return 0;
  return (Date.now() - new Date(dateStr).getTime()) / 3600000;
}

// ── Filter pills ──
const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "in-progress", label: "In Progress" },
  { key: "resolved", label: "Resolved" },
  { key: "closed", label: "Closed" },
];

// ── Stat Mini ──
function StatMini({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-lg font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

// ── Ticket Card ──
function TicketCard({ ticket, onClick }) {
  const StatusIcon = STATUS_ICONS[ticket.status] || AlertCircle;
  const createdAt = ticket.created_at || ticket.createdAt;
  const hoursOpen = getHoursAgo(createdAt);
  const isOverdue =
    hoursOpen > SLA_HOURS &&
    ticket.status !== "resolved" &&
    ticket.status !== "closed";
  const responseCount = ticket.responses?.length || 0;
  const customerName = getUserName(ticket.customerId);

  return (
    <div
      onClick={() => onClick(ticket._id)}
      className={`group relative bg-white rounded-xl border border-l-4 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md hover:border-teal-300 ${STATUS_CARD_ACCENT[ticket.status] || "border-l-gray-300"}`}
    >
      <div className="p-4">
        {/* Top row: subject + priority */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-teal-700 transition-colors">
            {ticket.subject || "No subject"}
          </h3>
          <Badge
            variant="outline"
            className={`text-[10px] capitalize shrink-0 ${PRIORITY_COLORS[ticket.priority] || PRIORITY_COLORS.medium}`}
          >
            {ticket.priority}
          </Badge>
        </div>

        {/* Customer */}
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${getAvatarColor(ticket.customerId?._id || ticket.customerId)}`}>
            {getInitials(ticket.customerId)}
          </div>
          <span className="text-xs text-gray-600">{customerName}</span>
          {ticket.category && (
            <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded capitalize ml-auto">
              {ticket.category}
            </span>
          )}
        </div>

        {/* Bottom row: status + meta */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge className={`text-[10px] capitalize ${STATUS_COLORS[ticket.status] || ""}`}>
              <StatusIcon className="w-3 h-3 mr-1 inline" />
              {ticket.status?.replace("-", " ")}
            </Badge>
            {isOverdue && (
              <span className="text-[10px] text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                <Timer className="w-3 h-3" />
                SLA
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-[11px] text-gray-400">
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {responseCount}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatRelativeTime(createdAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Ticket Detail View ──
function TaskTicketDetail({ ticketId, onBack }) {
  const { userId } = useUser();
  const { showAlert } = useAlert();
  const [replyText, setReplyText] = useState("");

  const { data: ticket, isLoading } = useSupportTicket(ticketId);
  const updateMutation = useUpdateSupportTicket();
  const responseMutation = useAddTicketResponse();

  const customer = ticket?.customerId;
  const customerName = getUserName(customer);

  const handleStatusChange = useCallback(
    async (newStatus) => {
      try {
        await updateMutation.mutateAsync({ ticketId, status: newStatus });
        showAlert("Status updated", "success");
      } catch (e) {
        showAlert(e.message, "error");
      }
    },
    [ticketId, updateMutation, showAlert]
  );

  const handlePriorityChange = useCallback(
    async (newPriority) => {
      try {
        await updateMutation.mutateAsync({ ticketId, priority: newPriority });
        showAlert("Priority updated", "success");
      } catch (e) {
        showAlert(e.message, "error");
      }
    },
    [ticketId, updateMutation, showAlert]
  );

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
        <Button variant="outline" size="sm" className="mt-3" onClick={onBack}>
          Go Back
        </Button>
      </div>
    );
  }

  const StatusIcon = STATUS_ICONS[ticket.status] || AlertCircle;

  return (
    <div className="space-y-6">
      {/* Back */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to My Tasks
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
                  <StatusIcon className="w-3 h-3 mr-1 inline" />
                  {ticket.status?.replace("-", " ")}
                </Badge>
                <Badge className={`${PRIORITY_COLORS[ticket.priority]} text-xs`}>
                  {ticket.priority} priority
                </Badge>
                <Badge variant="outline" className="text-xs capitalize">
                  {ticket.category}
                </Badge>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-teal-600" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">{customerName}</span>
                    <span className="text-xs text-gray-400 ml-2">
                      {ticket.created_at
                        ? new Date(ticket.created_at).toLocaleString()
                        : ""}
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
                const isSupport =
                  resp.senderRole === "support" || resp.senderRole === "admin";
                return (
                  <Card
                    key={idx}
                    className={`border-0 shadow-sm ${isSupport ? "ml-8" : ""}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center ${
                            isSupport ? "bg-blue-100" : "bg-teal-100"
                          }`}
                        >
                          <User
                            className={`w-3.5 h-3.5 ${
                              isSupport ? "text-blue-600" : "text-teal-600"
                            }`}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {senderName}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {resp.senderRole}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {resp.timestamp
                            ? new Date(resp.timestamp).toLocaleString()
                            : ""}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {resp.text}
                      </p>
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
                <Textarea
                  placeholder="Type your response..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={3}
                  className="mb-3"
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={handleReply}
                    disabled={!replyText.trim() || responseMutation.isPending}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    {responseMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-1" />
                    )}
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
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  Status
                </label>
                <Select value={ticket.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  Priority
                </label>
                <Select value={ticket.priority} onValueChange={handlePriorityChange}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  Customer
                </label>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{customerName}</p>
                    <p className="text-xs text-gray-400">{customer?.email || ""}</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  Category
                </label>
                <Badge variant="outline" className="capitalize">
                  {ticket.category}
                </Badge>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  Created
                </label>
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Calendar className="w-3.5 h-3.5" />
                  {ticket.created_at
                    ? new Date(ticket.created_at).toLocaleString()
                    : "\u2014"}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  Responses
                </label>
                <span className="text-sm font-medium text-gray-900">
                  {ticket.responses?.length || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ──

export default function CustomerRepTasks() {
  const { userId } = useUser();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  const {
    data: assignedRaw,
    isLoading,
    refetch,
  } = useSupportAssignedTickets(userId, {
    refetchInterval: 30000,
  });

  const assignedTickets = useMemo(() => {
    return Array.isArray(assignedRaw) ? assignedRaw : [];
  }, [assignedRaw]);

  // Filter tickets
  const filteredTickets = useMemo(() => {
    return assignedTickets.filter((ticket) => {
      // Status filter
      if (statusFilter !== "all" && ticket.status !== statusFilter) return false;
      // Search
      if (search) {
        const q = search.toLowerCase();
        const subject = (ticket.subject || "").toLowerCase();
        const customer = getUserName(ticket.customerId).toLowerCase();
        const category = (ticket.category || "").toLowerCase();
        if (!subject.includes(q) && !customer.includes(q) && !category.includes(q))
          return false;
      }
      return true;
    });
  }, [assignedTickets, statusFilter, search]);

  // Stats
  const stats = useMemo(() => {
    const total = assignedTickets.length;
    const open = assignedTickets.filter((t) => t.status === "open").length;
    const inProgress = assignedTickets.filter((t) => t.status === "in-progress").length;
    const resolved = assignedTickets.filter((t) => t.status === "resolved").length;
    const overdue = assignedTickets.filter((t) => {
      const hours = getHoursAgo(t.created_at || t.createdAt);
      return hours > SLA_HOURS && t.status !== "resolved" && t.status !== "closed";
    }).length;
    return { total, open, inProgress, resolved, overdue };
  }, [assignedTickets]);

  // ── Detail view ──
  if (selectedTicketId) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <TaskTicketDetail
            ticketId={selectedTicketId}
            onBack={() => setSelectedTicketId(null)}
          />
        </div>
      </div>
    );
  }

  // ── Skeleton ──
  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse" />
            <div>
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-56 bg-gray-100 rounded animate-pulse mt-1.5" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-36 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* ── Header ── */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-md">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">My Tasks</h1>
              <p className="text-sm text-gray-500">
                Tickets assigned to you &mdash; click a card to view details
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* ── Stats Bar ── */}
        <Card className="border-gray-200 shadow-sm mb-6">
          <CardContent className="p-0">
            <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-gray-100">
              <StatMini
                icon={ClipboardList}
                label="Total"
                value={stats.total}
                color="bg-teal-100 text-teal-600"
              />
              <StatMini
                icon={AlertCircle}
                label="Open"
                value={stats.open}
                color="bg-amber-100 text-amber-600"
              />
              <StatMini
                icon={Clock}
                label="In Progress"
                value={stats.inProgress}
                color="bg-blue-100 text-blue-600"
              />
              <StatMini
                icon={CheckCircle2}
                label="Resolved"
                value={stats.resolved}
                color="bg-emerald-100 text-emerald-600"
              />
              <StatMini
                icon={AlertTriangle}
                label="Overdue"
                value={stats.overdue}
                color="bg-red-100 text-red-600"
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Filters ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>

          {/* Status pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                  statusFilter === f.key
                    ? "bg-teal-600 text-white border-teal-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-teal-300 hover:text-teal-600"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Ticket Cards Grid ── */}
        {assignedTickets.length === 0 ? (
          <div className="rounded-xl border border-gray-200 shadow-sm py-16 bg-gray-50">
            <EmptySewerComponent
              variant="no-projects"
              title="No assigned tickets"
              subtitle="Tickets assigned to you will appear here as task cards"
              size="md"
            />
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="rounded-xl border border-gray-200 shadow-sm py-16 bg-gray-50">
            <EmptySewerComponent
              variant="no-projects"
              title="No matching tickets"
              subtitle="Try adjusting your search or filters"
              size="md"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTickets.map((ticket) => (
              <TicketCard
                key={ticket._id}
                ticket={ticket}
                onClick={setSelectedTicketId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
