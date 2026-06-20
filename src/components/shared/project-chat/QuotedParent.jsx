"use client";
import React, { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";

// July 2 — collapsible quoted parent rendered inside a reply message. Click
// to expand and see the full parent text; collapsed view shows the first
// ~60 chars.
//
// onJumpToParent: scroll-and-highlight the parent message in the main list.

export default function QuotedParent({ parent, onJumpToParent }) {
  const [expanded, setExpanded] = useState(false);
  if (!parent) {
    return (
      <div className="rounded border border-dashed border-zinc-200 bg-zinc-50 px-2 py-1 text-[10px] italic text-zinc-400">
        Original message unavailable
      </div>
    );
  }
  const preview = (parent.text || "").slice(0, 60);
  const isLong = (parent.text || "").length > 60;

  return (
    <div className="mb-1 rounded border-l-2 border-zinc-300 bg-zinc-50 pl-2 pr-2 py-1 text-xs">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-1 text-left font-medium text-zinc-600 hover:text-indigo-700"
      >
        {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        <span className="truncate">{parent.senderName || "Message"}</span>
      </button>
      <div className={`mt-0.5 text-zinc-700 ${expanded ? "" : "truncate"}`}>
        {expanded ? parent.text || "[no text]" : preview}{!expanded && isLong ? "…" : ""}
      </div>
      {onJumpToParent && (
        <button
          type="button"
          onClick={() => onJumpToParent(parent._id)}
          className="mt-1 text-[10px] text-indigo-600 hover:underline"
        >
          Jump to original →
        </button>
      )}
    </div>
  );
}
