"use client";

import React from "react";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

/**
 * AppearanceSettings — "Theme" section for any role's settings page.
 *
 * Renders 3 cards: Light / Dark / System. Clicking one calls setTheme()
 * which updates localStorage + the <html> class immediately.
 *
 * Drop into any settings page:
 *   <AppearanceSettings />
 */

const options = [
  {
    key: "light",
    label: "Light",
    description: "Classic light background with dark text",
    icon: Sun,
    preview: "bg-white border-gray-200",
    previewInner: "bg-gray-100",
  },
  {
    key: "dark",
    label: "Dark",
    description: "Reduced eye strain with dark surfaces",
    icon: Moon,
    preview: "bg-gray-900 border-gray-700",
    previewInner: "bg-gray-800",
  },
  {
    key: "system",
    label: "System",
    description: "Follows your operating system preference",
    icon: Monitor,
    preview: "bg-gradient-to-r from-white to-gray-900 border-gray-400",
    previewInner: "bg-gradient-to-r from-gray-100 to-gray-800",
  },
];

export default function AppearanceSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Appearance</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Choose how SewerVision looks. Your preference is saved locally and syncs across visits.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {options.map((opt) => {
          const active = theme === opt.key;
          const Icon = opt.icon;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => setTheme(opt.key)}
              className={[
                "relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left",
                active
                  ? "border-[var(--role-accent,#3b82f6)] bg-[var(--role-accent-light,rgba(59,130,246,0.08))] shadow-sm"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800",
              ].join(" ")}
            >
              {/* Checkmark */}
              {active && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--role-accent,#3b82f6)] flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}

              {/* Mini preview */}
              <div className={`w-full h-16 rounded-lg border ${opt.preview} flex items-end p-1.5 gap-1`}>
                <div className={`h-4 flex-1 rounded ${opt.previewInner}`} />
                <div className={`h-6 w-8 rounded ${opt.previewInner}`} />
              </div>

              {/* Label */}
              <div className="flex items-center gap-2 w-full">
                <Icon className={`w-4 h-4 ${active ? "text-[var(--role-accent,#3b82f6)]" : "text-gray-500 dark:text-gray-400"}`} />
                <span className={`text-sm font-semibold ${active ? "text-[var(--role-accent,#3b82f6)]" : "text-gray-900 dark:text-gray-100"}`}>
                  {opt.label}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 w-full">{opt.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
