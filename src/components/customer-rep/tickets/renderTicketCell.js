"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import { STATUS_COLORS, PRIORITY_COLORS, STATUS_ICONS } from "./constants";

export default function renderTicketCell(item, col) {
  if (col.key === "subject") {
    return <p className="text-sm font-medium text-gray-900 truncate">{item.subject}</p>;
  }
  if (col.key === "customer") {
    return <span className="text-sm text-gray-700">{item.customer}</span>;
  }
  if (col.key === "category") {
    return <Badge variant="outline" className="text-xs capitalize">{item.category}</Badge>;
  }
  if (col.key === "priority") {
    return (
      <Badge variant="outline" className={`text-xs capitalize ${PRIORITY_COLORS[item.priority] || ""}`}>
        {item.priority}
      </Badge>
    );
  }
  if (col.key === "status") {
    const Icon = STATUS_ICONS[item.status];
    return (
      <Badge className={`text-xs capitalize ${STATUS_COLORS[item.status] || ""}`}>
        {Icon && <Icon className="w-3 h-3 mr-1 inline" />}
        {item.status}
      </Badge>
    );
  }
  if (col.key === "assignedTo") {
    const isUnassigned = !item.assignedTo || item.assignedTo === "Unassigned";
    return (
      <div className="flex items-center gap-1.5">
        <User className={`w-3.5 h-3.5 ${isUnassigned ? "text-gray-300" : "text-teal-500"}`} />
        <span className={`text-sm ${isUnassigned ? "text-gray-400 italic" : "text-gray-700"}`}>
          {isUnassigned ? "Unassigned" : item.assignedTo}
        </span>
      </div>
    );
  }
  if (col.key === "responses") {
    return <span className="text-sm text-gray-600">{item.responses}</span>;
  }
  if (col.key === "createdAt") {
    if (!item.createdAt) return <span className="text-sm text-gray-400">&mdash;</span>;
    const d = new Date(item.createdAt);
    return (
      <div>
        <p className="text-sm text-gray-900">{d.toLocaleDateString()}</p>
        <p className="text-[11px] text-gray-400">{d.toLocaleTimeString()}</p>
      </div>
    );
  }
  return null;
}
