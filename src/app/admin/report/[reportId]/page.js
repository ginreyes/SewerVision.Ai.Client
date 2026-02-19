'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, FileText, MapPin, Calendar, User, Building2,
  AlertTriangle, CheckCircle, BarChart3, Target, Zap, Loader2,
  HardDrive, UserCheck, Clock, Shield, PenLine, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAlert } from '@/components/providers/AlertProvider';
import reportsApi from '@/data/reportsApi';

// ─── Avatar / User helpers ───────────────────────────────────────
const getInitials = (u) => {
  if (!u) return '?'
  if (u.first_name && u.last_name) return `${u.first_name[0]}${u.last_name[0]}`.toUpperCase()
  if (u.first_name) return u.first_name[0].toUpperCase()
  if (u.username) return u.username[0].toUpperCase()
  if (u.email) return u.email[0].toUpperCase()
  return '?'
}

const avatarColors = [
  'from-violet-500 to-purple-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-500',
  'from-emerald-500 to-teal-600',
  'from-sky-500 to-blue-600',
  'from-indigo-500 to-violet-500',
]
const getAvatarGradient = (str = '') => avatarColors[str.charCodeAt(0) % avatarColors.length]

const getBaseUrl = () => typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_BACKEND_URL ? process.env.NEXT_PUBLIC_BACKEND_URL : ''
// Use backend avatar endpoint so the actual profile picture is always loaded (or server placeholder)
const avatarSrc = (u) => {
  const id = u?._id || u?.id
  if (!id) return null
  return `${getBaseUrl()}/api/users/avatar/${id}`
}

const getDisplayName = (u) => {
  if (!u) return '—'
  return [u.first_name, u.last_name].filter(Boolean).join(' ') || u.username || u.email || '—'
}

// ─── Person Card component ───────────────────────────────────────
const PersonCard = ({ user, roleLabel, icon: Icon, accentColor = 'rose' }) => {
  if (!user) return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-dashed border-gray-200">
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
        <User className="w-4 h-4 text-gray-300" />
      </div>
      <div>
        <p className="text-xs text-gray-400">{roleLabel}</p>
        <p className="text-sm text-gray-400 italic">Unassigned</p>
      </div>
    </div>
  )

  const name = getDisplayName(user)
  const gradient = getAvatarGradient(name)
  const src = avatarSrc(user)

  const handleImgError = (e) => {
    e.target.style.display = 'none'
    const fallback = e.target.nextElementSibling
    if (fallback) fallback.classList.remove('hidden')
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ring-2 ring-white shadow overflow-hidden relative`}>
        {src ? (
          <>
            <img src={src} alt={name} className="w-full h-full rounded-full object-cover absolute inset-0" onError={handleImgError} />
            <span className="hidden">{getInitials(user)}</span>
          </>
        ) : (
          <span>{getInitials(user)}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {Icon && <Icon className={`w-3 h-3 text-${accentColor}-400 flex-shrink-0`} />}
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{roleLabel}</p>
        </div>
        <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
        {user.role && (
          <p className="text-xs text-gray-400 capitalize truncate">{user.role}</p>
        )}
        {user.email && (
          <p className="text-xs text-gray-300 truncate">{user.email}</p>
        )}
      </div>
    </div>
  )
}

// ─── Status helpers ───────────────────────────────────────────────
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'in-review': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getStatusDot = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed': return 'bg-emerald-500'
    case 'pending': return 'bg-amber-500'
    case 'in-review': return 'bg-blue-500'
    default: return 'bg-gray-400'
  }
}

// ─── Metric Tile ─────────────────────────────────────────────────
const MetricTile = ({ label, value, sublabel, colorClass = 'text-gray-900', bg = 'bg-gray-50' }) => (
  <div className={`${bg} rounded-xl p-4 text-center`}>
    <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
    <div className="text-xs font-medium text-gray-600 mt-1">{label}</div>
    {sublabel && <div className="text-[10px] text-gray-400 mt-0.5">{sublabel}</div>}
  </div>
)

// ─── Info Row ────────────────────────────────────────────────────
const InfoRow = ({ label, value, icon: Icon }) => (
  <div className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors">
    <span className="text-sm text-gray-500 flex items-center gap-1.5">
      {Icon && <Icon className="w-3.5 h-3.5 text-gray-400" />}
      {label}
    </span>
    <span className="text-sm font-medium text-gray-900 text-right">{value || '—'}</span>
  </div>
)

// ─── Main Page ───────────────────────────────────────────────────
export default function AdminReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { showAlert } = useAlert()
  const reportId = params?.reportId
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!reportId) return
    reportsApi.getReportById(reportId)
      .then((res) => setReport(res?.data ?? res))
      .catch((err) => { showAlert(err?.message || 'Failed to load report', 'error'); setReport(null) })
      .finally(() => setLoading(false))
  }, [reportId, showAlert])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-[#D76A84]" />
          <p className="text-sm text-gray-400">Loading report...</p>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-300" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Report not found</h2>
            <p className="text-gray-400 mb-6">The report may have been removed or you don't have access.</p>
            <Button variant="outline" asChild>
              <Link href="/admin/report">← Back to Reports</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ── Derived values ────────────────────────────────────────────
  const projectName = report.projectId?.name || (report.projectId ? 'Project' : '—')
  const projectLocation = report.projectId?.location || report.location || '—'
  const leader = report.projectId?.managerId
  const operator = report.operator
  const qc = report.qcTechnician
  const createdBy = report.createdBy || operator
  const createdAt = report.createdAt ? new Date(report.createdAt).toLocaleString() : '—'
  const updatedAt = report.updatedAt ? new Date(report.updatedAt).toLocaleString() : '—'

  const sameUser = (a, b) => (a?._id || a) && (b?._id || b) && String(a?._id || a) === String(b?._id || b)
  const isCreatorOperator = sameUser(createdBy, operator)
  const isCreatorQc = sameUser(createdBy, qc)
  const showCreatedByCard = createdBy && !isCreatorOperator && !isCreatorQc

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

      {/* Back nav */}
      <Button variant="ghost" size="sm" asChild className="text-gray-500 hover:text-gray-700 -ml-2">
        <Link href="/admin/report" className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Reports
        </Link>
      </Button>

      {/* ── Hero card ─────────────────────────────────────────────── */}
      <Card className="overflow-hidden border-0 shadow-lg">
        {/* Gradient header strip */}
        <div className="h-2 bg-gradient-to-r from-[#D76A84] to-rose-400" />
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Icon */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#D76A84] to-rose-500 text-white flex-shrink-0 shadow-lg shadow-rose-200">
              <FileText className="w-10 h-10" />
            </div>

            {/* Title block */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                  {report.inspectionId || 'RPT-' + (reportId?.slice(-6) || '000000')}
                </span>
                <Badge variant="outline" className={`flex items-center gap-1.5 ${getStatusColor(report.status)}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${getStatusDot(report.status)}`} />
                  {report.status}
                </Badge>
                {report.overallGrade && (
                  <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                    Grade: {report.overallGrade}
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                {projectName !== '—' ? projectName : report.location || 'Inspection Report'}
              </h1>
              <p className="text-gray-400 mt-1 text-sm">{report.reportType || 'PACP Condition Assessment'}</p>
            </div>

            {/* Created by — prominent callout */}
            {createdBy && (
              <div className="flex-shrink-0 flex items-center gap-3 bg-rose-50 border border-rose-100 rounded-2xl px-4 py-3 min-w-[200px]">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarGradient(getDisplayName(createdBy))} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ring-2 ring-white shadow overflow-hidden relative`}>
                  {avatarSrc(createdBy) ? (
                    <>
                      <img src={avatarSrc(createdBy)} alt={getDisplayName(createdBy)} className="w-full h-full rounded-full object-cover absolute inset-0" onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling?.classList.remove('hidden') }} />
                      <span className="hidden">{getInitials(createdBy)}</span>
                    </>
                  ) : (
                    <span>{getInitials(createdBy)}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1">
                    <PenLine className="w-3 h-3" /> Created by
                  </p>
                  <p className="text-sm font-semibold text-gray-900 truncate">{getDisplayName(createdBy)}</p>
                  <p className="text-xs text-gray-400 capitalize">{createdBy.role || 'operator'}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Timestamps row ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-sm">
          <Clock className="w-4 h-4 text-gray-300 flex-shrink-0" />
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Created</p>
            <p className="text-sm font-medium text-gray-700">{createdAt}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-3 border border-gray-100 shadow-sm">
          <RefreshIcon className="w-4 h-4 text-gray-300 flex-shrink-0" />
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Last updated</p>
            <p className="text-sm font-medium text-gray-700">{updatedAt}</p>
          </div>
        </div>
      </div>

      {/* ── Personnel grid ─────────────────────────────────────────── */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4 text-[#D76A84]" />
            Team & Personnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {showCreatedByCard && (
              <PersonCard user={createdBy} roleLabel="Created by" icon={PenLine} accentColor="rose" />
            )}
            <PersonCard
              user={operator}
              roleLabel={isCreatorOperator ? 'Operator (created)' : 'Operator'}
              icon={User}
              accentColor="blue"
            />
            <PersonCard
              user={qc}
              roleLabel={isCreatorQc ? 'QC Technician (created)' : 'QC Technician'}
              icon={Shield}
              accentColor="emerald"
            />
            <PersonCard user={leader} roleLabel="Team Leader" icon={UserCheck} accentColor="purple" />
          </div>
        </CardContent>
      </Card>

      {/* ── Project & Location ──────────────────────────────────────── */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#D76A84]" />
            Project & Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            <InfoRow label="Project" value={projectName} icon={Building2} />
            <InfoRow label="Location" value={projectLocation} icon={MapPin} />
            <InfoRow label="Inspection Date" value={report.date || (report.createdAt && new Date(report.createdAt).toLocaleDateString())} icon={Calendar} />
            <InfoRow label="Report Type" value={report.reportType || 'PACP'} icon={FileText} />
          </div>
        </CardContent>
      </Card>

      {/* ── Metrics ─────────────────────────────────────────────────── */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#D76A84]" />
            Inspection Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <MetricTile label="Footage" value={report.footage ?? '0'} sublabel="feet" />
            <MetricTile label="Total Defects" value={report.totalDefects ?? 0} />
            <MetricTile label="Critical Defects" value={report.criticalDefects ?? 0} colorClass="text-red-600" bg="bg-red-50" />
            <MetricTile label="AI Confidence" value={`${report.confidence != null ? Number(report.confidence).toFixed(1) : 0}%`} colorClass="text-purple-600" bg="bg-purple-50" />
          </div>

          {(report.aiDetections != null || report.overallGrade) && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {report.aiDetections != null && (
                <MetricTile label="AI Detections" value={report.aiDetections} colorClass="text-blue-700" bg="bg-blue-50" />
              )}
              {report.overallGrade && (
                <MetricTile label="Overall Grade" value={report.overallGrade} colorClass="text-amber-700" bg="bg-amber-50" />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Issues ─────────────────────────────────────────────────── */}
      {report.issues && report.issues.length > 0 && (
        <Card className="border-0 shadow-sm border-l-4 border-l-amber-400">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Issues ({report.issues.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {report.issues.map((issue, i) => (
                <li key={i} className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg text-sm text-gray-700">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  {issue}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Back button */}
      <div className="flex justify-end pt-2">
        <Button variant="outline" asChild>
          <Link href="/admin/report">← Back to Reports</Link>
        </Button>
      </div>
    </div>
  )
}

// Tiny inline refresh icon to avoid another import
const RefreshIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 4v6h-6" /><path d="M1 20v-6h6" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
)