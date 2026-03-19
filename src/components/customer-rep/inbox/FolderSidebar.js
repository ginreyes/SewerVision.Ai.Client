"use client";

import React from "react";
import { Inbox, Star, Send, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const FOLDERS = [
  { key: "inbox", label: "Inbox", icon: Inbox },
  { key: "starred", label: "Starred", icon: Star },
  { key: "sent", label: "Sent", icon: Send },
];

export default function FolderSidebar({
  activeFolder,
  starredOnly,
  unreadCount,
  onFolderChange,
  onMarkAllRead,
  markingAllRead,
}) {
  return (
    <div className="w-48 flex-shrink-0 hidden md:block">
      <div className="space-y-1">
        {FOLDERS.map((f) => {
          const Icon = f.icon;
          const isActive =
            (f.key === "starred" && starredOnly && activeFolder === "inbox") ||
            (f.key === activeFolder && !starredOnly);

          return (
            <button
              key={f.key}
              onClick={() => onFolderChange(f.key)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-teal-100 text-teal-800 font-semibold"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-teal-600" : "text-gray-400"}`} />
              <span className="flex-1 text-left">{f.label}</span>
              {f.key === "inbox" && unreadCount > 0 && (
                <Badge className="bg-teal-600 text-white text-[10px] px-1.5 py-0 min-w-[20px] justify-center">
                  {unreadCount}
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      {unreadCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-4 text-xs text-gray-500"
          onClick={onMarkAllRead}
          disabled={markingAllRead}
        >
          <CheckCheck className="w-3.5 h-3.5 mr-1" /> Mark all read
        </Button>
      )}
    </div>
  );
}
