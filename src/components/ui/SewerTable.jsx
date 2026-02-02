"use client"

import React, { useState } from "react"
import {
  Eye,
  Trash2,
  Mail,
  Power
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
  } = props


  const [previewData, setPreviewData] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);


  const totalPages = Math.ceil(data.length / rowsPerPage);

  // Paginate data
  const paginatedData = data.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Checkbox handlers
  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(paginatedData.map((row) => row.user?.user_id ?? row.id ?? row));
    } else {
      setSelectedRows([]);
    }
  };

  const toggleRowSelection = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const isAllSelected = paginatedData.every((row) =>
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
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Filter Bar */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-lg flex flex-wrap gap-4 items-center justify-between">

          <div className="flex flex-wrap gap-4">
            {filters.map(({ key, label, options }) => (
              <Select key={key} onValueChange={(val) => onFilterChange(key, val)}>
                <SelectTrigger className="w-[160px] rounded-md border-zinc-300 dark:border-zinc-700">
                  <SelectValue placeholder={label} />
                </SelectTrigger>
                <SelectContent>
                  {options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
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
              placeholder="Search..."
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              className="w-[220px] rounded-md border border-zinc-300 dark:border-zinc-700 p-2"
            />
            <Select onValueChange={(val) => {
              if (val === "export") {
                exportToCSV(columns, data)
              } else if (val === "import") {
                document.getElementById("csvInput").click()
              }
            }}>
              <SelectTrigger className="w-[140px] rounded-md border-zinc-300 dark:border-zinc-700">
                <SelectValue placeholder="CSV Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="export">Export CSV</SelectItem>
                <SelectItem value="import">Import CSV</SelectItem>
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
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg overflow-auto">
          <table className="w-full table-auto text-sm">
            <thead className="bg-zinc-100 dark:bg-zinc-800 text-left text-xs font-semibold text-zinc-500">
              <tr>
                <th className="p-4">
                  <input
                    type="checkbox"
                    onChange={toggleSelectAll}
                    checked={paginatedData.length > 0 && isAllSelected}
                  />
                </th>
                {columns.map((col) => (
                  <th key={col.key} className="p-4">{col.name}</th>
                ))}
                <th className="p-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="text-zinc-700 dark:text-zinc-300">
              {loading ? (
                <tr>
                  <td className="p-4" colSpan={columns.length + 2}>Loading...</td>
                </tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((item, idx) => {
                  const rowId = item.user?.user_id ?? item.id ?? idx;
                  const isChecked = selectedRows.includes(rowId);

                  return (
                    <tr key={rowId} className="border-t hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleRowSelection(rowId)}
                        />
                      </td>
                      {columns.map((col) => {
                        const value = item[col.key];
                        if (col.key === "user" && typeof value === "object") {
                          const avatarUrl = value.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(value.name)}&background=random&color=fff`;
                          return (
                            <td key={col.key} className="p-4 flex items-center gap-3">
                              <img src={avatarUrl} alt={value.name} className="w-10 h-10 rounded-full object-cover shadow-sm" />
                              <div>
                                <div className="font-medium">{value.name}</div>
                                <div className="text-xs text-zinc-500">{value.email}</div>
                              </div>
                            </td>
                          );
                        } else if (col.key === "status") {
                          const statusClasses = {
                            Active: "bg-green-100 text-green-600",
                            Inactive: "bg-gray-100 text-gray-500",
                            Pending: "bg-yellow-100 text-yellow-700",
                          };
                          return (
                            <td key={col.key} className="p-4">
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClasses[value] || ""}`}>
                                {value}
                              </span>
                            </td>
                          );
                        }
                        return <td key={col.key} className="p-4 capitalize">{value}</td>;
                      })}
                      <td className="p-4 text-right flex justify-end gap-2">
                        {onView && (
                          <button onClick={() => onView(item)} title="View" className="text-blue-600 hover:scale-110 transition-transform">
                            <Eye size={18} />
                          </button>
                        )}

                        {onEmail && (
                          <button onClick={() => onEmail(item)} title="Send Email" className="text-yellow-500 hover:scale-110 transition-transform">
                            <Mail size={18} />
                          </button>
                        )}

                        {onDisable && (
                          <button
                            onClick={() => onDisable(item)}
                            title={item.status === 'Active' ? "Disable Account" : "Enable Account"}
                            className={`${item.status === 'Active' ? 'text-orange-500' : 'text-green-500'} hover:scale-110 transition-transform`}
                          >
                            <Power size={18} />
                          </button>
                        )}

                        {onDelete && (
                          <button onClick={() => onDelete(item.user?.user_id)} title="Delete" className="text-red-500 hover:scale-110 transition-transform">
                            <Trash2 size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="p-4 text-center" colSpan={columns.length + 2}>No data found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-zinc-500">
            Showing {Math.min((currentPage - 1) * rowsPerPage + 1, data.length)}–
            {Math.min(currentPage * rowsPerPage, data.length)} of {data.length}
          </div>

          <div className="flex gap-2 items-center">
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border rounded px-2 py-1"
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>{n} rows</option>
              ))}
            </select>

            <Button
              variant="ghost"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Prev
            </Button>
            <span className="text-sm">{currentPage} / {totalPages}</span>
            <Button
              variant="ghost"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
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
