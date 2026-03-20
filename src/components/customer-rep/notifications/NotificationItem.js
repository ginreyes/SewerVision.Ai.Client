"use client";

import {
  Check,
  Trash2,
  Bell,
  FileText,
  AlertTriangle,
  Clock,
  CheckCheck,
  Ticket,
  MessageSquare,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TYPE_CONFIG = {
  ticket_assigned: { icon: Ticket, color: "bg-teal-100 text-teal-600", label: "Assigned" },
  ticket_updated: { icon: Clock, color: "bg-cyan-100 text-cyan-600", label: "Updated" },
  new_ticket: { icon: MessageSquare, color: "bg-blue-100 text-blue-600", label: "New Ticket" },
  status_update: { icon: CheckCheck, color: "bg-amber-100 text-amber-600", label: "Status" },
  report_ready: { icon: FileText, color: "bg-indigo-100 text-indigo-600", label: "Report" },
  sla_breach: { icon: AlertTriangle, color: "bg-red-100 text-red-600", label: "SLA" },
  system: { icon: Zap, color: "bg-gray-100 text-gray-600", label: "System" },
  default: { icon: Bell, color: "bg-gray-100 text-gray-600", label: "Info" },
};

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
}

export default function NotificationItem({ notification, onMarkRead, onDelete }) {
  const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.default;
  const Icon = config.icon;

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl transition-all ${
        !notification.read
          ? "bg-teal-50/50 border border-teal-100"
          : "bg-gray-50 hover:bg-gray-100"
      }`}
    >
      {/* Icon */}
      <div className={`p-2 rounded-lg shrink-0 ${config.color}`}>
        <Icon className="w-4 h-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900 text-sm truncate">
                {notification.title}
              </h4>
              {!notification.read && (
                <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
              )}
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{notification.message}</p>
          </div>
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {formatDate(notification.createdAt)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3">
          <Badge variant="secondary" className="text-xs">
            {config.label}
          </Badge>
          <div className="flex-1" />
          {!notification.read && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-teal-600 hover:text-teal-700 hover:bg-teal-50"
              onClick={() => onMarkRead(notification._id)}
            >
              <Check className="w-3 h-3 mr-1" />
              Mark read
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => onDelete(notification._id)}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
