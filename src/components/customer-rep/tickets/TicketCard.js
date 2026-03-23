"use client";

import React from "react";
import { MessageSquare, Clock, User, AlertCircle, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { STATUS_COLORS, PRIORITY_COLORS, STATUS_ICONS } from "./constants";

function timeAgo(date) {
  if (!date) return "";
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function TicketCard({ ticket, onClick }) {
  const StatusIcon = STATUS_ICONS[ticket.status] || AlertCircle;
  const hasPendingDeletion = ticket.deletionRequest?.status === "pending";

  return (
    <div
      onClick={() => onClick?.(ticket)}
      className={`bg-white rounded-xl border hover:shadow-md transition-all cursor-pointer group overflow-hidden ${
        hasPendingDeletion
          ? "border-amber-300 hover:border-amber-400"
          : "border-gray-200 hover:border-teal-300"
      }`}
    >
      {/* Status accent bar */}
      <div
        className={`h-1 ${
          ticket.status === "open"
            ? "bg-amber-400"
            : ticket.status === "in-progress"
            ? "bg-blue-400"
            : ticket.status === "resolved"
            ? "bg-emerald-400"
            : "bg-gray-300"
        }`}
      />

      <div className="p-4 space-y-3">
        {/* Header: Subject + Priority */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-teal-700 transition-colors">
            {ticket.subject}
          </h3>
          <Badge variant="outline" className={`text-[10px] shrink-0 capitalize ${PRIORITY_COLORS[ticket.priority] || ""}`}>
            {ticket.priority}
          </Badge>
        </div>

        {/* Customer */}
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs text-gray-600 truncate">{ticket.customer}</span>
        </div>

        {/* Status + Category */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={`text-[10px] capitalize gap-1 ${STATUS_COLORS[ticket.status] || ""}`}>
            <StatusIcon className="w-3 h-3" />
            {ticket.status?.replace("-", " ")}
          </Badge>
          <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded capitalize">
            {ticket.category}
          </span>
          {hasPendingDeletion && (
            <Badge className="text-[10px] bg-amber-100 text-amber-700 border border-amber-200 gap-1">
              <Trash2 className="w-2.5 h-2.5" />
              Deletion Pending
            </Badge>
          )}
        </div>

        {/* Footer: Assigned, Replies, Time */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 truncate">
            <User className="w-3 h-3" />
            <span className="truncate">{ticket.assignedTo || "Unassigned"}</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <MessageSquare className="w-3 h-3" />
              {ticket.responses}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              {timeAgo(ticket.createdAt)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
