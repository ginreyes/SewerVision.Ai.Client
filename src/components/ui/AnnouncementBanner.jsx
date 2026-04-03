"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Megaphone, X, ChevronDown, ChevronUp, Pin,
  Wrench, Sparkles, FileText, AlertTriangle, Bell, Clock,
  Volume2, Eye,
} from "lucide-react";
import { api } from "@/lib/helper";

const TYPE_CONFIG = {
  maintenance: {
    bg: "from-amber-500/10 via-amber-50 to-orange-500/5",
    border: "border-amber-300/60",
    icon: Wrench,
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-500",
    titleColor: "text-amber-900",
    bodyColor: "text-amber-800/80",
    tagBg: "bg-amber-500/15 text-amber-700",
    hoverBg: "hover:from-amber-500/15",
    dismissHover: "hover:bg-amber-200/40",
    newGlow: "shadow-amber-200/50",
  },
  feature: {
    bg: "from-blue-500/10 via-blue-50 to-indigo-500/5",
    border: "border-blue-300/60",
    icon: Sparkles,
    iconBg: "bg-gradient-to-br from-blue-500 to-indigo-500",
    titleColor: "text-blue-900",
    bodyColor: "text-blue-800/80",
    tagBg: "bg-blue-500/15 text-blue-700",
    hoverBg: "hover:from-blue-500/15",
    dismissHover: "hover:bg-blue-200/40",
    newGlow: "shadow-blue-200/50",
  },
  policy: {
    bg: "from-purple-500/10 via-purple-50 to-violet-500/5",
    border: "border-purple-300/60",
    icon: FileText,
    iconBg: "bg-gradient-to-br from-purple-500 to-violet-500",
    titleColor: "text-purple-900",
    bodyColor: "text-purple-800/80",
    tagBg: "bg-purple-500/15 text-purple-700",
    hoverBg: "hover:from-purple-500/15",
    dismissHover: "hover:bg-purple-200/40",
    newGlow: "shadow-purple-200/50",
  },
  alert: {
    bg: "from-red-500/10 via-red-50 to-rose-500/5",
    border: "border-red-300/60",
    icon: AlertTriangle,
    iconBg: "bg-gradient-to-br from-red-500 to-rose-600",
    titleColor: "text-red-900",
    bodyColor: "text-red-800/80",
    tagBg: "bg-red-500/15 text-red-700",
    hoverBg: "hover:from-red-500/15",
    dismissHover: "hover:bg-red-200/40",
    newGlow: "shadow-red-200/50",
  },
  general: {
    bg: "from-slate-500/10 via-gray-50 to-slate-500/5",
    border: "border-gray-300/60",
    icon: Megaphone,
    iconBg: "bg-gradient-to-br from-gray-600 to-slate-700",
    titleColor: "text-gray-900",
    bodyColor: "text-gray-700/80",
    tagBg: "bg-gray-500/15 text-gray-600",
    hoverBg: "hover:from-gray-500/15",
    dismissHover: "hover:bg-gray-200/40",
    newGlow: "shadow-gray-200/50",
  },
};

const POLL_INTERVAL = 15000; // 15 seconds

/**
 * AnnouncementBanner — Real-time announcement viewer for all roles.
 * Polls every 15s for new announcements. New items slide in with animation.
 *
 * Props:
 *  - role: string (e.g. "operator", "customer", "qc-technician")
 */
export default function AnnouncementBanner({ role }) {
  const [announcements, setAnnouncements] = useState([]);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const saved = sessionStorage.getItem(`dismissed-announcements-${role}`);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });
  const [expanded, setExpanded] = useState(null);
  const [newIds, setNewIds] = useState(new Set());
  const knownIdsRef = useRef(new Set());
  const initialFetchDone = useRef(false);

  const fetchAnnouncements = useCallback(async () => {
    if (!role) return;
    try {
      const res = await api(`/api/announcements/role/${role}?limit=5`, "GET");
      if (res.ok && res.data?.data) {
        const fetched = res.data.data;

        // Detect truly new announcements (not on first load)
        if (initialFetchDone.current) {
          const freshIds = new Set();
          fetched.forEach((a) => {
            if (!knownIdsRef.current.has(a._id)) {
              freshIds.add(a._id);
            }
          });
          if (freshIds.size > 0) {
            setNewIds((prev) => new Set([...prev, ...freshIds]));
            // Clear "new" glow after 8 seconds
            setTimeout(() => {
              setNewIds((prev) => {
                const next = new Set(prev);
                freshIds.forEach((id) => next.delete(id));
                return next;
              });
            }, 8000);
          }
        }

        // Update known IDs
        fetched.forEach((a) => knownIdsRef.current.add(a._id));
        initialFetchDone.current = true;
        setAnnouncements(fetched);
      }
    } catch {
      // Silently fail — announcements are non-critical
    }
  }, [role]);

  // Initial fetch
  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // Real-time polling
  useEffect(() => {
    const interval = setInterval(fetchAnnouncements, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchAnnouncements]);

  // Track view
  async function handleExpand(id) {
    if (expanded === id) {
      setExpanded(null);
      return;
    }
    setExpanded(id);
    try {
      await api(`/api/announcements/view/${id}`, "PUT");
    } catch {}
  }

  function handleDismiss(id) {
    const next = new Set([...dismissed, id]);
    setDismissed(next);
    try {
      sessionStorage.setItem(`dismissed-announcements-${role}`, JSON.stringify([...next]));
    } catch {}
  }

  const visible = announcements.filter((a) => !dismissed.has(a._id));
  if (visible.length === 0) return null;

  return (
    <div className="space-y-2.5 mb-5">
      {visible.map((a, idx) => {
        const cfg = TYPE_CONFIG[a.type] || TYPE_CONFIG.general;
        const Icon = cfg.icon;
        const isExpanded = expanded === a._id;
        const isNew = newIds.has(a._id);

        return (
          <div
            key={a._id}
            className={[
              "relative rounded-2xl border backdrop-blur-sm overflow-hidden transition-all duration-500",
              `bg-gradient-to-r ${cfg.bg} ${cfg.border}`,
              isNew ? `shadow-lg ${cfg.newGlow} animate-slideIn` : "shadow-sm",
              isExpanded ? "ring-1 ring-black/5" : "",
            ].join(" ")}
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            {/* Pinned indicator stripe */}
            {a.pinned && (
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-rose-500 to-pink-500 rounded-l-2xl" />
            )}

            <div className={`flex items-start gap-3 px-4 py-3 ${a.pinned ? "pl-5" : ""}`}>
              {/* Icon */}
              <div className={`w-8 h-8 rounded-xl ${cfg.iconBg} flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm`}>
                <Icon className="w-4 h-4" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  {a.pinned && <Pin className="w-3 h-3 text-rose-500 shrink-0" />}
                  <h4 className={`text-[13px] font-bold leading-snug ${cfg.titleColor} ${isExpanded ? "" : "truncate"}`}>
                    {a.title}
                  </h4>
                  <span className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md shrink-0 ${cfg.tagBg}`}>
                    {a.type}
                  </span>
                  {isNew && (
                    <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-md animate-pulse shrink-0">
                      <Volume2 className="w-2.5 h-2.5" /> NEW
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? "max-h-96 mt-1.5" : "max-h-5"}`}>
                  {isExpanded ? (
                    <p className={`text-xs leading-relaxed whitespace-pre-wrap ${cfg.bodyColor}`}>{a.body}</p>
                  ) : (
                    <p className={`text-xs truncate ${cfg.bodyColor}`}>{a.body}</p>
                  )}
                </div>

                {/* Meta */}
                {a.sentAt && (
                  <p className="text-[10px] opacity-50 mt-1.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(a.sentAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={() => handleExpand(a._id)}
                  className={`p-1.5 rounded-lg transition-colors ${cfg.dismissHover}`}
                  title={isExpanded ? "Collapse" : "Read more"}
                >
                  {isExpanded
                    ? <ChevronUp className="w-3.5 h-3.5 opacity-60" />
                    : <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                  }
                </button>
                <button
                  onClick={() => handleDismiss(a._id)}
                  className={`p-1.5 rounded-lg transition-colors ${cfg.dismissHover}`}
                  title="Dismiss"
                >
                  <X className="w-3.5 h-3.5 opacity-60" />
                </button>
              </div>
            </div>
          </div>
        );
      })}

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-12px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>
    </div>
  );
}
