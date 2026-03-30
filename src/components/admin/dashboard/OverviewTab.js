'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Database, Brain, Eye, Zap, Activity, BarChart3, AlertTriangle, CheckCircle, Clock, Upload, Edit3, Share2, Plus, BarChart2, Headphones, Building, HardDrive, ClipboardCheck, Users } from 'lucide-react'
import StatsCard from './StatsCard'

const getStatusColor = (status) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800'
    case 'ai-processing': return 'bg-blue-100 text-blue-800'
    case 'qc-review': return 'bg-yellow-100 text-yellow-800'
    case 'uploading': return 'bg-purple-100 text-purple-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusIcon = (status) => {
  switch (status) {
    case 'completed': return <CheckCircle className="w-4 h-4" />
    case 'ai-processing': return <Brain className="w-4 h-4" />
    case 'qc-review': return <Eye className="w-4 h-4" />
    case 'uploading': return <Upload className="w-4 h-4" />
    default: return <Clock className="w-4 h-4" />
  }
}

const OverviewTab = ({ projectStats, recentProjects, getCanvasRef, data }) => {
  const router = useRouter()

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard label="Total Projects" value={projectStats.totalProjects} icon={Database} iconBg="bg-blue-100" iconColor="text-blue-600" subtitle="+12% from last month" subtitleColor="text-green-600" />
        <StatsCard label="AI Processing" value={projectStats.aiProcessing} icon={Brain} iconBg="bg-purple-100" iconColor="text-purple-600" subtitle="Active now" subtitleColor="text-blue-600" />
        <StatsCard label="Pending QC" value={projectStats.pendingQC} icon={Eye} iconBg="bg-yellow-100" iconColor="text-yellow-600" subtitle="Needs attention" subtitleColor="text-orange-600" />
        <StatsCard label="AI Accuracy" value={`${projectStats.aiAccuracy}%`} icon={Zap} iconBg="bg-green-100" iconColor="text-green-600" subtitle="+2.1% this week" subtitleColor="text-green-600" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">AI Detection Distribution</h3>
            <Brain className="w-5 h-5 text-blue-600" />
          </div>
          <div className="h-64"><canvas ref={getCanvasRef('pie')} /></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Current Workflow Status</h3>
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <div className="h-64"><canvas ref={getCanvasRef('workflow')} /></div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">AI vs Manual Productivity</h3>
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <div className="h-80"><canvas ref={getCanvasRef('productivity')} /></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">AI Accuracy Improvement</h3>
            <Zap className="w-5 h-5 text-green-600" />
          </div>
          <div className="h-80"><canvas ref={getCanvasRef('accuracy')} /></div>
        </div>
      </div>

      {/* Defect Trends */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Defect Detection Trends (Last 4 Weeks)</h3>
          <AlertTriangle className="w-5 h-5 text-orange-600" />
        </div>
        <div className="h-96"><canvas ref={getCanvasRef('defectTrend')} /></div>
      </div>

      {/* Recent Projects Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Projects</h3>
            <button onClick={() => router.push('/admin/project')} className="text-sm text-blue-600 hover:text-blue-800 font-medium">View All</button>
          </div>
        </div>
        <div className="p-6 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="pb-3">Project</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Progress</th>
                <th className="pb-3">Inspector</th>
                <th className="pb-3">Defects</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentProjects.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-gray-500">No projects found</td></tr>
              ) : (
                recentProjects.map((project) => (
                  <tr key={project.id} className="border-b border-gray-100">
                    <td className="py-4"><p className="font-medium text-gray-900">{project.name}</p></td>
                    <td className="py-4">
                      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {getStatusIcon(project.status)}
                        <span className="capitalize">{project.status?.replace(/-/g, ' ') || 'Unknown'}</span>
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${project.progress || 0}%` }} />
                      </div>
                      <span className="text-xs text-gray-600 mt-1">{project.progress || 0}%</span>
                    </td>
                    <td className="py-4 text-gray-700">{project.inspector || 'N/A'}</td>
                    <td className="py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">{project.defects || 0}</span>
                    </td>
                    <td className="py-4 text-gray-600 text-sm">{project.date || 'N/A'}</td>
                    <td className="py-4">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => router.push(`/admin/project?selectedProject=${project.id}`)} className="p-1 text-gray-400 hover:text-gray-600" title="View Project"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => router.push(`/admin/project/editProject/${project.id}`)} className="p-1 text-gray-400 hover:text-gray-600" title="Edit Project"><Edit3 className="w-4 h-4" /></button>
                        <button className="p-1 text-gray-400 hover:text-gray-600" title="Share Project"><Share2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
        <div className="flex items-center gap-3">
          <Link href="/admin/project/createProject">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 hover:bg-rose-100 text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> Create Project
            </button>
          </Link>
          <Link href="/admin/users">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-xl border border-blue-200 hover:bg-blue-100 text-sm font-medium transition-colors">
              <Users className="w-4 h-4" /> Manage Users
            </button>
          </Link>
          <Link href="/admin/report">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 hover:bg-emerald-100 text-sm font-medium transition-colors">
              <BarChart2 className="w-4 h-4" /> View Reports
            </button>
          </Link>
          <Link href="/admin/support">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-200 hover:bg-amber-100 text-sm font-medium transition-colors">
              <Headphones className="w-4 h-4" /> Support Center
            </button>
          </Link>
        </div>
      </div>

    </div>
  )
}

export default OverviewTab
