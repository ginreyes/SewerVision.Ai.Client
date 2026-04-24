"use client";

import React from "react";
import { MapPin, User, Clock, Settings, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getDeviceIcon,
  getDeviceColor,
  getDeviceStatusColor,
  renderDeviceStatusIcon,
  formatLastSeen,
  teamLeaderLabel,
} from "./constants";

/**
 * DeviceCard — a single device tile in the devices grid.
 * Stateless; handler callbacks are passed from parent.
 */
export default function DeviceCard({
  device,
  selected = false,
  selectable = false,
  onToggleSelect,
  onOpenSettings,
  onViewFootage,
  onDelete,
  canDelete,
}) {
  const Icon = getDeviceIcon(device.type);
  const color = getDeviceColor(device.type);
  const statusLabel = (device.status || "offline");
  const tlLabel = teamLeaderLabel(device);

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl border transition-all cursor-pointer ${
        selected
          ? "border-indigo-400 dark:border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-900/50"
          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md"
      }`}
      onClick={() => onOpenSettings?.(device)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            {selectable && (
              <input
                type="checkbox"
                checked={selected}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => onToggleSelect?.(device, e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                aria-label={`Select ${device.name}`}
              />
            )}
            <div className={`p-2 rounded-lg ${color} text-white shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            {renderDeviceStatusIcon(device.status)}
            <span className={`text-xs font-medium truncate ${getDeviceStatusColor(device.status)}`}>
              {statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1)}
            </span>
          </div>
        </div>

        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mt-3 truncate">
          {device.name}
        </h3>

        <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400 dark:text-gray-500" />
            <span className="truncate">{device.location || "—"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 shrink-0 text-gray-400 dark:text-gray-500" />
            <span className="truncate">{tlLabel}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>Last seen: {formatLastSeen(device.lastSeen)}</span>
          </div>
        </div>

        <div className="mt-3 flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 min-w-0"
            onClick={(e) => {
              e.stopPropagation();
              onOpenSettings?.(device);
            }}
          >
            <Settings className="w-4 h-4 mr-1" />
            Settings
          </Button>
          {device.category === "field" && (
            <Button
              variant="outline"
              size="sm"
              disabled={!device.hasFootage}
              onClick={(e) => {
                e.stopPropagation();
                onViewFootage?.(device);
              }}
            >
              <Play className="w-4 h-4" />
            </Button>
          )}
          {canDelete && (
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:hover:bg-red-900/20"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(device);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
