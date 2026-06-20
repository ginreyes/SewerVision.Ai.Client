"use client";
import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { api, unwrap } from "@/lib/helper";

// July 2 — in-conversation search drawer.
//
// Props:
//   conversationId
//   onJumpToMessage(messageId) — caller scrolls + highlights in the main list
//   onClose
//
// Hits GET /api/project-conversations/:id/messages/search?q=... and renders
// each result as a card with 2 messages of context above + below the match.

export default function SearchPanel({ conversationId, onJumpToMessage, onClose }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults(null);
      return undefined;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const r = unwrap(await api(`/api/project-conversations/${conversationId}/messages/search?q=${encodeURIComponent(q)}`));
        if (r.ok) setResults(r.data);
        else setResults({ error: r.message });
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => debounceRef.current && clearTimeout(debounceRef.current);
  }, [q, conversationId]);

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center gap-2 border-b border-zinc-200 p-3">
        <Search size={16} className="text-zinc-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search in conversation…"
          autoFocus
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400"
        />
        <button onClick={onClose} className="rounded p-1 text-zinc-500 hover:bg-zinc-100" aria-label="Close search">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 text-sm">
        {loading && <div className="text-xs text-zinc-500">Searching…</div>}
        {results?.error && <div className="text-xs text-rose-600">{results.error}</div>}
        {results?.results?.length === 0 && q.trim().length >= 2 && (
          <div className="text-xs text-zinc-500">No matches for "{q}".</div>
        )}
        {results?.results?.map(({ match, before, after }) => (
          <div key={match._id} className="mb-3 rounded-md border border-zinc-200 p-2">
            {before.map((b) => (
              <div key={b._id} className="text-[11px] text-zinc-400 truncate">{b.text}</div>
            ))}
            <button
              type="button"
              onClick={() => onJumpToMessage?.(match._id)}
              className="mt-0.5 block w-full rounded bg-amber-50 px-2 py-1 text-left text-xs text-amber-900 hover:bg-amber-100"
            >
              <span className="font-medium">{match.text}</span>
              <span className="ml-2 text-[10px] text-amber-700">jump →</span>
            </button>
            {after.map((a) => (
              <div key={a._id} className="text-[11px] text-zinc-400 truncate">{a.text}</div>
            ))}
          </div>
        ))}
        {results?.truncated && (
          <div className="text-xs text-zinc-500 italic">Showing first 50 matches — refine your query for more.</div>
        )}
      </div>
    </div>
  );
}
