"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  Search,
  FolderKanban,
  User as UserIcon,
  FileText,
  Clock,
  X,
  Loader2,
} from "lucide-react";
import CommandItem from "./CommandItem";
import { useCommandPalette } from "./useCommandPalette";
import { getStaticCommands } from "./commandRegistry";
import { useCommandPaletteSearch } from "@/data/searchApi";
import { deleteCookie } from "@/lib/helper";

/**
 * CommandPalette — global ⌘K / Ctrl+K search & action launcher.
 *
 * Renders nothing visible until triggered. Mounted once inside RoleLayout
 * so every role gets it for free.
 */
export default function CommandPalette({ role }) {
  const router = useRouter();
  const { open, closePalette, recents, addRecent } = useCommandPalette();
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const { data: searchResults, isFetching } = useCommandPaletteSearch(query);

  useEffect(() => setMounted(true), []);

  // Reset on open/close
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIdx(0);
      // Focus input on next tick so animation doesn't steal focus
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Build the flattened result list. Order: Recents → Navigation → Actions →
  // Projects → Users → Reports. Static commands fuzzy-match on label.
  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const staticCmds = getStaticCommands(role);

    const matchStatic = (cmds) =>
      !q ? cmds : cmds.filter((c) => c.label.toLowerCase().includes(q));

    const nav = matchStatic(staticCmds.filter((c) => c.group === "Navigation"));
    const actions = matchStatic(staticCmds.filter((c) => c.group === "Actions"));

    const recentsItems = !q
      ? recents.slice(0, 5).map((r) => ({ ...r, group: "Recent" }))
      : [];

    const projects = (searchResults?.projects || []).map((p) => ({
      id: `project-${p._id}`,
      label: p.name || "Untitled project",
      description: [p.client, p.location].filter(Boolean).join(" • "),
      icon: FolderKanban,
      group: "Projects",
      entityType: "project",
      entity: p,
      path: resolveProjectPath(role, p._id),
    }));

    const users = (searchResults?.users || []).map((u) => ({
      id: `user-${u._id}`,
      label:
        [u.first_name, u.last_name].filter(Boolean).join(" ") ||
        u.username ||
        u.email ||
        "User",
      description: u.email,
      icon: UserIcon,
      group: "Users",
      entityType: "user",
      entity: u,
      path: role === "admin" ? `/admin/users/${u._id}` : undefined,
    }));

    const reports = (searchResults?.reports || []).map((r) => ({
      id: `report-${r._id}`,
      label: r.inspectionId || r.location || "Report",
      description: [r.reportType, r.status].filter(Boolean).join(" • "),
      icon: FileText,
      group: "Reports",
      entityType: "report",
      entity: r,
      path: resolveReportPath(role, r._id),
    }));

    return [...recentsItems, ...nav, ...actions, ...projects, ...users, ...reports];
  }, [query, role, recents, searchResults]);

  // Group items for render
  const groupedItems = useMemo(() => {
    const groups = {};
    items.forEach((item, idx) => {
      const g = item.group || "Other";
      if (!groups[g]) groups[g] = [];
      groups[g].push({ ...item, flatIdx: idx });
    });
    return groups;
  }, [items]);

  // Keep active index in range
  useEffect(() => {
    if (activeIdx >= items.length) setActiveIdx(Math.max(0, items.length - 1));
  }, [items.length, activeIdx]);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${activeIdx}"]`);
    if (el && typeof el.scrollIntoView === "function") {
      el.scrollIntoView({ block: "nearest" });
    }
  }, [activeIdx]);

  const runItem = (item) => {
    if (!item) return;

    // Action-type commands
    if (item.actionType === "toggle-theme") {
      const root = document.documentElement;
      const isDark = root.classList.contains("dark");
      if (isDark) root.classList.remove("dark");
      else root.classList.add("dark");
      try {
        localStorage.setItem("theme", isDark ? "light" : "dark");
      } catch {
        // ignore
      }
      closePalette();
      return;
    }
    if (item.actionType === "refresh") {
      closePalette();
      router.refresh();
      return;
    }
    if (item.actionType === "logout") {
      deleteCookie("authToken");
      deleteCookie("username");
      deleteCookie("role");
      closePalette();
      router.push("/login");
      return;
    }

    // Path-based navigation
    if (item.path) {
      addRecent({
        id: item.id,
        label: item.label,
        description: item.description,
        path: item.path,
      });
      closePalette();
      router.push(item.path);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      closePalette();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, items.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      runItem(items[activeIdx]);
    }
  };

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-start justify-center pt-[12vh] px-4 bg-black/40 backdrop-blur-sm"
      onMouseDown={(e) => {
        // close on backdrop click
        if (e.target === e.currentTarget) closePalette();
      }}
    >
      <div className="w-full max-w-xl rounded-xl bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-[#27272a] shadow-2xl overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-[#27272a]">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIdx(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search projects, people, pages, or type a command..."
            className="flex-1 bg-transparent border-0 outline-none text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
          />
          {isFetching && (
            <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin flex-shrink-0" />
          )}
          <kbd className="text-[10px] px-1.5 py-0.5 rounded border border-gray-200 dark:border-[#27272a] text-gray-400 bg-gray-50 dark:bg-[#18181b]">
            ESC
          </kbd>
          <button
            type="button"
            onClick={closePalette}
            className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            aria-label="Close command palette"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Results list */}
        <div
          ref={listRef}
          className="max-h-[60vh] overflow-y-auto py-2"
          onKeyDown={onKeyDown}
        >
          {items.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-gray-500">
              {query.trim().length >= 2
                ? "No results found."
                : "Start typing to search projects, users, or jump to any page..."}
            </div>
          ) : (
            Object.entries(groupedItems).map(([groupName, groupItems]) => (
              <div key={groupName} className="mb-1">
                <div className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                  {groupName === "Recent" && <Clock className="w-3 h-3" />}
                  {groupName}
                </div>
                <div className="px-2 space-y-0.5">
                  {groupItems.map((item) => (
                    <div key={item.id} data-idx={item.flatIdx}>
                      <CommandItem
                        icon={item.icon}
                        label={item.label}
                        description={item.description}
                        active={item.flatIdx === activeIdx}
                        onClick={() => runItem(item)}
                        onMouseEnter={() => setActiveIdx(item.flatIdx)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 dark:border-[#27272a] text-[10px] text-gray-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded border border-gray-200 dark:border-[#27272a] bg-gray-50 dark:bg-[#18181b]">
                ↑↓
              </kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded border border-gray-200 dark:border-[#27272a] bg-gray-50 dark:bg-[#18181b]">
                ↵
              </kbd>
              Select
            </span>
          </div>
          <span>
            <kbd className="px-1 py-0.5 rounded border border-gray-200 dark:border-[#27272a] bg-gray-50 dark:bg-[#18181b]">
              ⌘K
            </kbd>{" "}
            to toggle
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────

function resolveProjectPath(role, projectId) {
  switch (role) {
    case "admin":
      return `/admin/project?selectedProject=${projectId}`;
    case "operator":
      return `/operator/project?selectedProject=${projectId}`;
    case "user":
      return `/user/project?selectedProject=${projectId}`;
    case "qc-technician":
      return `/qc-technician/quality-control?selectedProject=${projectId}`;
    case "customer":
      return `/customer/projects/${projectId}`;
    case "customer-rep":
      return `/customer-rep/projects/overview`;
    default:
      return undefined;
  }
}

function resolveReportPath(role, reportId) {
  switch (role) {
    case "qc-technician":
      return `/qc-technician/reports/${reportId}`;
    case "admin":
      return `/admin/reports/${reportId}`;
    default:
      return undefined;
  }
}
