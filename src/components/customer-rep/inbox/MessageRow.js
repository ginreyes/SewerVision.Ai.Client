"use client";

import React from "react";
import { Star } from "lucide-react";
import { formatTime, getInitials, getUserName, getAvatarColor } from "./constants";

export default function MessageRow({ msg, otherUser, isSelected, isUnread, onClick }) {
  const name = getUserName(otherUser);

  return (
    <div
      onClick={onClick}
      className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-gray-50 transition-colors ${
        isSelected ? "bg-teal-50" : isUnread ? "bg-blue-50/40" : "hover:bg-gray-50"
      }`}
    >
      {/* Avatar */}
      <div className={`w-9 h-9 rounded-full ${getAvatarColor(otherUser?._id)} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 mt-0.5`}>
        {getInitials(otherUser)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className={`text-sm truncate ${isUnread ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
            {name}
          </span>
          <span className="text-[11px] text-gray-400 flex-shrink-0 ml-2">{formatTime(msg.createdAt)}</span>
        </div>
        <p className={`text-xs truncate ${isUnread ? "font-semibold text-gray-800" : "text-gray-600"}`}>
          {msg.subject}
        </p>
        <p className="text-[11px] text-gray-400 truncate mt-0.5">{msg.body?.substring(0, 80)}</p>
      </div>

      {/* Indicators */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0 mt-1">
        {isUnread && <div className="w-2 h-2 rounded-full bg-teal-500" />}
        {msg.starred && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
      </div>
    </div>
  );
}
