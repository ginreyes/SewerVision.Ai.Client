"use client";

import React, { memo, useState, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * RefreshIndicator — shows "Last updated X ago" + refresh button.
 * Standardized for all dashboards.
 */
const RefreshIndicator = memo(function RefreshIndicator({ onRefresh, lastUpdated, refreshing = false }) {
  const timeAgo = lastUpdated
    ? getRelativeTime(lastUpdated)
    : "just now";

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400">Updated {timeAgo}</span>
      <Button variant="outline" size="sm" onClick={onRefresh} disabled={refreshing} className="gap-1.5 h-8">
        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
        Refresh
      </Button>
    </div>
  );
});

function getRelativeTime(date) {
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleTimeString();
}

export default RefreshIndicator;
