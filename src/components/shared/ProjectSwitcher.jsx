"use client";

import { ChevronDown, CheckCircle2, MapPin, FolderOpen } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * ProjectSwitcher — shadcn DropdownMenu for switching between projects
 * in the ProjectDetail header. Replaces the old custom absolute-positioned
 * dropdown with proper Radix positioning, keyboard nav, focus trap, and
 * auto-close-on-click-outside.
 *
 * Props:
 *   projects     — full list of projects (from the parent page)
 *   currentId    — _id of the currently displayed project
 *   onSelect     — (project) => void — called when user picks a different project
 */
export default function ProjectSwitcher({ projects = [], currentId, onSelect }) {
  if (!projects.length) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-1 px-1.5 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#27272a] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-rose-500"
          title="Switch project"
        >
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-80 max-h-80 overflow-y-auto">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-[#71717a]">
          Switch Project
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {projects.map((p) => {
            const isActive = p._id === currentId;
            return (
              <DropdownMenuItem
                key={p._id}
                onClick={() => onSelect(p)}
                className={`flex items-center gap-3 cursor-pointer py-2.5 ${isActive ? "bg-accent" : ""}`}
              >
                <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-[#27272a] flex items-center justify-center shrink-0">
                  <FolderOpen className="w-3.5 h-3.5 text-gray-500 dark:text-[#a1a1aa]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isActive ? "text-foreground" : ""}`}>
                    {p.name || "Untitled"}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {[p.client, p.location, p.status?.replace(/-/g, " ")].filter(Boolean).join(" · ")}
                  </p>
                </div>
                {isActive && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
