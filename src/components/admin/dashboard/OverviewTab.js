'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Database, Brain, Eye, Zap, Activity, BarChart3, AlertTriangle,
  CheckCircle, Clock, Upload, Edit3, Share2, Plus, BarChart2,
  Headphones, Users,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import GenericStatCard from '@/components/shared/GenericStatCard'
import ModelHealthCard from './ModelHealthCard'

const getStatusColor = (status) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300'
    case 'ai-processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300'
    case 'qc-review': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-300'
    case 'uploading': return 'bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-300'
    default: return 'bg-gray-100 text-gray-800 dark:bg-[#27272a] dark:text-gray-300'
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

const DASHBOARD_CARD = 'border-0 shadow-sm dark:bg-[#0c0c0e] dark:border dark:border-[#27272a]'

const OverviewTab = ({ projectStats, recentProjects, getCanvasRef }) => {
  const router = useRouter()

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GenericStatCard
          icon={Database}
          value={projectStats.totalProjects}
          label="Total Projects"
          subtitle="+12% from last month"
          color="rose"
        />
        <GenericStatCard
          icon={Brain}
          value={projectStats.aiProcessing}
          label="AI Processing"
          subtitle="Active now"
          color="purple"
        />
        <GenericStatCard
          icon={Eye}
          value={projectStats.pendingQC}
          label="Pending QC"
          subtitle="Needs attention"
          color="amber"
        />
        <GenericStatCard
          icon={Zap}
          value={`${projectStats.aiAccuracy}%`}
          label="AI Accuracy"
          subtitle="+2.1% this week"
          color="green"
        />
      </div>

      {/* Model Health (full width) */}
      <ModelHealthCard />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 2/3 — primary charts + recent projects */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Detection Distribution */}
          <Card className={DASHBOARD_CARD}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                  AI Detection Distribution
                </CardTitle>
                <Brain className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64"><canvas ref={getCanvasRef('pie')} /></div>
            </CardContent>
          </Card>

          {/* Current Workflow Status */}
          <Card className={DASHBOARD_CARD}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                  Current Workflow Status
                </CardTitle>
                <Activity className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64"><canvas ref={getCanvasRef('workflow')} /></div>
            </CardContent>
          </Card>

          {/* AI vs Manual Productivity */}
          <Card className={DASHBOARD_CARD}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                  AI vs Manual Productivity
                </CardTitle>
                <BarChart3 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80"><canvas ref={getCanvasRef('productivity')} /></div>
            </CardContent>
          </Card>

          {/* Recent Projects */}
          <Card className={DASHBOARD_CARD}>
            <CardHeader className="pb-3 border-b border-gray-100 dark:border-[#27272a]">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                  Recent Projects
                </CardTitle>
                <button
                  onClick={() => router.push('/admin/project')}
                  className="text-sm text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-medium"
                >
                  View All
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 dark:!text-gray-300 uppercase tracking-wider">
                    <th className="px-4 py-3">Project</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Progress</th>
                    <th className="px-4 py-3">Inspector</th>
                    <th className="px-4 py-3">Defects</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentProjects.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500 dark:!text-gray-300">
                        No projects found
                      </td>
                    </tr>
                  ) : (
                    recentProjects.map((project) => (
                      <tr
                        key={project.id}
                        className="border-t border-gray-100 dark:border-[#27272a] hover:bg-gray-50 dark:hover:bg-[#18181b] transition-colors"
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900 dark:text-gray-100">{project.name}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                            {getStatusIcon(project.status)}
                            <span className="capitalize">{project.status?.replace(/-/g, ' ') || 'Unknown'}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="w-24 bg-gray-200 dark:bg-[#27272a] rounded-full h-2">
                            <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${project.progress || 0}%` }} />
                          </div>
                          <span className="text-xs text-gray-600 dark:!text-gray-400 mt-1">{project.progress || 0}%</span>
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:!text-gray-200 text-sm">{project.inspector || 'N/A'}</td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary" className="text-xs bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300">
                            {project.defects || 0}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:!text-gray-400 text-sm">{project.date || 'N/A'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => router.push(`/admin/project?selectedProject=${project.id}`)}
                              className="p-1 text-gray-400 dark:!text-gray-400 hover:text-gray-700 dark:hover:!text-white"
                              title="View Project"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => router.push(`/admin/project/editProject/${project.id}`)}
                              className="p-1 text-gray-400 dark:!text-gray-400 hover:text-gray-700 dark:hover:!text-white"
                              title="Edit Project"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              className="p-1 text-gray-400 dark:!text-gray-400 hover:text-gray-700 dark:hover:!text-white"
                              title="Share Project"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Right: 1/3 — quick actions + secondary charts */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className={DASHBOARD_CARD}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/admin/project/createProject">
                  <button className="w-full flex items-center gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:!text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors text-sm font-medium">
                    <Plus className="w-4 h-4" /> Create
                  </button>
                </Link>
                <Link href="/admin/users">
                  <button className="w-full flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:!text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors text-sm font-medium">
                    <Users className="w-4 h-4" /> Users
                  </button>
                </Link>
                <Link href="/admin/report">
                  <button className="w-full flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:!text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors text-sm font-medium">
                    <BarChart2 className="w-4 h-4" /> Reports
                  </button>
                </Link>
                <Link href="/admin/support">
                  <button className="w-full flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:!text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors text-sm font-medium">
                    <Headphones className="w-4 h-4" /> Support
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* AI Accuracy Improvement */}
          <Card className={DASHBOARD_CARD}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                  AI Accuracy
                </CardTitle>
                <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64"><canvas ref={getCanvasRef('accuracy')} /></div>
            </CardContent>
          </Card>

          {/* Defect Trends */}
          <Card className={DASHBOARD_CARD}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                  Defect Trends (4w)
                </CardTitle>
                <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-72"><canvas ref={getCanvasRef('defectTrend')} /></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default OverviewTab
