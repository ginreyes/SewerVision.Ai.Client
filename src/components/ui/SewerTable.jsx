"use client"

import React, { useState, useCallback } from "react"
import {
  Eye,
  Trash2,
  Mail,
  Power,
  MoreVertical,
  Lock
} from "lucide-react"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "./button"

/* ─── resize hook ─── */
function useColumnResize(columns, defaults = {}, hasCheckbox, hasActions) {
  const [widths, setWidths] = useState(() => {
    const initial = {}
    columns.forEach((col) => {
      initial[col.key] = defaults[col.key] || 200
    })
    if (hasActions) initial["__actions"] = defaults["__actions"] || 80
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

/* ─── resize handle ─── */
const ResizeHandle = ({ onMouseDown }) => (
  <div
    className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize group hover:bg-rose-200 active:bg-rose-400 transition-colors"
    onMouseDown={onMouseDown}
  >
    <div className="w-px h-full mx-auto bg-gray-200 group-hover:bg-rose-400" />
  </div>
)

/**
 * Generic reusable table component.
 *
 * Props:
 * - data, columns, filters, search, onSearch, onFilterChange, loading
 * - renderCell(item, col) — optional custom cell renderer; return JSX or null to use default
 * - showCheckbox (default true) — show row selection checkboxes
 * - showActions (default true) — show actions column with dropdown
 * - showCsvActions (default true) — show CSV import/export in filter bar
 * - emptyMessage — text when no data
 * - emptySubtext — subtitle for empty state
 * - rowsPerPageOptions — array of numbers for pagination
 * - onView, onDelete, onDisable, onEmail, onChangePassword — action callbacks
 * - selectedRows, onSelectionChange — external selection state
 * - getRowId(item) — function to extract row ID; defaults to item.user?.user_id ?? item.id
 * - ButtonPlacement — extra element in filter bar
 * - columnDefaults — object mapping col.key → default width in px
 */
const SewerTable = (props) => {
  const {
    data = [],
    columns = [],
    filters = [],
    search = "",
    onSearch = () => {},
    onFilterChange = () => {},
    loading = false,
    ButtonPlacement = null,
    onDelete = null,
    onView = null,
    onDisable = null,
    onEmail = null,
    onChangePassword = null,
    selectedRows: externalSelectedRows = [],
    onSelectionChange = null,
    renderCell = null,
    showCheckbox = true,
    showActions = true,
    showCsvActions = true,
    emptyMessage = "No data found",
    emptySubtext = "Try adjusting your filters or search query",
    rowsPerPageOptions = [10, 20, 50],
    getRowId = null,
    columnDefaults = {},
  } = props

  const hasActions = showActions && (onView || onDelete || onDisable || onEmail || onChangePassword)

  const [previewData, setPreviewData] = useState([])
  const [showImportModal, setShowImportModal] = useState(false)
  const [internalSelectedRows, setInternalSelectedRows] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0] || 10)

  const { widths, startResize } = useColumnResize(columns, {
    ...columnDefaults,
    __actions: columnDefaults.__actions || 80,
  }, showCheckbox, hasActions)

  const selectedRows = onSelectionChange ? externalSelectedRows : internalSelectedRows
  const setSelectedRows = onSelectionChange || setInternalSelectedRows

  const totalPages = Math.ceil(data.length / rowsPerPage)
  const paginatedData = data.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  )

  const extractRowId = getRowId || ((item) => item.user?.user_id ?? item.id ?? null)

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      const newSelection = paginatedData.map((row) => extractRowId(row)).filter(Boolean)
      setSelectedRows(newSelection)
    } else {
      setSelectedRows([])
    }
  }

  const toggleRowSelection = (id) => {
    const newSelection = selectedRows.includes(id)
      ? selectedRows.filter((x) => x !== id)
      : [...selectedRows, id]
    setSelectedRows(newSelection)
  }

  const isAllSelected = paginatedData.length > 0 && paginatedData.every((row) =>
    selectedRows.includes(extractRowId(row))
  )

  const exportToCSV = (columns, data, filename = "export.csv") => {
    const headers = columns.map(col => col.name)
    const rows = data.map(row =>
      columns.map(col => {
        const value = row[col.key]
        if (typeof value === "object" && value !== null) {
          if (value.name) return `"${value.name}"`
          if (value.username) return `"${value.username}"`
          return `"${JSON.stringify(value)}"`
        }
        return `"${value ?? ""}"`
      }).join(",")
    )

    const csvContent = [headers.join(","), ...rows].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCSVImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result
      if (typeof text === "string") {
        const rows = text.trim().split("\n").map(line => line.split(","))
        const headers = rows[0]
        const body = rows.slice(1).map(row =>
          Object.fromEntries(row.map((val, i) => [headers[i], val.replace(/^"|"$/g, '')]))
        )
        setPreviewData(body)
        setShowImportModal(true)
      }
    }
    reader.readAsText(file)
  }

  const handleComfirmImport = () => {
    setShowImportModal(false)
  }

  /* ─── default cell rendering ─── */
  const defaultRenderCell = (item, col) => {
    const value = item[col.key]

    // User-type cell with avatar
    if (col.key === "user" && typeof value === "object" && value !== null) {
      const avatarUrl = value.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(value.name || 'U')}&background=random&color=fff`
      return (
        <div className="flex items-center gap-3">
          <img src={avatarUrl} alt={value.name} className="w-9 h-9 rounded-full object-cover shadow-sm flex-shrink-0" />
          <div className="min-w-0">
            <div className="font-medium text-sm truncate">{value.name}</div>
            <div className="text-xs text-gray-500 truncate">{value.email}</div>
          </div>
        </div>
      )
    }

    // Status badge
    if (col.key === "status") {
      const statusClasses = {
        Active: "bg-green-100 text-green-700",
        Inactive: "bg-gray-100 text-gray-600",
        Pending: "bg-amber-100 text-amber-700",
      }
      return (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusClasses[value] || ""}`}>
          {value}
        </span>
      )
    }

    // React element (like pre-rendered badges)
    if (React.isValidElement(value)) return value

    // Plain text
    return <span className="capitalize text-sm">{value}</span>
  }

  const totalCols = (showCheckbox ? 1 : 0) + columns.length + (hasActions ? 1 : 0)

  return (
    <>
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Filter Bar */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-sm border border-gray-100 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {filters.map(({ key, label, options }) => (
              <Select key={key} onValueChange={(val) => onFilterChange(key, val)}>
                <SelectTrigger className="w-[150px] h-9 text-xs rounded-md border-gray-300 dark:border-zinc-700">
                  <SelectValue placeholder={label} />
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

          <div className="flex gap-2 items-center">
            <input
              placeholder="Search..."
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              className="w-[200px] h-9 text-xs rounded-md border border-gray-300 dark:border-zinc-700 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />

            {showCsvActions && (
              <>
                <Select onValueChange={(val) => {
                  if (val === "export") exportToCSV(columns, data)
                  else if (val === "import") document.getElementById("csvInput")?.click()
                }}>
                  <SelectTrigger className="w-[130px] h-9 text-xs rounded-md border-gray-300 dark:border-zinc-700">
                    <SelectValue placeholder="CSV Action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="export" className="text-xs">Export CSV</SelectItem>
                    <SelectItem value="import" className="text-xs">Import CSV</SelectItem>
                  </SelectContent>
                </Select>
                <input type="file" id="csvInput" accept=".csv" className="hidden" onChange={handleCSVImport} />
              </>
            )}

            {ButtonPlacement}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-gray-100 overflow-auto">
          <table className="w-full text-sm" style={{ tableLayout: "fixed" }}>
            <thead className="bg-gray-50 dark:bg-zinc-800 text-left text-xs font-semibold text-gray-600">
              <tr>
                {showCheckbox && (
                  <th className="p-3" style={{ width: 40 }}>
                    <input
                      type="checkbox"
                      onChange={toggleSelectAll}
                      checked={paginatedData.length > 0 && isAllSelected}
                      className="rounded border-gray-300"
                    />
                  </th>
                )}
                {columns.map((col) => (
                  <th key={col.key} className="p-3 relative select-none" style={{ width: widths[col.key] }}>
                    {col.name}
                    <ResizeHandle onMouseDown={(e) => { e.preventDefault(); startResize(col.key, e.clientX) }} />
                  </th>
                ))}
                {hasActions && (
                  <th className="p-3 text-right relative" style={{ width: widths["__actions"] }}>
                    ACTIONS
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="text-zinc-700 dark:text-zinc-300">
              {loading ? (
                <tr>
                  <td className="p-3 text-center" colSpan={totalCols}>
                    <div className="flex items-center justify-center gap-2 py-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-rose-500"></div>
                      <span className="text-gray-500">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((item, idx) => {
                  const rowId = extractRowId(item) ?? idx
                  const isChecked = selectedRows.includes(rowId)

                  return (
                    <tr
                      key={rowId}
                      className="border-t border-gray-100 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      {showCheckbox && (
                        <td className="p-3" style={{ width: 40 }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleRowSelection(rowId)}
                            className="rounded border-gray-300"
                          />
                        </td>
                      )}
                      {columns.map((col) => {
                        const customCell = renderCell ? renderCell(item, col) : null
                        return (
                          <td key={col.key} className="p-3" style={{ width: widths[col.key] }}>
                            {customCell !== null && customCell !== undefined
                              ? customCell
                              : defaultRenderCell(item, col)}
                          </td>
                        )
                      })}
                      {hasActions && (
                        <td className="p-3 text-right" style={{ width: widths["__actions"] }}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
                                <MoreVertical className="h-4 w-4 text-gray-600" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel className="text-xs font-semibold text-gray-500">Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />

                              {onView && (
                                <DropdownMenuItem onClick={() => onView(item)} className="cursor-pointer">
                                  <Eye className="mr-2 h-4 w-4 text-blue-600" />
                                  <span>View Details</span>
                                </DropdownMenuItem>
                              )}

                              {onEmail && (
                                <DropdownMenuItem onClick={() => onEmail(item)} className="cursor-pointer">
                                  <Mail className="mr-2 h-4 w-4 text-amber-600" />
                                  <span>Send Email</span>
                                </DropdownMenuItem>
                              )}

                              {onChangePassword && (
                                <DropdownMenuItem onClick={() => onChangePassword(item)} className="cursor-pointer">
                                  <Lock className="mr-2 h-4 w-4 text-purple-600" />
                                  <span>Change Password</span>
                                </DropdownMenuItem>
                              )}

                              {onDisable && (
                                <DropdownMenuItem onClick={() => onDisable(item)} className="cursor-pointer">
                                  <Power className={`mr-2 h-4 w-4 ${item.status === 'Active' ? 'text-orange-600' : 'text-green-600'}`} />
                                  <span>{item.status === 'Active' ? 'Disable Account' : 'Enable Account'}</span>
                                </DropdownMenuItem>
                              )}

                              {onDelete && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => onDelete(item.user?.user_id ?? extractRowId(item))}
                                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Delete</span>
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      )}
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td className="p-3 text-center" colSpan={totalCols}>
                    <div className="flex flex-col items-center justify-center py-12">
                      <img
                        src="/background_pictures/empty_search.jpg"
                        alt="No results"
                        className="w-48 h-48 object-contain opacity-80 mb-4"
                      />
                      <p className="text-sm font-medium text-gray-500">{emptyMessage}</p>
                      <p className="text-xs text-gray-400 mt-1">{emptySubtext}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-3 rounded-lg shadow-sm border border-gray-100">
          <div className="text-xs text-gray-600">
            Showing <span className="font-semibold">{Math.min((currentPage - 1) * rowsPerPage + 1, data.length)}</span> to{" "}
            <span className="font-semibold">{Math.min(currentPage * rowsPerPage, data.length)}</span> of{" "}
            <span className="font-semibold">{data.length}</span> results
          </div>

          <div className="flex gap-2 items-center">
            <select
              value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1) }}
              className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              {rowsPerPageOptions.map((n) => (
                <option key={n} value={n}>{n} rows</option>
              ))}
            </select>

            <Button
              variant="outline" size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="h-8 text-xs"
            >
              Previous
            </Button>
            <span className="text-xs font-medium px-2">{currentPage} / {totalPages || 1}</span>
            <Button
              variant="outline" size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="h-8 text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {showImportModal && (
        <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Preview Imported Data</DialogTitle>
            </DialogHeader>
            <div className="mt-4 max-h-[400px] overflow-auto border rounded">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-100 dark:bg-zinc-800">
                  <tr>
                    {Object.keys(previewData[0] || {}).map((key) => (
                      <th key={key} className="p-2 border font-semibold text-left whitespace-nowrap">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-white dark:bg-zinc-900" : "bg-gray-50 dark:bg-zinc-800"}>
                      {Object.values(row).map((val, i) => (
                        <td key={i} className="p-2 border whitespace-nowrap">{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <DialogFooter className="mt-6 flex justify-end gap-2">
              <Button onClick={() => setShowImportModal(false)} variant="ghost">Cancel</Button>
              <Button onClick={handleComfirmImport} variant="rose">Confirm Import</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

export default SewerTable
