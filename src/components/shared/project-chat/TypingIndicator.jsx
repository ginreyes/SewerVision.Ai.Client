"use client";
import React from "react";

// July 1 — "X is typing…" rendered at the bottom of the message list.
// typingUsers: array of { userId, name?, avatar? }.
//
// Backend emits user-typing socket events debounced to one per 2s per user,
// plus an auto-stop after 3s of silence. This component reflects whoever
// is currently in the "typing" state.

function names(typingUsers) {
  if (typingUsers.length === 0) return null;
  if (typingUsers.length === 1) return typingUsers[0].name || typingUsers[0].userId.slice(0, 6);
  if (typingUsers.length === 2) {
    const a = typingUsers[0].name || typingUsers[0].userId.slice(0, 6);
    const b = typingUsers[1].name || typingUsers[1].userId.slice(0, 6);
    return `${a} and ${b}`;
  }
  return `${typingUsers.length} people`;
}

export default function TypingIndicator({ typingUsers }) {
  if (!typingUsers || typingUsers.length === 0) return null;
  return (
    <div className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-500">
      <span className="flex gap-0.5">
        <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400" style={{ animationDelay: "0ms" }} />
        <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400" style={{ animationDelay: "120ms" }} />
        <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400" style={{ animationDelay: "240ms" }} />
      </span>
      <span>{names(typingUsers)} {typingUsers.length === 1 ? "is" : "are"} typing…</span>
    </div>
  );
}
