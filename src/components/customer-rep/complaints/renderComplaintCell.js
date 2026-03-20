"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  STATUS_COLORS,
  SEVERITY_COLORS,
  CATEGORY_COLORS,
  SOURCE_COLORS,
  STATUS_ICONS,
} from "./constants";

export default function renderComplaintCell(item, col) {
  if (col.key === "title") {
    return (
      <div>
        <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
        {item.hasTicket && (
          <span className="text-[10px] text-teal-600 font-medium">Ticket linked</span>
        )}
      </div>
    );
  }
  if (col.key === "customer") {
    return <span className="text-sm text-gray-700">{item.customer}</span>;
  }
  if (col.key === "category") {
    return (
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS.other}`}>
        {item.category}
      </span>
    );
  }
  if (col.key === "severity") {
    return (
      <Badge variant="outline" className={`text-xs capitalize ${SEVERITY_COLORS[item.severity] || ""}`}>
        {item.severity}
      </Badge>
    );
  }
  if (col.key === "status") {
    const Icon = STATUS_ICONS[item.status];
    return (
      <Badge className={`text-xs capitalize ${STATUS_COLORS[item.status] || ""}`}>
        {Icon && <Icon className="w-3 h-3 mr-1 inline" />}
        {item.status?.replace("-", " ")}
      </Badge>
    );
  }
  if (col.key === "source") {
    return (
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${SOURCE_COLORS[item.source] || SOURCE_COLORS.other}`}>
        {item.source?.replace("-", " ")}
      </span>
    );
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
