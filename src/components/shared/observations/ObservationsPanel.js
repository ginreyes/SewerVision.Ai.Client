"use client";

import { useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Eye,
  Edit3,
  PlayCircle,
  Trash2,
  Bot,
  ImageIcon,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import ObservationFilterPopover from "./ObservationFilter";
import ObservationAction from "./ObservationAction";
import { api } from "@/lib/helper";
import { getSnapshotUrl } from "@/lib/getVideoUrl";

const severityConfig = {
  high:   { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500", label: "High" },
  medium: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500", label: "Medium" },
  low:    { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", dot: "bg-green-500", label: "Low" },
};

const roleThemes = {
  rose:   { btn: 'bg-rose-600 hover:bg-rose-700 text-white', badge: 'bg-rose-100 text-rose-700', outline: 'border-rose-300 text-rose-600 hover:bg-rose-50' },
  blue:   { btn: 'bg-blue-600 hover:bg-blue-700 text-white', badge: 'bg-blue-100 text-blue-700', outline: 'border-blue-300 text-blue-600 hover:bg-blue-50' },
  indigo: { btn: 'bg-indigo-600 hover:bg-indigo-700 text-white', badge: 'bg-indigo-100 text-indigo-700', outline: 'border-indigo-300 text-indigo-600 hover:bg-indigo-50' },
};

const ObservationsPanel = (props) => {
  const {
    observations = [],
    onAddObservation,
    pacpCodes,
    projectId,
    page = 1,
    pageSize = 20,
    total = 0,
    onPageChange,
    onGoToTime,
    onViewDetail,
    onDeleteObservation,
    theme = 'rose',
  } = props;

  const rt = roleThemes[theme] || roleThemes.rose;

  const [isExpanded, setIsExpanded] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCode, setFilterCode] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("");
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [denseRows, setDenseRows] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const py = denseRows ? "py-1.5" : "py-2.5";
  const px = "px-3";
  const textSize = denseRows ? "text-xs" : "text-[13px]";

  const filteredObservations = observations.filter((obs) => {
    if (filterCode) {
      const code = String(obs.pacpCode || "").toUpperCase();
      if (!code.startsWith(String(filterCode).toUpperCase())) return false;
    }
    if (filterSeverity) {
      const sev = String(obs.severity || "").toLowerCase();
      if (!sev.includes(filterSeverity.toLowerCase())) return false;
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        (obs.observation || "").toLowerCase().includes(q) ||
        (obs.remarks || "").toLowerCase().includes(q) ||
        (obs.pacpCode || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopyAll = async () => {
    try {
      if (!filteredObservations.length) { setShowActions(false); return; }
      const header = ["#", "Distance", "PACP Code", "Observation", "Time", "Severity", "Remarks"];
      const lines = filteredObservations.map((obs, idx) => [
        idx + 1 + (page - 1) * pageSize, obs.distance ?? "", obs.pacpCode ?? "",
        obs.observation ?? "", obs.time ?? "", obs.severity ?? "", obs.remarks ?? "",
      ].join("\t"));
      await navigator.clipboard?.writeText([header.join("\t"), ...lines].join("\n"));
    } catch {} finally { setShowActions(false); }
  };

  const handleDelete = async (obs) => {
    setDeleting(true);
    try {
      const { ok } = await api(`/api/observations/delete-observation/${obs._id}`, "DELETE");
      if (ok && onDeleteObservation) onDeleteObservation(obs._id);
    } catch {} finally { setDeleting(false); setDeleteConfirm(null); }
  };

  const getSnapshotSrc = (url) => {
    return getSnapshotUrl(url);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="border-b border-gray-100 px-5 py-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-gray-800 hover:text-gray-900 transition-colors"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              <span className="font-semibold text-sm tracking-wide uppercase">Observations</span>
            </button>
            {total > 0 && (
              <span className={`inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full ${rt.badge} text-[10px] font-bold`}>
                {total}
              </span>
            )}
          </div>
          <Button
            onClick={onAddObservation}
            size="sm"
            className={`${rt.btn} text-xs h-8 px-3 rounded-lg`}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Observation
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4">
          {/* Search + Filter */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search observations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-20 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <div className="relative">
                  <button
                    onClick={() => setShowFilter(!showFilter)}
                    className={`px-2.5 py-1 text-xs rounded-md flex items-center gap-1 transition-colors ${
                      filterCode || filterSeverity
                        ? rt.badge
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Filter className="h-3 w-3" />
                    <span>Filter</span>
                  </button>
                  {showFilter && (
                    <ObservationFilterPopover
                      pacpCodes={pacpCodes}
                      code={filterCode}
                      severity={filterSeverity}
                      onClose={() => setShowFilter(false)}
                      onApply={(code, severity) => {
                        setFilterCode(code || "");
                        setFilterSeverity(severity || "");
                        setShowFilter(false);
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <MoreHorizontal className="h-4 w-4 text-gray-500" />
              </button>
              {showActions && (
                <ObservationAction
                  onClose={() => setShowActions(false)}
                  onExport={() => {}}
                  onCopy={handleCopyAll}
                  onShare={() => {}}
                  onSettings={() => { setDenseRows((p) => !p); setShowActions(false); }}
                />
              )}
            </div>
          </div>

          {/* Table */}
          {filteredObservations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-500 mb-1">No observations found</p>
              <p className="text-xs text-gray-400">
                {searchTerm || filterCode || filterSeverity
                  ? "Try adjusting your search or filters"
                  : "Add observations manually or run AI processing"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80">
                    {["#", "Distance", "PACP Code", "Observation", "Severity", "Time", "Snapshot", ""].map((h) => (
                      <th key={h} className={`${py} ${px} text-left text-[11px] font-semibold text-gray-500 dark:!text-gray-300 uppercase tracking-wider ${h === "" ? "w-10" : ""}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredObservations.map((obs, index) => {
                    const sev = severityConfig[obs.severity] || severityConfig.low;
                    const confidence = obs.confidence != null
                      ? (obs.confidence > 1 ? obs.confidence : Math.round(obs.confidence * 100))
                      : null;
                    const snapshotSrc = getSnapshotSrc(obs.snapshotUrl);

                    return (
                      <tr
                        key={obs._id}
                        onClick={() => setSelectedRowId(obs._id)}
                        onDoubleClick={() => onViewDetail?.(obs)}
                        className={`group cursor-pointer transition-colors ${
                          selectedRowId === obs._id ? "bg-blue-50/60" : "hover:bg-gray-50/60"
                        }`}
                      >
                        <td className={`${py} ${px} ${textSize} text-gray-400 dark:!text-gray-300 font-mono`}>
                          {index + 1 + (page - 1) * pageSize}
                        </td>
                        <td className={`${py} ${px} ${textSize} font-medium text-gray-700 dark:!text-gray-100`}>
                          {obs.distance}
                        </td>
                        <td className={`${py} ${px} ${textSize}`}>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                              {obs.pacpCode}
                            </span>
                            {obs.aiGenerated && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-violet-50 text-violet-600 border border-violet-100">
                                <Bot className="h-2.5 w-2.5" />
                                AI{confidence != null ? ` ${confidence}%` : ""}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className={`${py} ${px} ${textSize} text-gray-600 dark:!text-gray-200 max-w-[200px] truncate`}>
                          {obs.observation}
                        </td>
                        <td className={`${py} ${px} ${textSize}`}>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${sev.bg} ${sev.text} ${sev.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
                            {sev.label}
                          </span>
                        </td>
                        <td className={`${py} ${px} ${textSize} text-gray-500 dark:!text-gray-300 font-mono`}>
                          {obs.time}
                        </td>
                        <td className={`${py} ${px}`}>
                          {snapshotSrc ? (
                            <div className="w-10 h-7 rounded overflow-hidden border border-gray-200 bg-gray-100">
                              <img
                                src={snapshotSrc}
                                alt="snapshot"
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                            </div>
                          ) : obs.snapshot ? (
                            <ImageIcon className="h-4 w-4 text-blue-400" />
                          ) : (
                            <span className="text-gray-300 text-[10px]">—</span>
                          )}
                        </td>
                        <td className={`${py} ${px}`} onClick={(e) => e.stopPropagation()}>
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="p-1 rounded hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4 text-gray-400" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-44 p-1.5" align="end">
                              <DropdownItem
                                icon={<Eye className="h-3.5 w-3.5" />}
                                label="View Details"
                                onClick={() => onViewDetail?.(obs)}
                              />
                              <DropdownItem
                                icon={<Edit3 className="h-3.5 w-3.5" />}
                                label="Edit"
                                onClick={() => onViewDetail?.(obs)}
                              />
                              <DropdownItem
                                icon={<PlayCircle className="h-3.5 w-3.5" />}
                                label="Go to Time"
                                onClick={() => onGoToTime?.(obs)}
                              />
                              <hr className="my-1 border-gray-100" />
                              <DropdownItem
                                icon={<Trash2 className="h-3.5 w-3.5" />}
                                label="Delete"
                                className="text-red-600 hover:bg-red-50"
                                onClick={() => setDeleteConfirm(obs)}
                              />
                            </PopoverContent>
                          </Popover>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {onPageChange && total > pageSize && (
            <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
              <span>
                {Math.min(1 + (page - 1) * pageSize, total)}–{Math.min(page * pageSize, total)} of {total}
              </span>
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="sm" className="h-7 px-2 text-xs" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
                  Prev
                </Button>
                <span className="px-2 text-xs text-gray-600 font-medium">{page}</span>
                <Button variant="outline" size="sm" className="h-7 px-2 text-xs" disabled={page * pageSize >= total} onClick={() => onPageChange(page + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-[400px]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Delete Observation</h3>
                <p className="text-xs text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              Are you sure you want to delete the observation <strong>{deleteConfirm.pacpCode}</strong> at distance {deleteConfirm.distance}?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(null)} disabled={deleting}>
                Cancel
              </Button>
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => handleDelete(deleteConfirm)} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DropdownItem = ({ icon, label, onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={`w-full px-2.5 py-1.5 text-left text-[13px] text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-2 transition-colors ${className}`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default ObservationsPanel;
