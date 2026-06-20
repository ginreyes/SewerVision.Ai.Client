"use client";
import React from "react";

// July 1 — per-message "Read by N" pill rendered under the latest message
// each user sent. message.readBy is an array of { userId, readAt }.
//
// Caller responsibility: filter readBy to exclude the message author so we
// don't count the sender as a "reader of their own message." Component just
// renders what it's given.

export default function ReadByPill({ readers, totalParticipants }) {
  const count = (readers || []).length;
  if (count === 0) return null;

  const tone = count >= Math.max(1, totalParticipants - 1)
    ? "bg-emerald-100 text-emerald-700"      // everyone else has read
    : "bg-zinc-100 text-zinc-600";           // partial

  const label = count >= Math.max(1, totalParticipants - 1)
    ? "Read by all"
    : `Read by ${count}`;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${tone}`}>
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-60" />
      {label}
    </span>
  );
}
