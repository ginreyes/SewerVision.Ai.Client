'use client'
import { useRouter } from 'next/navigation'
import { Brain } from 'lucide-react'

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
        {/* Training Progress */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Training Progress</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Training Data</span>
              <span className="font-semibold text-blue-600">15,420 frames</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Validation Accuracy</span>
              <span className="font-semibold text-green-600">92.8%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Training Epochs</span>
              <span className="font-semibold text-purple-600">847/1000</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '84.7%' }} />
            </div>
          </div>
        </div>

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
