"use client";

import React from "react";
import { Search, Cloud, Truck } from "lucide-react";

/**
 * DeviceToolbar — search + category toggle + status filter.
 * Controlled: parent owns the state.
 */
export default function DeviceToolbar({
  search,
  onSearchChange,
  activeTab,
  onTabChange,
  filterStatus,
  onStatusChange,
  rightSlot,
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden flex-1">
        <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 ml-3 self-center" />
        <input
          type="text"
          placeholder="Search by name, type, or serial..."
          className="flex-1 py-2 px-3 text-sm border-0 bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-0 focus:outline-none"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-1">
          <button
            type="button"
            onClick={() => onTabChange("field")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === "field"
                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <Truck className="w-4 h-4 inline mr-1.5" />
            Field
          </button>
          <button
            type="button"
            onClick={() => onTabChange("cloud")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === "cloud"
                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <Cloud className="w-4 h-4 inline mr-1.5" />
            Cloud
          </button>
        </div>

        <select
          value={filterStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-400"
        >
          <option value="all">All status</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="processing">Processing</option>
          <option value="uploading">Uploading</option>
          <option value="recording">Recording</option>
        </select>

        {rightSlot}
      </div>
    </div>
  );
}
