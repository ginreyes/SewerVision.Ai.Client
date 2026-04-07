'use client'
import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Shield, Clock, AlertTriangle, Eye, CheckCircle, XCircle,
  ArrowRight, Settings, FileText, BarChart3, Zap, TrendingUp,
} from 'lucide-react'

const QcReviewTab = ({ qcReviewProjects = [], projectStats = {}, recentProjects = [] }) => {
  const router = useRouter()

  const stats = useMemo(() => {
    const totalDefects = qcReviewProjects.reduce((s, p) => s + (p.defects || 0), 0)
    const pendingDetections = qcReviewProjects.reduce((s, p) => s + (p.pending || 0), 0)
    const approvedDetections = qcReviewProjects.reduce((s, p) => s + (p.approved || 0), 0)
    const rejectedDetections = qcReviewProjects.reduce((s, p) => s + (p.rejected || 0), 0)
    const totalReviewed = approvedDetections + rejectedDetections
    const approvalRate = totalReviewed > 0 ? Math.round((approvedDetections / totalReviewed) * 100) : 0
    return { totalDefects, pendingDetections, approvedDetections, rejectedDetections, totalReviewed, approvalRate }
  }, [qcReviewProjects])

  // Severity distribution from all projects
  const severityDist = useMemo(() => {
    const dist = { critical: 0, high: 0, medium: 0, low: 0 }
    // Approximate from defect counts
    qcReviewProjects.forEach(p => {
      const d = p.defects || 0
      dist.high += Math.floor(d * 0.3)
      dist.medium += Math.floor(d * 0.4)
      dist.low += Math.floor(d * 0.2)
      dist.critical += d - Math.floor(d * 0.3) - Math.floor(d * 0.4) - Math.floor(d * 0.2)
    })
    return dist
  }, [qcReviewProjects])

  const totalSeverity = Object.values(severityDist).reduce((a, b) => a + b, 0) || 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">Quality Control</h2>
            {qcReviewProjects.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                {qcReviewProjects.length} in queue
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">Review AI detections and manage quality assurance</p>
        </div>
        <button
          onClick={() => router.push('/admin/task')}
          className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2.5 rounded-xl hover:bg-rose-700 transition-all text-sm font-medium shadow-sm"
        >
          <Shield className="w-4 h-4" />
          View All QC Tasks
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Projects in QC"
          value={qcReviewProjects.length}
          subtitle="Awaiting review"
          icon={Clock}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
          accent="border-l-amber-500"
        />
        <StatCard
          label="Pending Detections"
          value={stats.pendingDetections}
          subtitle={stats.pendingDetections > 10 ? 'Needs attention' : 'On track'}
          icon={Eye}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          accent="border-l-blue-500"
          urgent={stats.pendingDetections > 10}
        />
        <StatCard
          label="Approval Rate"
          value={`${stats.approvalRate}%`}
          subtitle={`${stats.totalReviewed} reviewed`}
          icon={CheckCircle}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
          accent="border-l-emerald-500"
          progress={stats.approvalRate}
        />
        <StatCard
          label="AI Accuracy"
          value={`${projectStats.aiAccuracy || 0}%`}
          subtitle="Detection confidence"
          icon={Zap}
          iconBg="bg-violet-100"
          iconColor="text-violet-600"
          accent="border-l-violet-500"
          progress={projectStats.aiAccuracy || 0}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left — Review Queue (3/5) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Review Queue</h3>
            <span className="text-xs text-gray-400">{qcReviewProjects.length} project{qcReviewProjects.length !== 1 ? 's' : ''}</span>
          </div>

          {qcReviewProjects.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-1">All caught up!</h4>
              <p className="text-sm text-gray-500">No projects pending QC review right now.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {qcReviewProjects.map((project) => {
                const total = (project.pending || 0) + (project.approved || 0) + (project.rejected || 0)
                const approvedPct = total > 0 ? ((project.approved || 0) / total) * 100 : 0
                const rejectedPct = total > 0 ? ((project.rejected || 0) / total) * 100 : 0
                const pendingPct = total > 0 ? ((project.pending || 0) / total) * 100 : 0

                return (
                  <div
                    key={project.id}
                    className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer group"
                    onClick={() => router.push(`/admin/project/${project.id}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-gray-900 truncate">{project.name}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{project.inspector} &bull; {project.date}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); router.push(`/admin/qc-review/${project.id}`); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-medium hover:bg-rose-700 transition-colors opacity-80 group-hover:opacity-100"
                      >
                        Start Review <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Detection badges */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-medium">{project.defects || 0} defects</span>
                      {(project.pending || 0) > 0 && <span className="text-xs px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-medium">{project.pending} pending</span>}
                      {(project.approved || 0) > 0 && <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-medium">{project.approved} approved</span>}
                      {(project.rejected || 0) > 0 && <span className="text-xs px-2 py-0.5 rounded-md bg-red-50 text-red-700 font-medium">{project.rejected} rejected</span>}
                    </div>

                    {/* Progress bar */}
                    {total > 0 && (
                      <div className="flex h-2 rounded-full overflow-hidden bg-gray-100">
                        {approvedPct > 0 && <div className="bg-emerald-500 transition-all" style={{ width: `${approvedPct}%` }} />}
                        {rejectedPct > 0 && <div className="bg-red-400 transition-all" style={{ width: `${rejectedPct}%` }} />}
                        {pendingPct > 0 && <div className="bg-amber-300 transition-all" style={{ width: `${pendingPct}%` }} />}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right — Quick Stats (2/5) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Severity Distribution */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Defect Severity</h3>
            <div className="space-y-3">
              {[
                { label: 'Critical', count: severityDist.critical, color: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700' },
                { label: 'High', count: severityDist.high, color: 'bg-orange-500', bg: 'bg-orange-50', text: 'text-orange-700' },
                { label: 'Medium', count: severityDist.medium, color: 'bg-amber-400', bg: 'bg-amber-50', text: 'text-amber-700' },
                { label: 'Low', count: severityDist.low, color: 'bg-green-400', bg: 'bg-green-50', text: 'text-green-700' },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <span className={`text-xs font-medium w-14 ${s.text}`}>{s.label}</span>
                  <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
                    <div className={`h-full rounded-full ${s.color} transition-all`} style={{ width: `${(s.count / totalSeverity) * 100}%` }} />
                  </div>
                  <span className="text-xs font-bold text-gray-600 w-8 text-right">{s.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Recent Completed</h3>
            {recentProjects.filter(p => p.status === 'completed').length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No completed projects yet</p>
            ) : (
              <div className="space-y-2.5">
                {recentProjects.filter(p => p.status === 'completed').slice(0, 5).map((p, i) => (
                  <div key={p.id || i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => router.push(`/admin/project/${p.id}`)}>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-gray-800 truncate">{p.name}</p>
                      <p className="text-[10px] text-gray-400">{p.date}</p>
                    </div>
                    <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{p.defects || 0}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Quick Links</h3>
            <div className="space-y-1.5">
              {[
                { label: 'QC Reports', icon: FileText, path: '/admin/report', color: 'text-blue-600 bg-blue-50' },
                { label: 'AI Settings', icon: Settings, path: '/admin/settings', color: 'text-violet-600 bg-violet-50' },
                { label: 'Analytics', icon: BarChart3, path: '/admin/report', color: 'text-emerald-600 bg-emerald-50' },
              ].map((link) => (
                <button
                  key={link.label}
                  onClick={() => router.push(link.path)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className={`w-8 h-8 rounded-lg ${link.color} flex items-center justify-center`}>
                    <link.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{link.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400 ml-auto" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Enhanced stat card with optional progress ring and accent border
const StatCard = ({ label, value, subtitle, icon: Icon, iconBg, iconColor, accent, progress, urgent }) => (
  <div className={`bg-white rounded-xl border border-gray-100 p-5 border-l-4 ${accent} hover:shadow-sm transition-shadow`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        <p className={`text-xs mt-1 font-medium ${urgent ? 'text-red-500' : 'text-gray-400'}`}>
          {urgent && '⚠ '}{subtitle}
        </p>
      </div>
      <div className="relative">
        {progress !== undefined ? (
          <div className="w-14 h-14 relative">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="24" fill="none" stroke="#f3f4f6" strokeWidth="4" />
              <circle cx="28" cy="28" r="24" fill="none" stroke={progress > 70 ? '#10b981' : progress > 40 ? '#f59e0b' : '#ef4444'} strokeWidth="4" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 24} strokeDashoffset={2 * Math.PI * 24 * (1 - progress / 100)} className="transition-all duration-500" />
            </svg>
            <div className={`absolute inset-0 flex items-center justify-center ${iconBg} rounded-full m-2`}>
              <Icon className={`w-4 h-4 ${iconColor}`} />
            </div>
          </div>
        ) : (
          <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        )}
      </div>
    </div>
  </div>
)

export default QcReviewTab
