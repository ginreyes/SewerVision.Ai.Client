"use client";

import React from "react";

const MessageBubble = React.memo(function MessageBubble({ message, isOwn, avatarContent, avatarColor }) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      {!isOwn && (
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold mr-2 shrink-0 mt-auto ${avatarColor}`}
        >
          {avatarContent}
        </div>
      )}
      <div
        className={`max-w-xs px-3.5 py-2.5 rounded-2xl text-sm ${
          isOwn
            ? "bg-indigo-600 text-white rounded-br-sm"
            : "bg-gray-100 text-gray-900 rounded-bl-sm"
        }`}
      >
        <p>{message.text}</p>
        <p
          className={`text-[10px] mt-0.5 ${
            isOwn ? "text-indigo-200" : "text-gray-400"
          } text-right`}
        >
          {message.time}
        </p>
      </div>
    </div>
  );
});

export default MessageBubble;
