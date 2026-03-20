"use client"

import React, { useState, useCallback, useRef } from "react"
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
  Filter,
} from "lucide-react"

/* ─── action config ─── */
const ACTION_CONFIG = {
  created: {
    icon: UserPlus,
    badge: "bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
    label: "Created",
  },
  updated: {
    icon: UserCog,
    badge: "bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-600/20",
    label: "Updated",
  },
  deleted: {
    icon: UserMinus,
    badge: "bg-red-100 text-red-700 ring-1 ring-inset ring-red-600/20",
    label: "Deleted",
  },
  enabled: {
    icon: ShieldCheck,
    badge: "bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
    label: "Enabled",
  },
  disabled: {
    icon: ShieldOff,
    badge: "bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-600/20",
    label: "Disabled",
  },
  password_changed_by_admin: {
    icon: ShieldCheck,
    badge: "bg-purple-100 text-purple-700 ring-1 ring-inset ring-purple-600/20",
    label: "Password Changed",
  },
}

function getActionConfig(action) {
  const key = Object.keys(ACTION_CONFIG).find((k) =>
    action?.toLowerCase().includes(k)
  )
  return (
    ACTION_CONFIG[key] || {
      icon: Clock,
      badge: "bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-600/20",
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

/* ─── role badge colors (matching SewerTable) ─── */
const roleBadgeClasses = {
  admin: "bg-rose-100 text-rose-700 border-rose-200",
  user: "bg-red-100 text-red-700 border-red-200",
  operator: "bg-blue-100 text-blue-700 border-blue-200",
  "qc-technician": "bg-emerald-100 text-emerald-700 border-emerald-200",
  customer: "bg-amber-100 text-amber-700 border-amber-200",
}

/* ─── resize hook ─── */
function useColumnResize(columns, defaults = {}) {
  const [widths, setWidths] = useState(() => {
    const initial = {}
    columns.forEach((col) => {
      initial[col.key] = defaults[col.key] || 200
    })
    return initial
  })

  const startResize = useCallback((colKey, startX) => {
    const startWidth = widths[colKey] || 200

    const onMouseMove = (e) => {
      const delta = e.clientX - startX
      setWidths((prev) => ({
        ...prev,
        [colKey]: Math.max(80, startWidth + delta),
      }))
    }

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }

    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"
    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
  }, [widths])

  return { widths, startResize }
}

/* ─── main component ─── */
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
  const { widths, startResize } = useColumnResize(columns, {
    time: 180,
    action: 140,
    target: 280,
    actor: 160,
  })

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-sm border border-gray-100 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map(({ key, label, options }) => (
            <Select key={key} onValueChange={(val) => onFilterChange(key, val)}>
              <SelectTrigger className="w-[160px] h-9 text-xs rounded-md border-gray-300 dark:border-zinc-700">
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

        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            placeholder="Search by actor, user, or email..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-xs rounded-md border border-gray-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-gray-100 overflow-auto">
        <table className="w-full text-sm" style={{ tableLayout: "fixed" }}>
          <thead className="bg-gray-50 dark:bg-zinc-800 text-left text-xs font-semibold text-gray-600">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="p-3 relative select-none"
                  style={{ width: widths[col.key] }}
                >
                  <span className="flex items-center gap-1.5">
                    {col.key === "time" && <Clock className="w-3 h-3" />}
                    {col.name}
                  </span>
                  {/* Resize Handle */}
                  <div
                    className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize group hover:bg-rose-200 active:bg-rose-400 transition-colors"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      startResize(col.key, e.clientX)
                    }}
                  >
                    <div className="w-px h-full mx-auto bg-gray-200 group-hover:bg-rose-400" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-zinc-700 dark:text-zinc-300">
            {loading ? (
              <tr>
                <td className="p-3 text-center" colSpan={columns.length}>
                  <div className="flex items-center justify-center gap-2 py-8">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full border-[3px] border-gray-200" />
                      <div className="absolute inset-0 w-10 h-10 rounded-full border-[3px] border-rose-500 border-t-transparent animate-spin" />
                    </div>
                    <span className="text-gray-500 text-sm">Loading audit logs...</span>
                  </div>
                </td>
              </tr>
            ) : data.length > 0 ? (
              data.map((item, idx) => {
                const config = getActionConfig(item.action)

                return (
                  <tr
                    key={item.id || idx}
                    className="border-t border-gray-100 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    {/* Timestamp */}
                    <td className="p-3" style={{ width: widths.time }}>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {formatRelativeTime(item.time)}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate">
                          {item.time}
                        </p>
                      </div>
                    </td>

                    {/* Action Badge */}
                    <td className="p-3" style={{ width: widths.action }}>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${config.badge}`}
                      >
                        {config.label}
                      </span>
                    </td>

                    {/* Target User */}
                    <td className="p-3" style={{ width: widths.target }}>
                      {item.target?.username ? (
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={
                              item.target.avatar ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                item.target.username
                              )}&background=random&color=fff`
                            }
                            alt={item.target.username}
                            className="w-9 h-9 rounded-full object-cover shadow-sm flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-medium text-sm truncate">
                              {item.target.username}
                            </div>
                            <div className="flex items-center gap-1.5">
                              {item.target.email && (
                                <span className="text-xs text-gray-500 truncate">
                                  {item.target.email}
                                </span>
                              )}
                              {item.target.role && (
                                <span
                                  className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${
                                    roleBadgeClasses[item.target.role?.toLowerCase()] ||
                                    "bg-gray-100 text-gray-700 border-gray-200"
                                  }`}
                                >
                                  {item.target.role}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">—</span>
                      )}
                    </td>

                    {/* Actor / Performed By */}
                    <td className="p-3" style={{ width: widths.actor }}>
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={
                            item.actorAvatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              item.actor || "System"
                            )}&background=random&color=fff`
                          }
                          alt={item.actor || "System"}
                          className="w-7 h-7 rounded-full object-cover shadow-sm flex-shrink-0"
                        />
                        <span className="text-sm text-gray-600 truncate">
                          {item.actor || "System"}
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td className="p-3 text-center" colSpan={columns.length}>
                  <div className="flex flex-col items-center justify-center py-12">
                    <img
                      src="/background_pictures/empty_search.jpg"
                      alt="No results"
                      className="w-48 h-48 object-contain opacity-80 mb-4"
                    />
                    <p className="text-sm font-medium text-gray-500">No audit logs found</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Try adjusting your filters or search query
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data.length > 0 && (
        <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-3 rounded-lg shadow-sm border border-gray-100">
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
              className="h-8 text-xs"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
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
              className="h-8 text-xs"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AuditTable
