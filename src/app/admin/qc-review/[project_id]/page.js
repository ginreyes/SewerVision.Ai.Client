"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { api } from "@/lib/helper"
import { useAlert } from "@/components/providers/AlertProvider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import {
  ArrowLeft,
  Search,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  XCircle,
  Loader2,
  FileText,
  Filter,
} from "lucide-react"

const QCReviewPage = () => {
  const { project_id } = useParams()
  const router = useRouter()
  const { showAlert } = useAlert()

  const [project, setProject] = useState(null)
  const [detections, setDetections] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    if (project_id) {
      fetchData()
    }
  }, [project_id])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [projectRes, detectionsRes] = await Promise.all([
        api(`/api/project/get-project/${project_id}`, "GET"),
        api(`/api/qc-technicians/projects/${project_id}/detections`, "GET"),
      ])

      if (projectRes.ok) {
        setProject(projectRes.data?.project || projectRes.data)
      }

      if (detectionsRes.ok) {
        setDetections(detectionsRes.data?.data || detectionsRes.data || [])
      }
    } catch (error) {
      console.error("Error fetching QC review data:", error)
      showAlert("Failed to load QC review data", "error")
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity) => {
    const colors = {
      critical: "bg-red-100 text-red-800 border-red-200",
      major: "bg-orange-100 text-orange-800 border-orange-200",
      moderate: "bg-yellow-100 text-yellow-800 border-yellow-200",
      minor: "bg-blue-100 text-blue-800 border-blue-200",
    }
    return colors[severity?.toLowerCase()] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-amber-600" />
    }
  }

  const getConfidenceDisplay = (confidence) => {
    const val = confidence > 1 ? confidence : confidence * 100
    return Math.round(val)
  }

  const formatTimestamp = (seconds) => {
    if (!seconds && seconds !== 0) return "N/A"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const filteredDetections = useMemo(() => {
    return detections.filter((d) => {
      const matchesSearch =
        !searchQuery ||
        d.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.notes?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesSeverity =
        severityFilter === "all" || d.severity?.toLowerCase() === severityFilter

      const matchesStatus =
        statusFilter === "all" || d.qcStatus?.toLowerCase() === statusFilter

      return matchesSearch && matchesSeverity && matchesStatus
    })
  }, [detections, searchQuery, severityFilter, statusFilter])

  const stats = useMemo(() => {
    const total = detections.length
    const approved = detections.filter((d) => d.qcStatus === "approved").length
    const rejected = detections.filter((d) => d.qcStatus === "rejected").length
    const pending = total - approved - rejected
    const critical = detections.filter((d) => d.severity?.toLowerCase() === "critical").length
    return { total, approved, rejected, pending, critical }
  }, [detections])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-rose-500 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading QC review data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Shield className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">QC Review - Defect Details</h1>
              <p className="text-sm text-gray-500">{project?.name || "Project"} - {detections.length} defects detected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-500">Total Defects</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                <p className="text-xs text-gray-500">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                <p className="text-xs text-gray-500">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.critical}</p>
                <p className="text-xs text-gray-500">Critical</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search defects by type, description..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="major">Major</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="minor">Minor</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="QC Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Detections List */}
      {filteredDetections.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No defects found</h3>
            <p className="text-sm text-gray-500">
              {searchQuery || severityFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your filters."
                : "No AI detections found for this project."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredDetections.map((detection, index) => (
            <Card key={detection._id || index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-bold text-gray-900 capitalize">
                        {detection.type?.replace(/_/g, " ") || "Unknown Type"}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${getSeverityColor(detection.severity)}`}>
                        {detection.severity || "N/A"}
                      </span>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(detection.qcStatus)}
                        <span className="text-xs text-gray-500 capitalize">{detection.qcStatus || "pending"}</span>
                      </div>
                    </div>
                    {detection.description && (
                      <p className="text-sm text-gray-600 mb-2">{detection.description}</p>
                    )}
                    {detection.notes && (
                      <p className="text-xs text-gray-500 italic mb-2">Note: {detection.notes}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Confidence: <strong className="text-gray-700">{getConfidenceDisplay(detection.confidence)}%</strong></span>
                      <span>Timestamp: <strong className="text-gray-700">{formatTimestamp(detection.timestamp)}</strong></span>
                      {detection.location && (
                        <span>Location: <strong className="text-gray-700">{detection.location}</strong></span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Footer Actions */}
      <div className="mt-6 flex justify-between items-center">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button onClick={() => router.push(`/admin/project/${project_id}`)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <FileText className="w-4 h-4 mr-2" /> Open Project Console
        </Button>
      </div>
    </div>
  )
}

export default QCReviewPage
