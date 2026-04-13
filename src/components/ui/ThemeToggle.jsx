"use client";

import React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

/**
 * ThemeToggle — compact sun/moon button for the navbar.
 *
 * Click cycles through: system → dark → light → system.
 * Long-press (or right-click) could open a dropdown in the future.
 */
export default function ThemeToggle({ className = "" }) {
  const { theme, setTheme, isDark } = useTheme();

  const cycle = () => {
    if (theme === "system") setTheme("dark");
    else if (theme === "dark") setTheme("light");
    else setTheme("system");
  };

  const label =
    theme === "system" ? "System theme"
    : theme === "dark" ? "Dark mode"
    : "Light mode";

  const Icon = theme === "system" ? Monitor : isDark ? Moon : Sun;

  return (
    <button
      type="button"
      onClick={cycle}
      className={`p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-[#27272a] text-gray-500 dark:text-[#a1a1aa] ${className}`}
      title={label}
      aria-label={label}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}
