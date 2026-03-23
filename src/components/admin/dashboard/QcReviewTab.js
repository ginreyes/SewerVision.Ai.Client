'use client'
import { useRouter } from 'next/navigation'
import { Shield, Clock, AlertTriangle, Eye, CheckCircle } from 'lucide-react'
import StatsCard from './StatsCard'

const QcReviewTab = ({ qcReviewProjects, projectStats }) => {
  const router = useRouter()

  const totalDefects = qcReviewProjects.reduce((sum, p) => sum + (p.defects || 0), 0)
  const pendingDetections = qcReviewProjects.reduce((sum, p) => sum + (p.pending || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">QC Review Queue</h2>
        <button onClick={() => router.push('/admin/task')} className="flex items-center space-x-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors">
          <Shield className="w-4 h-4" />
          <span>View All QC Tasks</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard label="Projects in QC" value={qcReviewProjects.length} icon={Clock} iconBg="bg-amber-100" iconColor="text-amber-600" subtitle="Awaiting QC review" subtitleColor="text-amber-600" />
        <StatsCard label="Total Defects" value={totalDefects} icon={AlertTriangle} iconBg="bg-red-100" iconColor="text-red-600" subtitle="Across all QC projects" subtitleColor="text-red-600" />
        <StatsCard label="Pending Detections" value={pendingDetections} icon={Eye} iconBg="bg-blue-100" iconColor="text-blue-600" subtitle="Still need review" subtitleColor="text-blue-600" />
        <StatsCard label="Completed Reviews" value={projectStats.completed} icon={CheckCircle} iconBg="bg-green-100" iconColor="text-green-600" subtitle="QC approved projects" subtitleColor="text-green-600" />
      </div>

      {/* QC Projects List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Projects Pending QC Review</h3>
            <span className="text-sm text-gray-500">{qcReviewProjects.length} project{qcReviewProjects.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div className="p-6">
          {qcReviewProjects.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No projects pending QC review</p>
            </div>
          ) : (
            <div className="space-y-4">
              {qcReviewProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/admin/project/${project.id}`)}>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{project.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">{project.inspector} &bull; {project.date}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded">{project.defects || 0} detections</span>
                      {project.pending > 0 && <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">{project.pending} pending</span>}
                      {project.approved > 0 && <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">{project.approved} approved</span>}
                      {project.rejected > 0 && <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">{project.rejected} rejected</span>}
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); router.push(`/admin/qc-review/${project.id}`) }} className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">Review</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default QcReviewTab
