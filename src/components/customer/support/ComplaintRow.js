"use client";

import { AlertCircle, ChevronRight, MessageSquareWarning, Paperclip, Ticket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  COMPLAINT_STATUS_COLORS,
  COMPLAINT_STATUS_ICONS,
  COMPLAINT_STATUS_LABELS,
  SEVERITY_COLORS,
} from "@/app/customer/support/constants";

export default function ComplaintRow({ c, gridMode, onClick }) {
  const StatusIcon = COMPLAINT_STATUS_ICONS[c.status] || AlertCircle;
  const hasAttachments = c.attachments?.length > 0;

  if (gridMode) {
    return (
      <Card
        className="border shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-amber-200 group"
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <MessageSquareWarning className="w-4 h-4 text-amber-600" />
            </div>
            <Badge className={`${COMPLAINT_STATUS_COLORS[c.status]} text-[10px] shrink-0`}>
              <StatusIcon className="w-2.5 h-2.5 mr-0.5 inline" />
              {COMPLAINT_STATUS_LABELS[c.status] || c.status}
            </Badge>
          </div>
          <p className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-amber-700 transition-colors">
            {c.title}
          </p>
          <p className="text-xs text-gray-500 dark:!text-gray-400 capitalize mb-3">
            {c.category}
          </p>
          <div className="flex items-center justify-between text-[10px] text-gray-400 dark:!text-gray-400">
            <span>{c.created_at ? new Date(c.created_at).toLocaleDateString() : ""}</span>
            <div className="flex items-center gap-1.5">
              <Badge
                variant="outline"
                className={`text-[9px] capitalize ${SEVERITY_COLORS[c.severity] || ""}`}
              >
                {c.severity}
              </Badge>
              {hasAttachments && <Paperclip className="w-3 h-3" />}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <tr
      className="hover:bg-amber-50/50 cursor-pointer transition-colors group"
      onClick={onClick}
    >
      <td className="px-4 py-3">
        <p className="text-sm font-medium text-gray-900 group-hover:text-amber-700 transition-colors">
          {c.title}
        </p>
      </td>
      <td className="px-4 py-3">
        <Badge className={`${COMPLAINT_STATUS_COLORS[c.status]} text-[10px]`}>
          <StatusIcon className="w-2.5 h-2.5 mr-0.5 inline" />
          {COMPLAINT_STATUS_LABELS[c.status] || c.status}
        </Badge>
      </td>
      <td className="px-4 py-3 hidden sm:table-cell">
        <Badge
          variant="outline"
          className={`text-[10px] capitalize ${SEVERITY_COLORS[c.severity] || ""}`}
        >
          {c.severity}
        </Badge>
      </td>
      <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-400 dark:!text-gray-400">
        {c.created_at ? new Date(c.created_at).toLocaleDateString() : ""}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          {c.linkedTicketId && (
            <Badge
              variant="secondary"
              className="text-[10px] bg-emerald-50 text-emerald-700 hidden sm:flex"
            >
              <Ticket className="w-2.5 h-2.5 mr-0.5" />
              Ticket
            </Badge>
          )}
          {hasAttachments && (
            <Badge
              variant="outline"
              className="text-[10px] text-gray-500 dark:!text-gray-400 hidden sm:flex"
            >
              <Paperclip className="w-2.5 h-2.5 mr-0.5" />
              {c.attachments.length}
            </Badge>
          )}
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-amber-500 transition-colors" />
        </div>
      </td>
    </tr>
  );
}
