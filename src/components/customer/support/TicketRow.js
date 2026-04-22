"use client";

import { AlertCircle, ChevronRight, MessageSquare, Paperclip, Ticket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TICKET_STATUS_COLORS, TICKET_STATUS_ICONS } from "@/app/customer/support/constants";

export default function TicketRow({ t, gridMode, onClick }) {
  const StatusIcon = TICKET_STATUS_ICONS[t.status] || AlertCircle;
  const hasAttachments = t.responses?.some((r) => r.attachments?.length > 0);

  if (gridMode) {
    return (
      <Card
        className="border shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-emerald-200 group"
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
              <Ticket className="w-4 h-4 text-emerald-600" />
            </div>
            <Badge className={`${TICKET_STATUS_COLORS[t.status]} text-[10px] shrink-0`}>
              <StatusIcon className="w-2.5 h-2.5 mr-0.5 inline" />
              {t.status}
            </Badge>
          </div>
          <p className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-emerald-700 transition-colors">
            {t.subject}
          </p>
          <p className="text-xs text-gray-500 dark:!text-gray-400 capitalize mb-3">
            {t.category}
          </p>
          <div className="flex items-center justify-between text-[10px] text-gray-400 dark:!text-gray-400">
            <span>{t.created_at ? new Date(t.created_at).toLocaleDateString() : ""}</span>
            <div className="flex items-center gap-1.5">
              {t.responses?.length > 0 && (
                <span className="flex items-center gap-0.5">
                  <MessageSquare className="w-3 h-3" />
                  {t.responses.length}
                </span>
              )}
              {hasAttachments && <Paperclip className="w-3 h-3" />}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <tr
      className="hover:bg-emerald-50/50 cursor-pointer transition-colors group"
      onClick={onClick}
    >
      <td className="px-4 py-3">
        <p className="text-sm font-medium text-gray-900 group-hover:text-emerald-700 transition-colors">
          {t.subject}
        </p>
      </td>
      <td className="px-4 py-3">
        <Badge className={`${TICKET_STATUS_COLORS[t.status]} text-[10px]`}>
          <StatusIcon className="w-2.5 h-2.5 mr-0.5 inline" />
          {t.status}
        </Badge>
      </td>
      <td className="px-4 py-3 hidden sm:table-cell">
        <Badge variant="outline" className="text-[10px] capitalize">
          {t.category}
        </Badge>
      </td>
      <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-400 dark:!text-gray-400">
        {t.created_at ? new Date(t.created_at).toLocaleDateString() : ""}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          {t.responses?.length > 0 && (
            <Badge variant="secondary" className="text-[10px]">
              {t.responses.length} replies
            </Badge>
          )}
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 transition-colors" />
        </div>
      </td>
    </tr>
  );
}
