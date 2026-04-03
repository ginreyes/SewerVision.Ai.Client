"use client";

import React, { useState, useMemo, useCallback, useRef } from "react";
import {
  ClipboardList, Clock, CheckCircle2, AlertTriangle, AlertCircle,
  Search, Loader2, Timer, XCircle, RefreshCw, MessageSquare, User,
  ChevronRight, Zap, Flame, Minus, GripVertical,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/components/providers/UserContext";
import { useAlert } from "@/components/providers/AlertProvider";
import EmptySewerComponent from "@/components/shared/EmptySewerComponent";
import { getUserName, formatRelativeTime, getInitials, getAvatarColor } from "@/components/customer-rep/constants";
import {
  useSupportAssignedTickets,
  useUpdateSupportTicket,
} from "@/hooks/useQueryHooks";
import TicketDetail from "@/components/customer-rep/tickets/TicketDetail";

// ── Constants ──
const SLA_HOURS = 24;
const COLUMNS = [
  { key: "open",        label: "Open",        accent: "border-t-amber-400",   headerBg: "bg-amber-50",   headerText: "text-amber-700",   dot: "bg-amber-400",   count: "bg-amber-100 text-amber-700" },
  { key: "in-progress", label: "In Progress", accent: "border-t-blue-400",    headerBg: "bg-blue-50",    headerText: "text-blue-700",    dot: "bg-blue-400",    count: "bg-blue-100 text-blue-700" },
  { key: "resolved",    label: "Resolved",    accent: "border-t-emerald-400", headerBg: "bg-emerald-50", headerText: "text-emerald-700", dot: "bg-emerald-400", count: "bg-emerald-100 text-emerald-700" },
  { key: "closed",      label: "Closed",      accent: "border-t-gray-300",    headerBg: "bg-gray-50",    headerText: "text-gray-500",    dot: "bg-gray-400",    count: "bg-gray-100 text-gray-500" },
];
const PRIORITY_ICONS = { high: Flame, medium: Minus, low: ChevronRight };
const PRIORITY_COLORS = {
  high: "text-red-500",
  medium: "text-amber-500",
  low: "text-gray-400",
};
const NEXT_STATUS = {
  "open": "in-progress",
  "in-progress": "resolved",
  "resolved": "closed",
};
const NEXT_LABEL = {
  "open": "Start",
  "in-progress": "Resolve",
  "resolved": "Close",
};

function getHoursAgo(dateStr) {
  if (!dateStr) return 0;
  return (Date.now() - new Date(dateStr).getTime()) / 3600000;
}

// ── Kanban Card ──
function KanbanCard({ ticket, onClick, onStatusChange, updating, onDragStart, onDragEnd, isDragging }) {
  const createdAt = ticket.created_at || ticket.createdAt;
  const hoursOpen = getHoursAgo(createdAt);
  const isOverdue = hoursOpen > SLA_HOURS && ticket.status !== "resolved" && ticket.status !== "closed";
  const PriorityIcon = PRIORITY_ICONS[ticket.priority] || Minus;
  const next = NEXT_STATUS[ticket.status];
  const nextLabel = NEXT_LABEL[ticket.status];
  const customerName = getUserName(ticket.customerId);

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("ticketId", ticket._id);
        e.dataTransfer.setData("fromStatus", ticket.status);
        onDragStart(ticket._id);
      }}
      onDragEnd={onDragEnd}
      className={`bg-white rounded-xl border shadow-sm transition-all group ${
        isDragging
          ? "opacity-40 scale-95 border-teal-300 shadow-none"
          : "border-gray-200 hover:shadow-md hover:border-teal-200"
      }`}
    >
      {/* Click area */}
      <div className="p-3.5 cursor-grab active:cursor-grabbing" onClick={() => onClick(ticket._id)}>
        {/* Priority + overdue */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <GripVertical className="w-3 h-3 text-gray-300 shrink-0" />
            <PriorityIcon className={`w-3.5 h-3.5 ${PRIORITY_COLORS[ticket.priority] || "text-gray-400"}`} />
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide capitalize">{ticket.priority}</span>
          </div>
          {isOverdue && (
            <span className="flex items-center gap-0.5 text-[10px] text-red-600 bg-red-50 border border-red-200 rounded-full px-1.5 py-0.5 font-semibold">
              <Timer className="w-2.5 h-2.5" /> Overdue
            </span>
          )}
        </div>

        {/* Subject */}
        <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 mb-2 group-hover:text-teal-700 transition-colors">
          {ticket.subject || "No subject"}
        </p>

        {/* Customer */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0 ${getAvatarColor(ticket.customerId?._id || ticket.customerId)}`}>
            {getInitials(ticket.customerId)}
          </div>
          <span className="text-xs text-gray-500 truncate">{customerName}</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-[10px] text-gray-400">
          <div className="flex items-center gap-2">
            <span className="bg-gray-100 rounded px-1.5 py-0.5 capitalize">{ticket.category}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-0.5"><MessageSquare className="w-3 h-3" />{ticket.responses?.length || 0}</span>
            <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{formatRelativeTime(createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Quick-action button */}
      {next && (
        <div className="border-t border-gray-100 px-3.5 py-2">
          <button
            disabled={updating === ticket._id}
            onClick={(e) => { e.stopPropagation(); onStatusChange(ticket._id, next); }}
            className="w-full text-xs font-medium text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-lg py-1.5 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {updating === ticket._id
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <ChevronRight className="w-3.5 h-3.5" />}
            {nextLabel}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main ──
export default function CustomerRepTasks() {
  const { userId } = useUser();
  const { showAlert } = useAlert();
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const [draggingId, setDraggingId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  const { data: assignedRaw, isLoading, refetch } = useSupportAssignedTickets(userId, { refetchInterval: 30000 });
  const updateMutation = useUpdateSupportTicket();

  const tickets = useMemo(() => Array.isArray(assignedRaw) ? assignedRaw : [], [assignedRaw]);

  const filtered = useMemo(() => tickets.filter((t) => {
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (t.subject || "").toLowerCase().includes(q) ||
        getUserName(t.customerId).toLowerCase().includes(q) ||
        (t.category || "").toLowerCase().includes(q);
    }
    return true;
  }), [tickets, priorityFilter, search]);

  const byStatus = useMemo(() => {
    const map = {};
    COLUMNS.forEach(c => { map[c.key] = []; });
    filtered.forEach(t => { if (map[t.status]) map[t.status].push(t); });
    return map;
  }, [filtered]);

  const stats = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter(t => t.status === "open").length,
    inProgress: tickets.filter(t => t.status === "in-progress").length,
    resolved: tickets.filter(t => t.status === "resolved").length,
    overdue: tickets.filter(t => {
      const h = getHoursAgo(t.created_at || t.createdAt);
      return h > SLA_HOURS && t.status !== "resolved" && t.status !== "closed";
    }).length,
  }), [tickets]);

  const handleStatusChange = useCallback(async (ticketId, newStatus) => {
    setUpdatingId(ticketId);
    try {
      await updateMutation.mutateAsync({ ticketId, status: newStatus });
      showAlert("Status updated", "success");
      refetch();
    } catch (e) {
      showAlert(e.message, "error");
    } finally {
      setUpdatingId(null);
    }
  }, [updateMutation, showAlert, refetch]);

  if (selectedTicketId) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-6">
        <TicketDetail ticketId={selectedTicketId} onBack={() => setSelectedTicketId(null)} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-4 gap-4 mt-8">
          {COLUMNS.map(c => (
            <div key={c.key} className="space-y-3">
              <div className="h-8 bg-gray-100 rounded-xl animate-pulse" />
              {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-md">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Queue</h1>
            <p className="text-sm text-gray-500">Tickets assigned to you — drag or click to advance status</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
        </Button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-5 divide-x divide-gray-100 bg-white border border-gray-200 rounded-xl shadow-sm mb-5">
        {[
          { label: "Total", value: stats.total, icon: ClipboardList, color: "text-teal-600", bg: "bg-teal-50" },
          { label: "Open", value: stats.open, icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "In Progress", value: stats.inProgress, icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Resolved", value: stats.resolved, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Overdue", value: stats.overdue, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-3 px-4 py-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.bg}`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search by subject, customer, category…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
        </div>
        <div className="flex items-center gap-1.5">
          {["all", "high", "medium", "low"].map(p => (
            <button key={p} onClick={() => setPriorityFilter(p)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors capitalize ${priorityFilter === p ? "bg-teal-600 text-white border-teal-600" : "bg-white text-gray-600 border-gray-200 hover:border-teal-300 hover:text-teal-600"}`}>
              {p === "all" ? "All Priority" : p}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban board */}
      {tickets.length === 0 ? (
        <div className="rounded-xl border border-gray-200 py-16">
          <EmptySewerComponent variant="no-projects" title="No assigned tickets" subtitle="Tickets assigned to you will appear here as task cards" size="md" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {COLUMNS.map(col => {
            const colTickets = byStatus[col.key] || [];
            const isDropTarget = dragOverCol === col.key;
            const draggingTicket = tickets.find(t => t._id === draggingId);
            const canDrop = draggingId && draggingTicket?.status !== col.key;

            return (
              <div
                key={col.key}
                onDragOver={(e) => {
                  if (!draggingId) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  setDragOverCol(col.key);
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    setDragOverCol(null);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const ticketId = e.dataTransfer.getData("ticketId");
                  const fromStatus = e.dataTransfer.getData("fromStatus");
                  setDragOverCol(null);
                  setDraggingId(null);
                  if (ticketId && fromStatus !== col.key) {
                    handleStatusChange(ticketId, col.key);
                  }
                }}
                className={`rounded-2xl border-t-4 ${col.accent} border flex flex-col min-h-[200px] transition-colors duration-150 ${
                  isDropTarget && canDrop
                    ? "bg-teal-50/60 border-teal-300 shadow-md"
                    : "bg-gray-50/80 border-gray-200"
                }`}
              >
                {/* Column header */}
                <div className={`flex items-center justify-between px-3.5 py-2.5 ${col.headerBg} rounded-t-xl border-b border-gray-200`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                    <span className={`text-xs font-bold uppercase tracking-wide ${col.headerText}`}>{col.label}</span>
                  </div>
                  <span className={`text-xs font-bold rounded-full px-2 py-0.5 ${col.count}`}>{colTickets.length}</span>
                </div>

                {/* Cards */}
                <div className="flex-1 p-2.5 space-y-2.5 overflow-y-auto max-h-[calc(100vh-320px)]">
                  {colTickets.length === 0 ? (
                    <div className={`flex flex-col items-center justify-center py-8 rounded-xl border-2 border-dashed transition-colors ${
                      isDropTarget && canDrop ? "border-teal-300 text-teal-400" : "border-transparent text-gray-300"
                    }`}>
                      <CheckCircle2 className="w-8 h-8 mb-2 opacity-40" />
                      <p className="text-xs">{isDropTarget && canDrop ? "Drop here" : "No tickets here"}</p>
                    </div>
                  ) : (
                    colTickets.map(ticket => (
                      <KanbanCard
                        key={ticket._id}
                        ticket={ticket}
                        onClick={setSelectedTicketId}
                        onStatusChange={handleStatusChange}
                        updating={updatingId}
                        onDragStart={setDraggingId}
                        onDragEnd={() => { setDraggingId(null); setDragOverCol(null); }}
                        isDragging={draggingId === ticket._id}
                      />
                    ))
                  )}
                  {/* Drop indicator when column has cards */}
                  {colTickets.length > 0 && isDropTarget && canDrop && (
                    <div className="h-1.5 rounded-full bg-teal-400 opacity-70 mx-1 animate-pulse" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
