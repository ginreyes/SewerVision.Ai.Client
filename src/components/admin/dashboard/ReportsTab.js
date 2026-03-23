'use client'
import { useRouter } from 'next/navigation'
import { FileText, CheckCircle, Brain, Database } from 'lucide-react'
import StatsCard from './StatsCard'

const ReportsTab = ({ projectStats, recentProjects }) => {
  const router = useRouter()
  const completedProjects = recentProjects.filter(p => p.status === 'completed').slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
        <button onClick={() => router.push('/admin/report')} className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
          <FileText className="w-4 h-4" />
          <span>View All Reports</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard label="Total Reports" value={projectStats.completed} icon={FileText} iconBg="bg-blue-100" iconColor="text-blue-600" />
        <StatsCard label="Completed" value={projectStats.completed} icon={CheckCircle} iconBg="bg-green-100" iconColor="text-green-600" />
        <StatsCard label="AI Accuracy" value={`${projectStats.aiAccuracy}%`} icon={Brain} iconBg="bg-purple-100" iconColor="text-purple-600" />
        <StatsCard label="Total Projects" value={projectStats.totalProjects} icon={Database} iconBg="bg-indigo-100" iconColor="text-indigo-600" />
      </div>

      {/* Completed Projects List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Completed Projects</h3>
            <button onClick={() => router.push('/admin/report')} className="text-sm text-blue-600 hover:text-blue-800 font-medium">View All Reports &rarr;</button>
          </div>
        </div>
        <div className="p-6">
          {completedProjects.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No completed projects yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/admin/project/${project.id}`)}>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{project.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">Completed by {project.inspector} &bull; {project.date}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">{project.defects || 0} defects</span>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">Report ready</span>
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); router.push('/admin/report') }} className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">View Report</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReportsTab
