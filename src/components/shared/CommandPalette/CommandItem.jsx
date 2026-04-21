"use client";

import { forwardRef } from "react";
import { ChevronRight } from "lucide-react";

/**
 * CommandItem — single row in the command palette results list.
 *
 * Displays an optional icon, label, optional description, and optional
 * right-hand meta (e.g. keyboard shortcut hint or entity type badge).
 */
const CommandItem = forwardRef(function CommandItem(
  { icon: Icon, label, description, meta, active = false, onClick, onMouseEnter },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
        active
          ? "bg-gray-100 dark:bg-[#1f1f22]"
          : "hover:bg-gray-50 dark:hover:bg-[#17171a]"
      }`}
    >
      {Icon && (
        <span className="flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-md bg-gray-100 dark:bg-[#18181b] text-gray-600 dark:text-gray-300">
          <Icon className="w-3.5 h-3.5" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {label}
        </span>
        {description && (
          <span className="block text-xs text-gray-500 dark:text-gray-400 truncate">
            {description}
          </span>
        )}
      </span>
      {meta && (
        <span className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500 font-medium">
          {meta}
        </span>
      )}
      {active && (
        <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
      )}
    </button>
  );
});

export default CommandItem;
