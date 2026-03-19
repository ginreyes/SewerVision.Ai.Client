"use client";

import React from "react";
import {
  Star,
  StarOff,
  Archive,
  Trash2,
  ArrowLeft,
  Clock,
  Reply,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAlert } from "@/components/providers/AlertProvider";
import {
  useToggleMessageStar,
  useMarkMessageRead,
  useArchiveMessage,
  useDeleteMessage,
} from "@/hooks/useQueryHooks";
import { getInitials, getUserName, getAvatarColor } from "./constants";

export default function MessageDetail({ message, userId, onBack, onReply }) {
  const { showAlert } = useAlert();
  const starMutation = useToggleMessageStar();
  const archiveMutation = useArchiveMessage();
  const deleteMutation = useDeleteMessage();
  const readMutation = useMarkMessageRead();

  // Mark as read on open
  React.useEffect(() => {
    if (message && !message.read && message.to?._id === userId) {
      readMutation.mutate(message._id);
    }
  }, [message?._id]);

  const sender = message.from;
  const senderName = getUserName(sender);

  return (
    <div className="h-full flex flex-col">
      {/* Detail Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
        <Button variant="ghost" size="sm" onClick={onBack} className="lg:hidden">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">{message.subject}</h3>
          <p className="text-xs text-gray-400">{senderName}</p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onReply(message)} title="Reply">
            <Reply className="w-4 h-4 text-gray-500" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0"
            onClick={async () => { await starMutation.mutateAsync(message._id); }}
            title={message.starred ? "Unstar" : "Star"}
          >
            {message.starred ? <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> : <StarOff className="w-4 h-4 text-gray-400" />}
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0"
            onClick={async () => { await archiveMutation.mutateAsync(message._id); showAlert("Archived", "success"); onBack(); }}
            title="Archive"
          >
            <Archive className="w-4 h-4 text-gray-400" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0"
            onClick={async () => { await deleteMutation.mutateAsync(message._id); showAlert("Deleted", "success"); onBack(); }}
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-gray-400" />
          </Button>
        </div>
      </div>

      {/* Message Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-full ${getAvatarColor(sender?._id)} flex items-center justify-center text-white text-sm font-semibold flex-shrink-0`}>
            {getInitials(sender)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-gray-900">{senderName}</span>
              <span className="text-xs text-gray-400">&lt;{sender?.email || ""}&gt;</span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-gray-400">
                <Clock className="w-3 h-3 inline mr-0.5" />
                {message.createdAt ? new Date(message.createdAt).toLocaleString() : ""}
              </span>
              {message.ticketId && (
                <Badge variant="outline" className="text-[10px] bg-teal-50 text-teal-700 border-teal-200">
                  Ticket: {message.ticketId?.subject || message.ticketId}
                </Badge>
              )}
            </div>
            <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {message.body}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Reply */}
      <div className="border-t border-gray-100 p-3">
        <Button variant="outline" size="sm" className="w-full" onClick={() => onReply(message)}>
          <Reply className="w-4 h-4 mr-1.5" /> Reply
        </Button>
      </div>
    </div>
  );
}
