'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Brain, RefreshCw, Loader2, Layers, Image, Tag,
  CheckCircle2, Clock, FolderOpen, AlertCircle, ChevronDown, ChevronRight,
  ArrowLeft, BarChart2, Database, GitBranch, Zap,
} from 'lucide-react'
import { settingsApi } from '@/data/settingsApi'

/** Format metric — handles both 0.76 (fraction) and 76.59 (already %) */
function fmtPct(val) {
  if (val == null) return null
  const n = Number(val)
  if (n <= 1) return (n * 100).toFixed(1) // fraction → percentage
  return n.toFixed(1) // already a percentage
}

function MetricBadge({ label, value, color }) {
  const formatted = fmtPct(value)
  if (formatted == null) return null
  return (
    <div className="flex flex-col items-center px-3 py-2 bg-gray-50 rounded-lg border border-gray-100 min-w-[80px]">
      <span className={`text-lg font-bold ${color}`}>{formatted}%</span>
      <span className="text-[10px] text-gray-500 mt-0.5">{label}</span>
    </div>
  )
}

/** Detail view for a single project */
function ProjectDetail({ project, onBack }) {
  return (
    <div className="space-y-4">
      {/* Back button + header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-purple-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white shadow-md">
          <Layers className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900">{project.name}</h3>
          <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
            <span className="flex items-center gap-1"><Database className="w-3 h-3" />{project.images?.toLocaleString()} images</span>
            <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{project.type}</span>
            <span className="flex items-center gap-1"><GitBranch className="w-3 h-3" />{project.versions} version{project.versions !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-purple-50 text-purple-600 border border-purple-100 shrink-0">
          {project.id}
        </span>
      </div>

      {/* Class count */}
      {project.classes && Object.keys(project.classes).length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-3 border border-purple-100">
          <p className="text-xs font-semibold text-purple-700 mb-1">
            <Zap className="w-3 h-3 inline mr-1" />
            {Object.keys(project.classes).length} defect classes trained
          </p>
          <p className="text-[10px] text-purple-500">
            Total annotations: {Object.values(project.classes).reduce((s, v) => s + Number(v), 0).toLocaleString()}
          </p>
        </div>
      )}

      {/* Version list */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Trained Model Versions</p>
        <div className="space-y-2">
          {(project.versionDetails || []).length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No version details available</p>
            </div>
          )}
          {(project.versionDetails || []).map(v => (
            <div key={v.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-purple-200 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-base font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg">v{v.id}</span>
                  {v.model ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                      <CheckCircle2 className="w-2.5 h-2.5" />Trained
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200 text-[10px] font-medium">
                      <Clock className="w-2.5 h-2.5" />No model
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-gray-400">{v.images?.toLocaleString()} images</span>
              </div>

              {v.model && (
                <div className="flex items-center gap-2">
                  <MetricBadge label="mAP@50" value={v.model.map} color="text-emerald-600" />
                  <MetricBadge label="Precision" value={v.model.precision} color="text-blue-600" />
                  <MetricBadge label="Recall" value={v.model.recall} color="text-amber-600" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function RoboflowProjectsPanel() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedProject, setSelectedProject] = useState(null)

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await settingsApi.getRoboflowProjects()
      setData(result)
    } catch (err) {
      console.error('[RoboflowProjectsPanel] Error:', err)
      setError(err.message || 'Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }, [])

  // Show detail view if a project is selected
  if (selectedProject) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <ProjectDetail project={selectedProject} onBack={() => setSelectedProject(null)} />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-purple-600" />
          Roboflow Models & Versions
        </h3>
        <button
          onClick={fetchProjects}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-purple-300 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          {data ? 'Refresh' : 'Load from Roboflow'}
        </button>
      </div>

      {!data && !loading && !error && (
        <div className="text-center py-10 text-gray-400">
          <Brain className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Click "Load from Roboflow" to see available models and versions</p>
          <p className="text-xs mt-1 text-gray-300">Fetches live data from your Roboflow workspace</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {data && (
        <div className="space-y-2">
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
            <span>Workspace: <strong className="text-gray-700">{data.workspace?.name || '—'}</strong></span>
            <span>{data.workspace?.projects || data.projects?.length || 0} projects</span>
          </div>

          {(data.projects || []).map(project => {
            // Find the best trained version for the summary card
            const trainedVersions = (project.versionDetails || []).filter(v => v.model)
            const bestVersion = trainedVersions.length > 0 ? trainedVersions[trainedVersions.length - 1] : null

            return (
              <button
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 group-hover:bg-purple-100 flex items-center justify-center shrink-0 transition-colors">
                    <Layers className="w-5 h-5 text-purple-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">{project.name}</p>
                    <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-0.5">
                      <span className="flex items-center gap-0.5"><Image className="w-3 h-3" />{project.images?.toLocaleString()} images</span>
                      <span className="flex items-center gap-0.5"><Tag className="w-3 h-3" />{project.type}</span>
                      <span>{project.versions} version{project.versions !== 1 ? 's' : ''}</span>
                      {trainedVersions.length > 0 && (
                        <span className="flex items-center gap-0.5 text-emerald-600">
                          <CheckCircle2 className="w-3 h-3" />{trainedVersions.length} trained
                        </span>
                      )}
                    </div>
                    {/* Best version summary */}
                    {bestVersion && (
                      <div className="flex items-center gap-2 mt-1.5 text-[10px]">
                        <span className="text-gray-400">Latest trained:</span>
                        <span className="font-mono font-bold text-purple-600">v{bestVersion.id}</span>
                        {bestVersion.model.map != null && <span className="text-gray-500">mAP: <strong className="text-emerald-600">{fmtPct(bestVersion.model.map)}%</strong></span>}
                        {bestVersion.model.precision != null && <span className="text-gray-500">P: <strong className="text-blue-600">{fmtPct(bestVersion.model.precision)}%</strong></span>}
                        {bestVersion.model.recall != null && <span className="text-gray-500">R: <strong className="text-amber-600">{fmtPct(bestVersion.model.recall)}%</strong></span>}
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-purple-500 transition-colors shrink-0" />
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

const AiModelsTab = ({ aiDetections, getCanvasRef }) => {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">AI Model Management</h2>
      </div>

      {/* AI Performance Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">AI Model Performance Metrics</h3>
          <Brain className="w-5 h-5 text-purple-600" />
        </div>
        <div className="h-80"><canvas ref={getCanvasRef('aiPerformance')} /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Roboflow Projects */}
        <RoboflowProjectsPanel />

        {/* Confidence Thresholds */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Confidence Thresholds</h3>
          <div className="space-y-4">
            {aiDetections.map((detection, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-700">{detection.type}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${detection.confidence}%` }} />
                  </div>
                  <span className="text-sm text-gray-600 w-12">{Math.round(detection.confidence)}%</span>
                  <button onClick={() => router.push('/admin/settings?tab=ai-models')} className="text-blue-600 hover:text-blue-800 text-sm">Adjust</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AiModelsTab
