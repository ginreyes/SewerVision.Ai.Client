"use client"

import React, { useState } from "react"
import {
  Eye,
  Trash2,
  Mail,
  Power,
  MoreVertical,
  Edit
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
  DialogTrigger,
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




const SewerTable = (props) => {

  const {
    data = [],
    columns = [],
    filters = [],
    search = "",
    onSearch = () => { },
    onFilterChange = () => { },
    loading = false,
    ButtonPlacement = null,
    onDelete = () => { },
    onView = () => { },
    onDisable = null,
    onEmail = null,
    selectedRows: externalSelectedRows = [],
    onSelectionChange = null,
  } = props


  const [previewData, setPreviewData] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [internalSelectedRows, setInternalSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Use external selection if provided, otherwise use internal state
  const selectedRows = onSelectionChange ? externalSelectedRows : internalSelectedRows;
  const setSelectedRows = onSelectionChange || setInternalSelectedRows;

  const totalPages = Math.ceil(data.length / rowsPerPage);

  // Paginate data
  const paginatedData = data.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Checkbox handlers
  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      const newSelection = paginatedData.map((row) => row.user?.user_id ?? row.id ?? row);
      setSelectedRows(newSelection);
    } else {
      setSelectedRows([]);
    }
  };

  const toggleRowSelection = (id) => {
    const newSelection = selectedRows.includes(id) 
      ? selectedRows.filter((x) => x !== id) 
      : [...selectedRows, id];
    setSelectedRows(newSelection);
  };

  const isAllSelected = paginatedData.length > 0 && paginatedData.every((row) =>
    selectedRows.includes(row.user?.user_id ?? row.id ?? row)
  );

  const exportToCSV = (columns, data, filename = "export.csv") => {
    const headers = columns.map(col => col.name)
    const rows = data.map(row =>
      columns.map(col => {
        const value = row[col.key]
        if (typeof value === "object" && value.name) return `"${value.name}"`
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
  };

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
    setShowImportModal(false);
  }





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

          {/* import and export */}
          <div className="flex gap-2 items-center">
            <input
              placeholder="Search users..."
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              className="w-[200px] h-9 text-xs rounded-md border border-gray-300 dark:border-zinc-700 px-3 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <Select onValueChange={(val) => {
              if (val === "export") {
                exportToCSV(columns, data)
              } else if (val === "import") {
                document.getElementById("csvInput").click()
              }
            }}>
              <SelectTrigger className="w-[130px] h-9 text-xs rounded-md border-gray-300 dark:border-zinc-700">
                <SelectValue placeholder="CSV Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="export" className="text-xs">Export CSV</SelectItem>
                <SelectItem value="import" className="text-xs">Import CSV</SelectItem>
              </SelectContent>
            </Select>

            <input
              type="file"
              id="csvInput"
              accept=".csv"
              className="hidden"
              onChange={handleCSVImport}
            />

            {ButtonPlacement}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-gray-100 overflow-auto">
          <table className="w-full table-auto text-sm">
            <thead className="bg-gray-50 dark:bg-zinc-800 text-left text-xs font-semibold text-gray-600">
              <tr>
                <th className="p-3">
                  <input
                    type="checkbox"
                    onChange={toggleSelectAll}
                    checked={paginatedData.length > 0 && isAllSelected}
                    className="rounded border-gray-300"
                  />
                </th>
                {columns.map((col) => (
                  <th key={col.key} className="p-3">{col.name}</th>
                ))}
                <th className="p-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="text-zinc-700 dark:text-zinc-300">
              {loading ? (
                <tr>
                  <td className="p-3 text-center" colSpan={columns.length + 2}>
                    <div className="flex items-center justify-center gap-2 py-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-rose-500"></div>
                      <span className="text-gray-500">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((item, idx) => {
                  const rowId = item.user?.user_id ?? item.id ?? idx;
                  const isChecked = selectedRows.includes(rowId);

                  return (
                    <tr
                      key={rowId}
                      className="border-t border-gray-100 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleRowSelection(rowId)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      {columns.map((col) => {
                        const value = item[col.key];
                        if (col.key === "user" && typeof value === "object") {
                          const avatarUrl = value.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(value.name)}&background=random&color=fff`;
                          return (
                            <td key={col.key} className="p-3">
                              <div className="flex items-center gap-3">
                                <img src={avatarUrl} alt={value.name} className="w-9 h-9 rounded-full object-cover shadow-sm" />
                                <div>
                                  <div className="font-medium text-sm">{value.name}</div>
                                  <div className="text-xs text-gray-500">{value.email}</div>
                                </div>
                              </div>
                            </td>
                          );
                        } else if (col.key === "status") {
                          const statusClasses = {
                            Active: "bg-green-100 text-green-700",
                            Inactive: "bg-gray-100 text-gray-600",
                            Pending: "bg-amber-100 text-amber-700",
                          };
                          return (
                            <td key={col.key} className="p-3">
                              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusClasses[value] || ""}`}>
                                {value}
                              </span>
                            </td>
                          );
                        }
                        return <td key={col.key} className="p-3 capitalize text-sm">{value}</td>;
                      })}
                      <td className="p-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 hover:bg-gray-100"
                            >
                              <MoreVertical className="h-4 w-4 text-gray-600" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel className="text-xs font-semibold text-gray-500">
                              Actions
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            
                            {onView && (
                              <DropdownMenuItem 
                                onClick={() => onView(item)}
                                className="cursor-pointer"
                              >
                                <Eye className="mr-2 h-4 w-4 text-blue-600" />
                                <span>View Details</span>
                              </DropdownMenuItem>
                            )}
                            
                            {onEmail && (
                              <DropdownMenuItem 
                                onClick={() => onEmail(item)}
                                className="cursor-pointer"
                              >
                                <Mail className="mr-2 h-4 w-4 text-amber-600" />
                                <span>Send Email</span>
                              </DropdownMenuItem>
                            )}
                            
                            {onDisable && (
                              <DropdownMenuItem 
                                onClick={() => onDisable(item)}
                                className="cursor-pointer"
                              >
                                <Power 
                                  className={`mr-2 h-4 w-4 ${item.status === 'Active' ? 'text-orange-600' : 'text-green-600'}`} 
                                />
                                <span>
                                  {item.status === 'Active' ? 'Disable Account' : 'Enable Account'}
                                </span>
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuSeparator />
                            
                            {onDelete && (
                              <DropdownMenuItem 
                                onClick={() => onDelete(item.user?.user_id)}
                                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete User</span>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="p-8 text-center" colSpan={columns.length + 2}>
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-sm font-medium">No users found</p>
                      <p className="text-xs">Try adjusting your filters or search query</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-3 rounded-lg shadow-sm border border-gray-100">
          <div className="text-xs text-gray-600">
            Showing <span className="font-semibold">{Math.min((currentPage - 1) * rowsPerPage + 1, data.length)}</span> to{" "}
            <span className="font-semibold">{Math.min(currentPage * rowsPerPage, data.length)}</span> of{" "}
            <span className="font-semibold">{data.length}</span> results
          </div>

          <div className="flex gap-2 items-center">
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>{n} rows</option>
              ))}
            </select>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="h-8 text-xs"
            >
              Previous
            </Button>
            <span className="text-xs font-medium px-2">{currentPage} / {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
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
              <DialogTitle>📋 Preview Imported Data</DialogTitle>
            </DialogHeader>

            {/* Table Container */}
            <div className="mt-4 max-h-[400px] overflow-auto border rounded">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-100 dark:bg-zinc-800">
                  <tr>
                    {Object.keys(previewData[0] || {}).map((key) => (
                      <th
                        key={key}
                        className="p-2 border font-semibold text-left whitespace-nowrap"
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, idx) => (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? "bg-white dark:bg-zinc-900" : "bg-gray-50 dark:bg-zinc-800"}
                    >
                      {Object.values(row).map((val, i) => (
                        <td key={i} className="p-2 border whitespace-nowrap">
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer Buttons */}
            <DialogFooter className="mt-6 flex justify-end gap-2">
              <Button
                onClick={() => setShowImportModal(false)}
                variant='ghost'
              >
                Cancel
              </Button>
              <Button
                onClick={handleComfirmImport}
                variant='rose'
              >
                Confirm Import
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}



    </>
  )
}

export default SewerTable
