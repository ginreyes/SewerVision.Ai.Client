"use client";

import React, { memo } from "react";
import Image from "next/image";
import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * EmptyState — consistent empty state component for all list pages.
 * Supports both icon and image modes.
 *
 * @param {{ icon?: React.ElementType, image?: string, title?: string, description?: string, actionLabel?: string, onAction?: () => void, className?: string }} props
 */
const EmptyState = memo(function EmptyState({
  icon: Icon = FolderOpen,
  image,
  title = "No data found",
  description = "There's nothing here yet.",
  actionLabel,
  onAction,
  className = "",
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
      {image ? (
        <div className="w-48 h-48 relative mb-4 opacity-80">
          <Image src={image} alt={title} fill className="object-contain" />
        </div>
      ) : (
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-gray-300" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-gray-700 mb-1">{title}</h3>
      <p className="text-xs text-gray-400 max-w-[280px]">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" className="mt-4 gap-1.5">
          {actionLabel}
        </Button>
      )}
    </div>
  );
});

export default EmptyState;
