"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const IMAGE_MAP = {
  "no-projects": "/background_pictures/no-projects.jpg",
  "no-notifications": "/background_pictures/no-notifications-yet.jpg",
  "empty-search": "/background_pictures/empty_search.jpg",
  "no-data": "/background_pictures/no_search_found.jpg",
  "no-tickets": "/background_pictures/no_ticket_found.jpg",
};

const SIZE_MAP = {
  sm: { img: 120, title: "text-sm", subtitle: "text-xs", gap: "gap-2", py: "py-6" },
  md: { img: 180, title: "text-base", subtitle: "text-sm", gap: "gap-3", py: "py-10" },
  lg: { img: 240, title: "text-lg", subtitle: "text-sm", gap: "gap-4", py: "py-14" },
};

/**
 * Reusable empty state component for the whole project.
 *
 * @param {string} variant - 'no-projects' | 'no-notifications' | 'empty-search' | 'no-data'
 * @param {string} title - Main message
 * @param {string} subtitle - Secondary message
 * @param {{ label: string, onClick: () => void }} action - Optional button
 * @param {'sm' | 'md' | 'lg'} size - Size variant
 */
export default function EmptySewerComponent({
  variant = "no-data",
  title = "Nothing here yet",
  subtitle = "",
  action = null,
  size = "md",
}) {
  const imageSrc = IMAGE_MAP[variant] || IMAGE_MAP["no-data"];
  const s = SIZE_MAP[size] || SIZE_MAP.md;

  return (
    <div className={`flex flex-col items-center justify-center ${s.py} ${s.gap} text-center px-4`}>
      <div className="relative" style={{ width: s.img, height: s.img }}>
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="object-contain rounded-xl"
          priority={false}
        />
      </div>
      <div className="space-y-1 max-w-sm">
        <p className={`font-semibold text-gray-700 ${s.title}`}>{title}</p>
        {subtitle && <p className={`text-gray-400 ${s.subtitle}`}>{subtitle}</p>}
      </div>
      {action && (
        <Button variant="outline" size="sm" onClick={action.onClick} className="mt-1">
          {action.label}
        </Button>
      )}
    </div>
  );
}
