"use client";

import { icons } from "lucide-react";

/**
 * Renders a Lucide icon by its string name.
 *
 * @param {string} name - The PascalCase icon name (e.g. "LayoutDashboard", "FolderOpen")
 * @param {string} className - Optional Tailwind classes
 * @param {number} size - Icon size in pixels (default 20)
 */
export default function DynamicIcon({ name, className = "", size = 20, ...props }) {
  // Handle icon names that end with "Icon" (e.g. "HeadphonesIcon" → "Headphones")
  const cleanName = name?.replace(/Icon$/, "") || "";
  const IconComponent = icons[name] || icons[cleanName];

  if (!IconComponent) {
    // Fallback: render a generic box
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={className}
        {...props}
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      </svg>
    );
  }

  return <IconComponent size={size} className={className} {...props} />;
}
