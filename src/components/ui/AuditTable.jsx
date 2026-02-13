"use client"

import React, { useState } from "react"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Button } from "./button"
import {
  UserPlus,
  UserMinus,
  UserCog,
  ShieldCheck,
  ShieldOff,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Filter,
} from "lucide-react"

const ACTION_CONFIG = {
  created: {
    icon: UserPlus,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700 ring-emerald-600/20",
    label: "Created",
  },
  updated: {
    icon: UserCog,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700 ring-blue-600/20",
    label: "Updated",
  },
  deleted: {
    icon: UserMinus,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    badge: "bg-red-100 text-red-700 ring-red-600/20",
    label: "Deleted",
  },
  enabled: {
    icon: ShieldCheck,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700 ring-emerald-600/20",
    label: "Enabled",
  },
  disabled: {
    icon: ShieldOff,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-700 ring-amber-600/20",
    label: "Disabled",
  },
}

function getActionConfig(action) {
  const key = Object.keys(ACTION_CONFIG).find((k) =>
    action?.toLowerCase().includes(k)
  )
  return (
    ACTION_CONFIG[key] || {
      icon: Clock,
      color: "text-gray-600",
      bg: "bg-gray-50",
      border: "border-gray-200",
      badge: "bg-gray-100 text-gray-700 ring-gray-600/20",
      label: action || "Unknown",
    }
  )
}

function formatRelativeTime(dateStr) {
  if (!dateStr || dateStr === "-") return "-"
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffMin < 1) return "Just now"
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  })
}

const AuditTable = ({
  data = [],
  columns = [],
  loading = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange = () => {},
  filters = [],
  search = "",
  onSearch = () => {},
  onFilterChange = () => {},
}) => {
  const [hoveredRow, setHoveredRow] = useState(null)

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            placeholder="Search by actor, user, or email..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-sm rounded-lg border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 transition-all"
          />
        </div>

        {filters.map(({ key, label, options }) => (
          <Select key={key} onValueChange={(val) => onFilterChange(key, val)}>
            <SelectTrigger className="w-[160px] h-9 text-xs rounded-lg border-gray-200 bg-gray-50/50 hover:bg-white transition-colors">
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                <SelectValue placeholder={label} />
              </div>
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>

      {/* Timeline Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[minmax(140px,1fr)_120px_minmax(180px,2fr)_minmax(120px,1fr)] gap-0 bg-gray-50/80 border-b border-gray-200 px-4 py-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Timestamp
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1">
            <ArrowUpDown className="w-3 h-3" /> Action
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            Target User
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            Performed By
          </span>
        </div>

        {/* Body */}
        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full border-[3px] border-gray-200"></div>
                <div className="absolute inset-0 w-10 h-10 rounded-full border-[3px] border-rose-500 border-t-transparent animate-spin"></div>
              </div>
              <p className="text-sm text-gray-500">Loading audit logs...</p>
            </div>
          ) : data.length > 0 ? (
            data.map((item, idx) => {
              const config = getActionConfig(item.action)
              const Icon = config.icon
              const isHovered = hoveredRow === idx

              return (
                <div
                  key={item.id || idx}
                  onMouseEnter={() => setHoveredRow(idx)}
                  onMouseLeave={() => setHoveredRow(null)}
                  className={`grid grid-cols-[minmax(140px,1fr)_120px_minmax(180px,2fr)_minmax(120px,1fr)] gap-0 px-4 py-3.5 transition-all duration-150 ${
                    isHovered ? "bg-gray-50/80" : "bg-white"
                  }`}
                >
                  {/* Timestamp */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg ${config.bg} ${config.border} border flex items-center justify-center flex-shrink-0 transition-transform duration-150 ${
                        isHovered ? "scale-110" : ""
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {formatRelativeTime(item.time)}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate">{item.time}</p>
                    </div>
                  </div>

                  {/* Action Badge */}
                  <div className="flex items-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${config.badge}`}
                    >
                      {config.label}
                    </span>
                  </div>

                  {/* Target */}
                  <div className="flex items-center gap-3 min-w-0">
                    {item.target?.username ? (
                      <>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold shadow-sm">
                          {item.target.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.target.username}
                          </p>
                          <div className="flex items-center gap-1.5">
                            {item.target.email && (
                              <p className="text-[11px] text-gray-400 truncate">
                                {item.target.email}
                              </p>
                            )}
                            {item.target.role && (
                              <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 capitalize">
                                {item.target.role}
                              </span>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <span className="text-sm text-gray-400 italic">—</span>
                    )}
                  </div>

                  {/* Actor */}
                  <div className="flex items-center min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold text-gray-600">
                          {(item.actor || "?").charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600 truncate">
                        {item.actor || "System"}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-1">
                <Clock className="w-7 h-7 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-500">No audit logs found</p>
              <p className="text-xs text-gray-400">
                Activity will appear here as changes are made
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {data.length > 0 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-gray-500">
            Page <span className="font-semibold text-gray-700">{currentPage}</span> of{" "}
            <span className="font-semibold text-gray-700">{totalPages}</span>
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="h-8 w-8 p-0 rounded-lg"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  className={`h-8 w-8 p-0 rounded-lg text-xs ${
                    pageNum === currentPage
                      ? "bg-rose-600 text-white hover:bg-rose-700 border-rose-600"
                      : ""
                  }`}
                >
                  {pageNum}
                </Button>
              )
            })}

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="h-8 w-8 p-0 rounded-lg"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AuditTable