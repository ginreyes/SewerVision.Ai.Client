"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { api } from "@/lib/helper"
import { useAlert } from "@/components/providers/AlertProvider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import {
  ArrowLeft, Search, Shield, AlertTriangle, CheckCircle, Clock,
  Eye, XCircle, Loader2, FileText, Camera, ZoomIn,
  CheckCheck, Ban, Filter,
} from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { API_URL, getSeverityColor } from '@/components/admin/constants'

const QCReviewPage = () => {
  const { project_id } = useParams()
  const router = useRouter()
  const { showAlert } = useAlert()

  const [project, setProject] = useState(null)
  const [detections, setDetections] = useState([])
  const [loading, setLoading] = useState(true)
  const [lightboxUrl, setLightboxUrl] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [actionLoading, setActionLoading] = useState(null)
  const [reviewNotes, setReviewNotes] = useState({}) // { detectionId: 'note text' }

  useEffect(() => { if (project_id) fetchData() }, [project_id])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [projectRes, detectionsRes] = await Promise.all([
        api(`/api/project/get-project/${project_id}`, "GET"),
        api(`/api/qc-technicians/projects/${project_id}/detections`, "GET"),
      ])
      if (projectRes.ok) setProject(projectRes.data?.project || projectRes.data)
      if (detectionsRes.ok) setDetections(detectionsRes.data?.data || detectionsRes.data || [])
    } catch {
      showAlert("Failed to load QC review data", "error")
    } finally { setLoading(false) }
  }

  const handleReview = async (detectionId, status) => {
    setActionLoading(detectionId)
    try {
      const { ok } = await api(`/api/qc-technicians/detections/${detectionId}/review`, "PUT", { qcStatus: status, qcNotes: reviewNotes[detectionId] || '' })
      if (ok) {
        setDetections(prev => prev.map(d => d._id === detectionId ? { ...d, qcStatus: status } : d))
        showAlert(`Detection ${status}`, "success")
      }
    } catch { showAlert("Failed to update detection", "error") }
    finally { setActionLoading(null) }
  }

  const handleBulkReview = async (status) => {
    if (selectedIds.size === 0) return
    setActionLoading("bulk")
    try {
      const promises = [...selectedIds].map(id =>
        api(`/api/qc-technicians/detections/${id}/review`, "PUT", { qcStatus: status })
      )
      await Promise.allSettled(promises)
      setDetections(prev => prev.map(d => selectedIds.has(d._id) ? { ...d, qcStatus: status } : d))
      showAlert(`${selectedIds.size} detection(s) ${status}`, "success")
      setSelectedIds(new Set())
    } catch { showAlert("Bulk action failed", "error") }
    finally { setActionLoading(null) }
  }

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredDetections.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredDetections.map(d => d._id)))
    }
  }

  const getConfidenceDisplay = (c) => Math.round(c > 1 ? c : c * 100)

  const formatTimestamp = (s) => {
    if (!s && s !== 0) return "N/A"
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`
  }

  const filteredDetections = useMemo(() => detections.filter((d) => {
    if (searchQuery && !(d.type?.toLowerCase().includes(searchQuery.toLowerCase()) || d.description?.toLowerCase().includes(searchQuery.toLowerCase()))) return false
    if (severityFilter !== "all" && d.severity?.toLowerCase() !== severityFilter) return false
    if (statusFilter !== "all" && d.qcStatus?.toLowerCase() !== statusFilter) return false
    return true
  }), [detections, searchQuery, severityFilter, statusFilter])

  const stats = useMemo(() => {
    const total = detections.length
    const approved = detections.filter(d => d.qcStatus === "approved").length
    const rejected = detections.filter(d => d.qcStatus === "rejected").length
    const pending = total - approved - rejected
    const critical = detections.filter(d => d.severity?.toLowerCase() === "critical").length
    const reviewedPct = total > 0 ? Math.round(((approved + rejected) / total) * 100) : 0
    return { total, approved, rejected, pending, critical, reviewedPct }
  }, [detections])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500 mr-3" />
        <span className="text-sm text-gray-500">Loading QC review data...</span>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="p-2.5 bg-rose-100 rounded-xl">
            <Shield className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">QC Review</h1>
            <p className="text-xs text-gray-500">{project?.name || "Project"} — {detections.length} detections</p>
          </div>
        </div>
        <Button onClick={() => router.push(`/admin/project/${project_id}`)} className="bg-rose-600 hover:bg-rose-700 text-white text-xs">
          <FileText className="w-3.5 h-3.5 mr-1.5" /> Open Console
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-700">Review Progress</span>
          <span className="text-xs font-bold text-gray-900">{stats.approved + stats.rejected} of {stats.total} reviewed ({stats.reviewedPct}%)</span>
        </div>
        <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
          {stats.approved > 0 && <div className="bg-emerald-500 transition-all" style={{ width: `${(stats.approved / stats.total) * 100}%` }} />}
          {stats.rejected > 0 && <div className="bg-red-400 transition-all" style={{ width: `${(stats.rejected / stats.total) * 100}%` }} />}
          {stats.pending > 0 && <div className="bg-gray-200 transition-all" style={{ width: `${(stats.pending / stats.total) * 100}%` }} />}
        </div>
        <div className="flex items-center gap-4 mt-2 text-[10px] text-gray-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> {stats.approved} Approved</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> {stats.rejected} Rejected</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-200" /> {stats.pending} Pending</span>
          {stats.critical > 0 && <span className="flex items-center gap-1 text-red-600 font-medium"><AlertTriangle className="w-3 h-3" /> {stats.critical} Critical</span>}
        </div>
      </div>

      {/* Filters + Bulk Actions */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input placeholder="Search detections..." className="pl-10 h-9 text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-full sm:w-[140px] h-9 text-xs"><SelectValue placeholder="Severity" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[140px] h-9 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-500 font-medium">{selectedIds.size} selected</span>
            <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleBulkReview("approved")} disabled={actionLoading === "bulk"}>
              <CheckCheck className="w-3 h-3 mr-1" /> Approve All
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs border-red-300 text-red-600 hover:bg-red-50" onClick={() => handleBulkReview("rejected")} disabled={actionLoading === "bulk"}>
              <Ban className="w-3 h-3 mr-1" /> Reject All
            </Button>
            <button className="text-[10px] text-gray-400 hover:text-gray-600 ml-auto" onClick={() => setSelectedIds(new Set())}>Clear selection</button>
          </div>
        )}
      </div>

      {/* Select All */}
      {filteredDetections.length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <button onClick={toggleSelectAll} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700">
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${selectedIds.size === filteredDetections.length ? 'bg-rose-600 border-rose-600' : 'border-gray-300'}`}>
              {selectedIds.size === filteredDetections.length && <CheckCircle className="w-3 h-3 text-white" />}
            </div>
            Select all ({filteredDetections.length})
          </button>
        </div>
      )}

      {/* Detection Grid */}
      {filteredDetections.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
          <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-gray-700 mb-1">No detections found</h3>
          <p className="text-xs text-gray-400">
            {searchQuery || severityFilter !== "all" || statusFilter !== "all" ? "Try adjusting your filters." : "No AI detections for this project."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDetections.map((det) => {
            const isSelected = selectedIds.has(det._id)
            const imgUrl = det.images?.[0]?.url ? `${API_URL}/api/videos/snapshot/${det.images[0].url}` : null
            const isPending = !det.qcStatus || det.qcStatus === "pending"
            const isApproved = det.qcStatus === "approved"
            const isRejected = det.qcStatus === "rejected"

            return (
              <div
                key={det._id}
                className={`bg-white rounded-xl border overflow-hidden transition-all hover:shadow-md ${
                  isSelected ? 'border-rose-300 ring-2 ring-rose-100' : 'border-gray-100'
                }`}
              >
                {/* Image */}
                {imgUrl && (
                  <div className="relative group cursor-pointer" onClick={() => setLightboxUrl(imgUrl)}>
                    <img src={imgUrl} alt={det.type} className="w-full h-44 object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-black/60 rounded text-white text-[10px]">
                      <Camera className="h-2.5 w-2.5" /> Frame {det.frameNumber || formatTimestamp(det.timestamp)}
                    </div>
                    {/* Select checkbox */}
                    <button
                      className={`absolute top-2 left-2 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-rose-600 border-rose-600' : 'bg-white/80 border-gray-300 hover:border-rose-400'
                      }`}
                      onClick={(e) => { e.stopPropagation(); toggleSelect(det._id); }}
                    >
                      {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                    </button>
                  </div>
                )}

                <div className="p-4">
                  {/* Type + severity + status */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-sm font-bold text-gray-900 capitalize">{det.type?.replace(/_/g, " ") || "Unknown"}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border capitalize font-medium ${getSeverityColor(det.severity)}`}>
                      {det.severity || "N/A"}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      isApproved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      isRejected ? 'bg-red-50 text-red-700 border border-red-200' :
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {det.qcStatus || "pending"}
                    </span>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-3 text-[10px] text-gray-500 mb-3">
                    <span>Confidence: <strong className="text-gray-700">{getConfidenceDisplay(det.confidence)}%</strong></span>
                    <span>Time: <strong className="text-gray-700">{formatTimestamp(det.timestamp)}</strong></span>
                  </div>

                  {/* Review Notes */}
                  {isPending && (
                    <textarea
                      placeholder="Add review notes (optional)..."
                      value={reviewNotes[det._id] || ''}
                      onChange={(e) => setReviewNotes(prev => ({ ...prev, [det._id]: e.target.value }))}
                      className="w-full text-xs border border-gray-200 rounded-lg p-2 mb-2 resize-none h-16 focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                    />
                  )}
                  {det.qcNotes && !isPending && (
                    <div className="text-xs bg-gray-50 rounded-lg p-2 mb-2 text-gray-600 italic border border-gray-100">
                      <span className="font-medium text-gray-700 not-italic">Note:</span> {det.qcNotes}
                    </div>
                  )}

                  {/* Inline Approve/Reject */}
                  {isPending && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => handleReview(det._id, "approved")}
                        disabled={actionLoading === det._id}
                      >
                        {actionLoading === det._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <><CheckCircle className="w-3 h-3 mr-1" /> Approve</>}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-8 text-xs border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => handleReview(det._id, "rejected")}
                        disabled={actionLoading === det._id}
                      >
                        <XCircle className="w-3 h-3 mr-1" /> Reject
                      </Button>
                    </div>
                  )}

                  {/* Already reviewed indicator */}
                  {!isPending && (
                    <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg ${
                      isApproved ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {isApproved ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {isApproved ? 'Approved' : 'Rejected'}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Keyboard Shortcuts Hint */}
      <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-gray-400 bg-gray-50 rounded-lg py-2 px-4">
        <span><kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded text-[9px] font-mono">A</kbd> Approve</span>
        <span><kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded text-[9px] font-mono">R</kbd> Reject</span>
        <span><kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded text-[9px] font-mono">↑↓</kbd> Navigate</span>
        <span><kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded text-[9px] font-mono">Esc</kbd> Deselect</span>
      </div>

      {/* Footer */}
      <div className="mt-6 flex justify-between items-center">
        <Button variant="outline" onClick={() => router.back()} className="text-xs">
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back
        </Button>
        <Button onClick={() => router.push(`/admin/project/${project_id}`)} className="bg-rose-600 hover:bg-rose-700 text-white text-xs">
          <FileText className="w-3.5 h-3.5 mr-1.5" /> Open Project Console
        </Button>
      </div>

      {/* Lightbox */}
      <Dialog open={Boolean(lightboxUrl)} onOpenChange={(open) => !open && setLightboxUrl(null)}>
        <DialogContent className="max-w-4xl bg-black/90 border-none p-0 sm:rounded-xl overflow-hidden [&>button]:text-white">
          <DialogTitle className="sr-only">Detection snapshot</DialogTitle>
          {lightboxUrl && (
            <img
              src={lightboxUrl}
              alt="Detection"
              className="w-full max-h-[85vh] object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default QCReviewPage
