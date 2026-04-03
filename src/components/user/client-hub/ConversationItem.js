"use client";

import React from "react";

const ConversationItem = React.memo(function ConversationItem({ conversation, isSelected, onSelect }) {
  const c = conversation;

  return (
    <button
      onClick={() => onSelect(c.id)}
      className={`w-full flex items-start gap-3 px-3 py-3.5 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 ${
        isSelected ? "bg-indigo-50" : ""
      }`}
    >
      <div className="relative shrink-0">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold ${c.color}`}
        >
          {c.avatar}
        </div>
        {c.online && (
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900">{c.customer}</span>
          <span className="text-[10px] text-gray-400">{c.time}</span>
        </div>
        <p className="text-[10px] text-indigo-500 font-medium mb-0.5">{c.project}</p>
        <p className="text-xs text-gray-500 truncate">{c.lastMsg}</p>
      </div>
      {c.unread > 0 && (
        <div className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
          {c.unread}
        </div>
      )}
    </button>
  );
});

export default ConversationItem;
