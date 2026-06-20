"use client";
import React from "react";
import { X } from "lucide-react";

// July 2 — quoted-parent preview shown above the composer when the user
// clicks Reply on a message. replyTo is the message being replied to:
//   { _id, senderName, text }

export default function ReplyComposerPreview({ replyTo, onCancel }) {
  if (!replyTo) return null;
  return (
    <div className="flex items-start gap-2 rounded-md border-l-2 border-indigo-400 bg-indigo-50/60 px-3 py-2 text-xs">
      <div className="flex-1 min-w-0">
        <div className="font-medium text-indigo-700">Replying to {replyTo.senderName || "message"}</div>
        <div className="mt-0.5 truncate text-zinc-700">{replyTo.text || "[no text]"}</div>
      </div>
      <button
        type="button"
        onClick={onCancel}
        className="flex-shrink-0 rounded p-1 text-zinc-500 hover:bg-indigo-100 hover:text-indigo-700"
        aria-label="Cancel reply"
      >
        <X size={14} />
      </button>
    </div>
  );
}
