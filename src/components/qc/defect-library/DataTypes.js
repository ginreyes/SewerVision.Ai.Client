"use client";

import {
  Wrench, Droplets, TreePine, Layers, Settings, Plug, MapPin, HelpCircle,
} from "lucide-react";

/**
 * Severity badge color classes keyed by grade string
 */
export const SEVERITY_COLORS = {
  1: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200", stripe: "bg-emerald-500" },
  2: { bg: "bg-blue-100",    text: "text-blue-700",    border: "border-blue-200",    stripe: "bg-blue-500" },
  3: { bg: "bg-amber-100",   text: "text-amber-700",   border: "border-amber-200",   stripe: "bg-amber-500" },
  4: { bg: "bg-orange-100",  text: "text-orange-700",  border: "border-orange-200",  stripe: "bg-orange-500" },
  5: { bg: "bg-red-100",     text: "text-red-700",     border: "border-red-200",     stripe: "bg-red-600" },
};

/**
 * Gradient stops for the visual severity bar (green -> red)
 */
export const GRADE_BAR_COLORS = [
  "bg-emerald-500",  // Grade 1
  "bg-blue-500",     // Grade 2
  "bg-amber-500",    // Grade 3
  "bg-orange-500",   // Grade 4
  "bg-red-600",      // Grade 5
];

/**
 * Grade labels
 */
export const GRADE_LABELS = ["Minimal", "Low", "Moderate", "Severe", "Critical"];

/**
 * Category -> icon mapping
 */
export const CATEGORY_ICONS = {
  Structural:           Wrench,
  Infiltration:         Droplets,
  "Root Intrusion":     TreePine,
  Deposits:             Layers,
  Operational:          Settings,
  "Service Connections": Plug,
  "Access Points":      MapPin,
};

/**
 * Return the icon component for a given category
 */
export function getCategoryIcon(category) {
  return CATEGORY_ICONS[category] || HelpCircle;
}

/**
 * Get severity color config for a numeric grade (1-5)
 */
export function getSeverityColor(grade) {
  const num = typeof grade === "string" ? parseInt(grade.replace(/\D/g, ""), 10) : grade;
  return SEVERITY_COLORS[num] || SEVERITY_COLORS[1];
}

/**
 * Parse numeric grade from various formats
 */
export function parseGrade(grade) {
  if (typeof grade === "number") return grade;
  if (typeof grade === "string") {
    const m = grade.match(/\d+/);
    return m ? parseInt(m[0], 10) : 1;
  }
  return 1;
}
