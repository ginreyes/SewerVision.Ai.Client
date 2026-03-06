'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  FileCheck, Download, Eye, Calendar, Award, CheckCircle, Clock,
  AlertCircle, ExternalLink, Plus, Pencil, Paperclip, LayoutGrid,
  LayoutList, FileText, Search, X, Shield, RefreshCw, ChevronDown,
  Trash2, ArrowUpDown, Filter
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUser } from '@/components/providers/UserContext'
import { api } from '@/lib/helper'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import qcApi from '@/data/qcApi'
import { useAlert } from '@/components/providers/AlertProvider'

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

const CertCardSkeleton = () => (
  <Card className="animate-pulse">
    <CardContent className="pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-48" />
              <div className="h-3 bg-gray-200 rounded w-32" />
            </div>
            <div className="h-6 bg-gray-200 rounded-full w-20" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-3 bg-gray-200 rounded w-28" />
            <div className="h-3 bg-gray-200 rounded w-28" />
            <div className="h-3 bg-gray-200 rounded w-20" />
          </div>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-9 h-9 rounded-md bg-gray-200" />
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

const ExpiryProgress = ({ issueDate, expiryDate, status }) => {
  const now = new Date()
  const start = new Date(issueDate)
  const end = new Date(expiryDate)
  const total = end - start
  const elapsed = now - start
  const pct = total > 0 ? Math.min(100, Math.max(0, (elapsed / total) * 100)) : 100

  const daysLeft = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)))

  let barColor = 'bg-emerald-500'
  if (status === 'expired' || daysLeft === 0) barColor = 'bg-red-500'
  else if (status === 'expiring' || daysLeft <= 30) barColor = 'bg-amber-500'

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
        <span>Validity</span>
        <span className="font-medium">
          {status === 'expired' ? 'Expired' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
        </span>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
};

const EmptyState = ({ filter, onAdd }) => (
  <Card className="border-dashed border-2 border-gray-200">
    <CardContent className="py-16 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-50 mb-4">
        <Award className="w-8 h-8 text-rose-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        {filter === 'all' ? 'No certifications yet' : `No ${filter} certifications`}
      </h3>
      <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
        {filter === 'all'
          ? 'Start tracking your professional certifications by adding your first one.'
          : `You don't have any certifications with "${filter}" status.`}
      </p>
      {filter === 'all' && (
        <Button onClick={onAdd} variant="rose" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Your First Certification
        </Button>
      )}
    </CardContent>
  </Card>
);

const StatCard = ({ icon: Icon, value, label, gradient, onClick, isActive }) => (
  <button
    type="button"
    onClick={onClick}
    className={`bg-white rounded-xl border p-4 hover:shadow-md transition-all text-left w-full
      ${isActive ? 'border-rose-300 ring-2 ring-rose-100' : 'border-gray-100'}`}
  >
    <div className="flex items-center justify-between">
      <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
    <div className="mt-3">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </button>
);

const defaultFormData = {
  name: '',
  issuer: '',
  issueDate: '',
  expiryDate: '',
  credentialId: '',
  description: '',
  category: '',
  skills: '',
  verificationUrl: '',
  fileUrl: '',
  status: 'active'
}


const CertificationsPage = () => {
  const [filter, setFilter] = useState('all')
  const [selectedCert, setSelectedCert] = useState(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [certToDelete, setCertToDelete] = useState(null)
  const [certifications, setCertifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editingCert, setEditingCert] = useState(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [layout, setLayout] = useState('card')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest') // newest | expiringSoon | name
  const [formData, setFormData] = useState(defaultFormData)

  const { userId } = useUser()
  const { showAlert } = useAlert()

  // ─── Fetch certifications ──────────────────────────────────────
  const fetchCerts = useCallback(async () => {
    if (!userId) return
    try {
      setLoading(true)
      const data = await qcApi.getCertifications(userId)
      console.log('Fetched certifications:', data)
      setCertifications(data || [])
    } catch (err) {
      console.error('Error fetching certifications:', err.message)
      showAlert('Failed to load certifications.', 'error')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchCerts()
  }, [fetchCerts])

  // ─── Filtered + sorted certifications ──────────────────────────
  const filteredCertifications = useMemo(() => {
    let result = certifications

    // Status filter
    if (filter !== 'all') {
      result = result.filter(c => c.status === filter)
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.issuer?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q) ||
        c.credentialId?.toLowerCase().includes(q) ||
        (c.skills || []).some(s => s.toLowerCase().includes(q))
      )
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'expiringSoon':
          return new Date(a.expiryDate) - new Date(b.expiryDate)
        case 'name':
          return (a.name || '').localeCompare(b.name || '')
        case 'newest':
        default:
          return new Date(b.issueDate) - new Date(a.issueDate)
      }
    })

    return result
  }, [certifications, filter, searchQuery, sortBy])

  // ─── Stats ─────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: certifications.length,
    active: certifications.filter(c => c.status === 'active').length,
    expiring: certifications.filter(c => c.status === 'expiring').length,
    expired: certifications.filter(c => c.status === 'expired').length,
  }), [certifications])

  // ─── Helpers ───────────────────────────────────────────────────
  const buildCertFileSrc = (cert) => {
    if (!cert?._id || !cert?.fileUrl) return null
    return `${BACKEND_API_URL}/api/qc-technicians/certificates/file/${cert._id}`
  }

  const getStatusVariant = (status) => {
    switch (status) {
      case 'active': return 'rose'
      case 'expiring': return 'secondary'
      case 'expired': return 'destructive'
      default: return 'outline'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-3 h-3" />
      case 'expiring': return <Clock className="w-3 h-3" />
      case 'expired': return <AlertCircle className="w-3 h-3" />
      default: return null
    }
  }

  // ─── Actions ───────────────────────────────────────────────────
  const handleViewCertificate = (cert) => {
    setSelectedCert(cert)
    setIsViewModalOpen(true)
  }

  const handleDownloadCertificate = (cert, mode = 'auto') => {
    if (!cert) return

    const hasFile = !!cert.fileUrl

    if (mode === 'file' || (mode === 'auto' && hasFile)) {
      try {
        const link = document.createElement('a')
        const src = buildCertFileSrc(cert) || cert.fileUrl
        link.href = src
        const safeName = (cert.name || 'certificate').replace(/[^a-z0-9]/gi, '_')
        link.download = safeName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (err) {
        console.error('Error downloading certificate file:', err)
        showAlert('Failed to download certificate file.', 'error')
      }
      return
    }

    const skillsText = Array.isArray(cert.skills) ? cert.skills.join(', ') : (cert.skills || '')
    const certificateContent = `
CERTIFICATE OF COMPLETION

${cert.name}

This certifies that the holder has successfully completed the requirements for:
${cert.name}

Issued by: ${cert.issuer}
Issue Date: ${new Date(cert.issueDate).toLocaleDateString()}
Expiry Date: ${new Date(cert.expiryDate).toLocaleDateString()}
Credential ID: ${cert.credentialId}
Status: ${cert.status?.toUpperCase?.() || ''}

Description:
${cert.description}

Skills Covered:
${skillsText}

Verification URL: ${cert.verificationUrl || 'N/A'}
    `.trim()

    const blob = new Blob([certificateContent], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const safeName = (cert.name || 'certificate').replace(/[^a-z0-9]/gi, '_')
    const safeId = (cert.credentialId || 'summary').toString().replace(/[^a-z0-9]/gi, '_')
    link.download = `${safeName}_${safeId}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const handleEditCertificate = (cert) => {
    setFormData({
      name: cert.name || '',
      issuer: cert.issuer || '',
      issueDate: cert.issueDate ? new Date(cert.issueDate).toISOString().split('T')[0] : '',
      expiryDate: cert.expiryDate ? new Date(cert.expiryDate).toISOString().split('T')[0] : '',
      credentialId: cert.credentialId || '',
      description: cert.description || '',
      category: cert.category || '',
      skills: Array.isArray(cert.skills) ? cert.skills.join(', ') : (cert.skills || ''),
      verificationUrl: cert.verificationUrl || '',
      fileUrl: cert.fileUrl || '',
      status: cert.status || 'active'
    })
    setEditingCert(cert)
    setIsAddModalOpen(true)
  }

  const handleOpenAdd = () => {
    setEditingCert(null)
    setFormData(defaultFormData)
    setIsAddModalOpen(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    const skills = formData.skills
      ? formData.skills.split(',').map(s => s.trim()).filter(Boolean)
      : []

    const payload = { ...formData, skills }

    try {
      if (editingCert) {
        await qcApi.updateCertification(editingCert._id, payload)
        showAlert('Certification updated successfully.', 'success')
      } else {
        await qcApi.createCertification(userId, payload)
        showAlert('Certification created successfully.', 'success')
      }

      const updated = await qcApi.getCertifications(userId)
      setCertifications(updated || [])
      setIsAddModalOpen(false)
      setEditingCert(null)
      setFormData(defaultFormData)
    } catch (err) {
      console.error('Submission error:', err)
      showAlert(err?.message || 'Failed to save certification.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteCertificate = (cert) => {
    setCertToDelete(cert)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!certToDelete) return
    try {
      await qcApi.updateCertification(certToDelete._id, { status: 'expired' })
      showAlert('Certification removed.', 'success')
      const updated = await qcApi.getCertifications(userId)
      setCertifications(updated || [])
    } catch (err) {
      showAlert(err?.message || 'Failed to delete.', 'error')
    } finally {
      setIsDeleteModalOpen(false)
      setCertToDelete(null)
    }
  }

  // ─── Render ────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-100 rounded-xl">
              <Shield className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Certifications</h1>
              <p className="text-sm text-gray-500">Manage and track your professional certifications</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={fetchCerts}
              disabled={loading}
              title="Refresh"
              className="hidden sm:flex"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              onClick={handleOpenAdd}
              className="flex items-center gap-2"
              variant="rose"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Certification</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards — clickable to filter */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          icon={FileCheck}
          value={stats.total}
          label="Total"
          gradient="from-blue-500 to-blue-600"
          onClick={() => setFilter('all')}
          isActive={filter === 'all'}
        />
        <StatCard
          icon={CheckCircle}
          value={stats.active}
          label="Active"
          gradient="from-green-500 to-emerald-600"
          onClick={() => setFilter('active')}
          isActive={filter === 'active'}
        />
        <StatCard
          icon={Clock}
          value={stats.expiring}
          label="Expiring Soon"
          gradient="from-orange-500 to-amber-600"
          onClick={() => setFilter('expiring')}
          isActive={filter === 'expiring'}
        />
        <StatCard
          icon={AlertCircle}
          value={stats.expired}
          label="Expired"
          gradient="from-red-500 to-rose-600"
          onClick={() => setFilter('expired')}
          isActive={filter === 'expired'}
        />
      </div>

      {/* Toolbar: Tabs + Search + Sort + Layout */}
      <Card className="mb-6">
        <CardContent className="pt-6 space-y-4">
          {/* Top row: tabs */}
          <Tabs value={filter} onValueChange={setFilter} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="expiring">Expiring</TabsTrigger>
              <TabsTrigger value="expired">Expired</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Bottom row: search + sort + layout */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, issuer, category, skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <ArrowUpDown className="w-3.5 h-3.5 mr-2 text-gray-400" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="expiringSoon">Expiring Soonest</SelectItem>
                <SelectItem value="name">Name A–Z</SelectItem>
              </SelectContent>
            </Select>

            {/* Layout toggle */}
            <div className="flex items-center gap-1 self-end sm:self-auto">
              <Button
                type="button"
                variant={layout === 'card' ? 'rose' : 'outline'}
                size="icon"
                className="h-9 w-9"
                onClick={() => setLayout('card')}
                title="List view"
              >
                <LayoutList className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant={layout === 'grid' ? 'rose' : 'outline'}
                size="icon"
                className="h-9 w-9"
                onClick={() => setLayout('grid')}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      {!loading && certifications.length > 0 && (
        <p className="text-xs text-gray-500 mb-3">
          Showing {filteredCertifications.length} of {certifications.length} certification{certifications.length !== 1 ? 's' : ''}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <CertCardSkeleton key={i} />)}
        </div>
      )}

      {/* Certifications List */}
      {!loading && filteredCertifications.length > 0 && (
        <div className={layout === 'card' ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'}>
          {filteredCertifications.map(cert => (
            <Card
              key={cert._id}
              className="hover:shadow-md transition-all duration-200 bg-rose-50/40 border border-rose-100 group"
            >
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 bg-rose-100/80 rounded-lg shrink-0">
                        <Award className="w-5 h-5 text-rose-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 mb-0.5 truncate">{cert.name}</h3>
                        <p className="text-sm text-gray-600 truncate">{cert.issuer}</p>
                      </div>
                      <Badge variant={getStatusVariant(cert.status)} className="flex items-center gap-1.5 shrink-0">
                        {getStatusIcon(cert.status)}
                        {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                      </Badge>
                    </div>

                    {/* Expiry progress */}
                    <ExpiryProgress
                      issueDate={cert.issueDate}
                      expiryDate={cert.expiryDate}
                      status={cert.status}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mt-3 mb-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Issued: {new Date(cert.issueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Expires: {new Date(cert.expiryDate).toLocaleDateString()}</span>
                      </div>
                      <div className="text-gray-600 truncate">
                        <span className="font-medium">ID:</span> {cert.credentialId}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {cert.category && <Badge variant="outline" className="text-xs">{cert.category}</Badge>}
                      {(cert.skills || []).slice(0, 3).map((skill, i) => (
                        <Badge key={i} variant="outline" className="text-xs bg-white/60">
                          {skill}
                        </Badge>
                      ))}
                      {(cert.skills || []).length > 3 && (
                        <span className="text-xs text-gray-400">+{cert.skills.length - 3} more</span>
                      )}
                      {cert.fileUrl && !cert.fileUrl.toLowerCase().includes('.pdf') && (
                        <div className="w-16 h-16 rounded-md overflow-hidden border border-rose-200 bg-white ml-auto shrink-0">
                          <img
                            src={buildCertFileSrc(cert)}
                            alt={cert.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-2 shrink-0">
                    {cert.fileUrl && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const src = buildCertFileSrc(cert) || cert.fileUrl
                          window.open(src, '_blank', 'noopener,noreferrer')
                        }}
                        title="View Attached File"
                      >
                        <Paperclip className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditCertificate(cert)}
                      title="Edit Certification"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleViewCertificate(cert)}
                      title="View Certificate"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDownloadCertificate(cert, cert.fileUrl ? 'file' : 'summary')}
                      title={cert.fileUrl ? 'Download Certificate File' : 'Download Summary'}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredCertifications.length === 0 && (
        <EmptyState filter={filter} onAdd={handleOpenAdd} />
      )}

      {/* ═══ View Certificate Dialog ═══ */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Certificate Details</DialogTitle>
          </DialogHeader>

          {selectedCert && (
            <div className="space-y-6">
              <div className="text-center p-8 bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg border-2 border-rose-200">
                <Award className="w-16 h-16 text-rose-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedCert.name}</h3>
                <p className="text-lg text-gray-700 mb-3">{selectedCert.issuer}</p>
                <Badge variant={getStatusVariant(selectedCert.status)} className="flex items-center gap-2 w-fit mx-auto text-sm">
                  {getStatusIcon(selectedCert.status)}
                  {selectedCert.status.charAt(0).toUpperCase() + selectedCert.status.slice(1)}
                </Badge>
                <div className="max-w-xs mx-auto mt-4">
                  <ExpiryProgress
                    issueDate={selectedCert.issueDate}
                    expiryDate={selectedCert.expiryDate}
                    status={selectedCert.status}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Description</h4>
                  <p className="text-gray-700">{selectedCert.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Issue Date</h4>
                    <p className="text-gray-900 font-medium">
                      {new Date(selectedCert.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Expiry Date</h4>
                    <p className="text-gray-900 font-medium">
                      {new Date(selectedCert.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Credential ID</h4>
                  <p className="text-gray-900 font-mono font-medium">{selectedCert.credentialId}</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Category</h4>
                  <Badge variant="secondary">{selectedCert.category}</Badge>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Skills Covered</h4>
                  <div className="flex flex-wrap gap-2">
                    {(selectedCert.skills || []).map((skill, index) => (
                      <Badge key={index} variant="outline">{skill}</Badge>
                    ))}
                    {(!selectedCert.skills || selectedCert.skills.length === 0) && (
                      <p className="text-sm text-gray-400">No skills listed.</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Verification</h4>
                  {selectedCert.verificationUrl ? (
                    <a
                      href={selectedCert.verificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-rose-600 hover:text-rose-800 underline break-all flex items-center gap-1"
                    >
                      {selectedCert.verificationUrl}
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  ) : (
                    <p className="text-gray-500 text-sm">No verification URL provided.</p>
                  )}
                </div>

                {selectedCert.fileUrl && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Attached Certificate</h4>
                    <div className="border rounded-lg overflow-hidden bg-white">
                      {selectedCert.fileUrl.toLowerCase().includes('.pdf') ? (
                        <iframe
                          src={buildCertFileSrc(selectedCert)}
                          className="w-full h-80"
                          title="Certificate PDF"
                        />
                      ) : (
                        <img
                          src={buildCertFileSrc(selectedCert)}
                          alt="Certificate"
                          className="w-full max-h-80 object-contain bg-gray-50"
                        />
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-1"
                      onClick={() => {
                        const src = buildCertFileSrc(selectedCert) || selectedCert.fileUrl
                        window.open(src, '_blank', 'noopener,noreferrer')
                      }}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Open in new tab
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <Button variant="ghost" onClick={() => setIsViewModalOpen(false)}>Close</Button>
            <div className="flex flex-wrap gap-2 justify-end">
              {selectedCert?.fileUrl && (
                <Button variant="outline" onClick={() => handleDownloadCertificate(selectedCert, 'file')}>
                  <Download className="w-4 h-4 mr-2" />
                  Download File
                </Button>
              )}
              <Button onClick={() => handleDownloadCertificate(selectedCert, 'summary')}>
                <FileText className="w-4 h-4 mr-2" />
                Download Summary
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ Add / Edit Certification Dialog ═══ */}
      <Dialog open={isAddModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddModalOpen(false)
          setEditingCert(null)
          setFormData(defaultFormData)
        } else {
          setIsAddModalOpen(true)
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCert ? 'Edit Certification' : 'Add New Certification'}</DialogTitle>
            <DialogDescription>
              {editingCert ? 'Update the details of your certification.' : 'Fill in the details to add a new certification.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Certification Name *</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required placeholder="e.g. AWS Solutions Architect" />
              </div>
              <div>
                <Label htmlFor="issuer">Issuer *</Label>
                <Input id="issuer" name="issuer" value={formData.issuer} onChange={handleInputChange} required placeholder="e.g. Amazon Web Services" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="issueDate">Issue Date *</Label>
                <Input id="issueDate" name="issueDate" type="date" value={formData.issueDate} onChange={handleInputChange} required />
              </div>
              <div>
                <Label htmlFor="expiryDate">Expiry Date *</Label>
                <Input id="expiryDate" name="expiryDate" type="date" value={formData.expiryDate} onChange={handleInputChange} required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="credentialId">Credential ID *</Label>
                <Input id="credentialId" name="credentialId" value={formData.credentialId} onChange={handleInputChange} required placeholder="e.g. ABC-123-XYZ" />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Input id="category" name="category" value={formData.category} onChange={handleInputChange} required placeholder="e.g. Cloud Computing" />
              </div>
            </div>

            <div>
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input id="skills" name="skills" placeholder="e.g. React, Leadership, SEO" value={formData.skills} onChange={handleInputChange} />
            </div>

            <div>
              <Label htmlFor="verificationUrl">Verification URL</Label>
              <Input id="verificationUrl" name="verificationUrl" type="url" value={formData.verificationUrl} onChange={handleInputChange} placeholder="https://..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="certificateFile">Certificate File (image or PDF)</Label>
              <Input
                id="certificateFile"
                type="file"
                accept="image/*,application/pdf"
                disabled={uploadingFile}
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return

                  if (file.size > 10 * 1024 * 1024) {
                    showAlert('File must be less than 10MB.', 'error')
                    e.target.value = ''
                    return
                  }

                  const isImage = file.type.startsWith('image/')
                  const isPdf = file.type === 'application/pdf'
                  if (!isImage && !isPdf) {
                    showAlert('Only image or PDF files are allowed.', 'error')
                    e.target.value = ''
                    return
                  }

                  try {
                    setUploadingFile(true)
                    const formDataUpload = new FormData()
                    formDataUpload.append('file', file)

                    const { ok, data } = await api(
                      `/api/qc-technicians/certifications/upload-file/${userId}`,
                      'POST',
                      formDataUpload
                    )

                    if (!ok || !data?.data?.fileUrl) {
                      throw new Error(data?.error || 'Failed to upload file')
                    }

                    setFormData((prev) => ({ ...prev, fileUrl: data.data.fileUrl }))
                    showAlert('Certificate file uploaded.', 'success')
                  } catch (error) {
                    console.error('Error uploading certification file:', error)
                    showAlert(error?.message || 'Failed to upload file.', 'error')
                  } finally {
                    setUploadingFile(false)
                  }
                }}
              />
              {uploadingFile && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Uploading...
                </div>
              )}
              {formData.fileUrl && !uploadingFile && (
                <div className="flex items-center justify-between text-xs text-gray-600 bg-green-50 rounded-md px-3 py-2">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    File attached
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => window.open(formData.fileUrl, '_blank', 'noopener,noreferrer')}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-red-500 hover:text-red-700"
                      onClick={() => setFormData(prev => ({ ...prev, fileUrl: '' }))}
                    >
                      <X className="w-3 h-3 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expiring">Expiring Soon</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                required
                placeholder="Brief description of this certification..."
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting || uploadingFile} variant="rose">
                {submitting
                  ? (editingCert ? 'Saving...' : 'Adding...')
                  : (editingCert ? 'Save Changes' : 'Add Certification')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ═══ Delete Confirmation Dialog ═══ */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Certification</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove &quot;{certToDelete?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CertificationsPage