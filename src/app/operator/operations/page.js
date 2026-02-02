'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Upload,
  Video,
  Play,
  Pause,
  CheckCircle,
  Clock,
  MapPin,
  Camera,
  Wifi,
  WifiOff,
  Battery,
  Monitor,
  Truck,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Signal,
  Zap,
  HardDrive,
  ChevronRight,
  MoreVertical,
  Eye,
  Radio
} from 'lucide-react'
import { api } from '@/lib/helper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    recording: { color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500 animate-pulse' },
    ready: { color: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' },
    online: { color: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
    uploading: { color: 'bg-purple-100 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
    offline: { color: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' }
  }

  const config = statusConfig[status] || statusConfig.offline

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span className="capitalize">{status}</span>
    </span>
  )
}

// Device Card Component
const DeviceCard = ({ device, isSelected, onClick, onStartRecording, onStopRecording }) => {
  const getBatteryColor = (level) => {
    if (level > 50) return 'text-green-500'
    if (level > 20) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getSignalColor = (signal) => {
    if (signal === 'strong') return 'text-green-500'
    if (signal === 'weak') return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${isSelected
          ? 'border-blue-500 shadow-md ring-2 ring-blue-100'
          : 'border-transparent hover:border-gray-200'
        }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${device.status === 'recording' ? 'bg-red-100' : 'bg-gray-100'}`}>
            <Camera className={`w-4 h-4 ${device.status === 'recording' ? 'text-red-600' : 'text-gray-600'}`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{device.name}</h3>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {device.location}
            </p>
          </div>
        </div>
        <StatusBadge status={device.status} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <Battery className={`w-3.5 h-3.5 ${getBatteryColor(device.battery)}`} />
          </div>
          <p className="text-xs font-medium text-gray-900">{device.battery}%</p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <Signal className={`w-3.5 h-3.5 ${getSignalColor(device.signal)}`} />
          </div>
          <p className="text-xs font-medium text-gray-900 capitalize">{device.signal}</p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <Zap className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <p className="text-xs font-medium text-gray-900">{device.aiDetections}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {device.status === 'recording' ? (
          <Button
            size="sm"
            variant="destructive"
            className="w-full gap-1.5"
            onClick={(e) => { e.stopPropagation(); onStopRecording(device.id); }}
          >
            <Pause className="w-3.5 h-3.5" />
            Stop
          </Button>
        ) : device.status === 'ready' || device.status === 'online' ? (
          <Button
            size="sm"
            className="w-full gap-1.5 bg-green-600 hover:bg-green-700"
            onClick={(e) => { e.stopPropagation(); onStartRecording(device.id); }}
          >
            <Play className="w-3.5 h-3.5" />
            Record
          </Button>
        ) : (
          <Button size="sm" variant="outline" className="w-full" disabled>
            <WifiOff className="w-3.5 h-3.5 mr-1.5" />
            Offline
          </Button>
        )}
      </div>
    </div>
  )
}

// Upload Item Component
const UploadItem = ({ upload }) => {
  const statusColors = {
    completed: 'text-green-600',
    complete: 'text-green-600',
    uploading: 'text-blue-600',
    pending: 'text-gray-500',
    failed: 'text-red-600'
  }

  const progressColors = {
    completed: 'bg-green-500',
    complete: 'bg-green-500',
    uploading: 'bg-blue-500',
    pending: 'bg-gray-300',
    failed: 'bg-red-500'
  }

  return (
    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
      <div className={`p-2 rounded-lg ${upload.status === 'completed' || upload.status === 'complete' ? 'bg-green-100' : 'bg-blue-100'}`}>
        {upload.status === 'uploading' ? (
          <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
        ) : upload.status === 'completed' || upload.status === 'complete' ? (
          <CheckCircle className="w-4 h-4 text-green-600" />
        ) : upload.status === 'failed' ? (
          <AlertTriangle className="w-4 h-4 text-red-600" />
        ) : (
          <HardDrive className="w-4 h-4 text-gray-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium text-gray-900 truncate">{upload.name}</p>
          <span className={`text-xs font-medium ${statusColors[upload.status] || 'text-gray-500'}`}>
            {upload.progress}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progressColors[upload.status] || 'bg-gray-300'}`}
              style={{ width: `${upload.progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">{upload.size}</span>
        </div>
      </div>
    </div>
  )
}

// Main Component
const OperationsPage = () => {
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [devices, setDevices] = useState([])
  const [uploads, setUploads] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Helper function to format devices
  const formatDevice = (device, index, username) => ({
    id: device._id,
    name: device.name || `Device ${index + 1}`,
    status: device.status || 'offline',
    location: device.location || 'Unknown',
    recordingTime: '00:00:00',
    footage: '0 ft',
    aiDetections: 0,
    battery: device.specifications?.battery ? parseInt(device.specifications.battery) : 0,
    signal: device.status === 'online' ? 'strong' : device.status === 'offline' ? 'none' : 'weak',
    operator: device.operator?.first_name && device.operator?.last_name
      ? `${device.operator.first_name} ${device.operator.last_name}`
      : username
  })

  const fetchData = useCallback(async () => {
    try {
      const username = localStorage.getItem('username')
      if (!username) return

      const userResponse = await api(`/api/users/role/${username}`, 'GET')
      if (!userResponse.ok || !userResponse.data?._id) return

      const userId = userResponse.data._id

      // Fetch devices
      const devicesResponse = await api('/api/devices/get-all-devices', 'GET')
      if (devicesResponse.ok && devicesResponse.data?.data) {
        const allDevices = devicesResponse.data.data
        const operatorDevices = allDevices.filter(d =>
          d.operator && (d.operator._id === userId || d.operator.toString() === userId)
        )

        const formattedDevices = operatorDevices.map((device, index) => formatDevice(device, index, username))
        setDevices(formattedDevices)
        if (formattedDevices.length > 0 && !selectedDevice) {
          setSelectedDevice(formattedDevices[0].id)
        }
      }

      // Fetch uploads
      const uploadsResponse = await api('/api/uploads/get-all-uploads?limit=10', 'GET')
      if (uploadsResponse.ok && uploadsResponse.data?.data?.uploads) {
        const allUploads = uploadsResponse.data.data.uploads
        const formattedUploads = allUploads.slice(0, 5).map((upload, index) => ({
          id: upload._id,
          device: upload.device || `Device ${index + 1}`,
          name: upload.originalName || upload.filename || `Upload ${index + 1}`,
          size: upload.size || '0 MB',
          status: upload.status || 'pending',
          progress: upload.status === 'completed' ? 100 : upload.status === 'uploading' ? 67 : upload.status === 'failed' ? 23 : 0
        }))
        setUploads(formattedUploads)
      }
    } catch (error) {
      console.error('Error fetching operations data:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedDevice])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
  }

  const handleStartRecording = useCallback(async (deviceId) => {
    try {
      await api(`/api/operations/devices/${deviceId}/start-recording`, 'POST')
      await fetchData()
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }, [fetchData])

  const handleStopRecording = useCallback(async (deviceId) => {
    try {
      await api(`/api/operations/devices/${deviceId}/stop-recording`, 'POST')
      await fetchData()
    } catch (error) {
      console.error('Error stopping recording:', error)
    }
  }, [fetchData])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-3" />
          <p className="text-gray-500">Loading operations...</p>
        </div>
      </div>
    )
  }

  const selectedDeviceData = devices.find(d => d.id === selectedDevice)
  const recordingCount = devices.filter(d => d.status === 'recording').length
  const onlineCount = devices.filter(d => d.status === 'online' || d.status === 'ready').length
  const offlineCount = devices.filter(d => d.status === 'offline').length

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Operations Center</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage devices and monitor field recordings</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Quick Stats */}
          <div className="hidden md:flex items-center gap-4 mr-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-medium">{recordingCount} Recording</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm font-medium">{onlineCount} Online</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              <span className="text-sm font-medium">{offlineCount} Offline</span>
            </div>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Device Grid */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-600" />
                  Your Devices
                </CardTitle>
                <Badge variant="secondary">{devices.length} devices</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {devices.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {devices.map((device) => (
                    <DeviceCard
                      key={device.id}
                      device={device}
                      isSelected={selectedDevice === device.id}
                      onClick={() => setSelectedDevice(device.id)}
                      onStartRecording={handleStartRecording}
                      onStopRecording={handleStopRecording}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-medium text-gray-900 mb-1">No Devices Assigned</h3>
                  <p className="text-sm text-gray-500">Contact your administrator to assign devices</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Selected Device Detail - Only on larger screens */}
          {selectedDeviceData && (
            <Card className="border-0 shadow-sm overflow-hidden">
              <div className={`p-4 ${selectedDeviceData.status === 'recording' ? 'bg-gradient-to-r from-red-500 to-rose-600' : 'bg-gradient-to-r from-blue-500 to-indigo-600'} text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedDeviceData.status === 'recording' && (
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                    )}
                    <div>
                      <h3 className="font-semibold">{selectedDeviceData.name}</h3>
                      <p className="text-sm opacity-90">{selectedDeviceData.location}</p>
                    </div>
                  </div>
                  {selectedDeviceData.status === 'recording' && (
                    <div className="text-right">
                      <p className="text-2xl font-mono font-bold">{selectedDeviceData.recordingTime}</p>
                      <p className="text-xs opacity-80">Recording Time</p>
                    </div>
                  )}
                </div>
              </div>
              <CardContent className="p-4">
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <Video className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900">{selectedDeviceData.footage}</p>
                    <p className="text-xs text-gray-500">Footage</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <Zap className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900">{selectedDeviceData.aiDetections}</p>
                    <p className="text-xs text-gray-500">AI Detections</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <Battery className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900">{selectedDeviceData.battery}%</p>
                    <p className="text-xs text-gray-500">Battery</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <Signal className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900 capitalize">{selectedDeviceData.signal}</p>
                    <p className="text-xs text-gray-500">Signal</p>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  {selectedDeviceData.status === 'recording' ? (
                    <>
                      <Button
                        variant="destructive"
                        className="flex-1 gap-2"
                        onClick={() => handleStopRecording(selectedDeviceData.id)}
                      >
                        <Pause className="w-4 h-4" />
                        Stop Recording
                      </Button>
                      <Button variant="outline" className="gap-2">
                        <Eye className="w-4 h-4" />
                        Live View
                      </Button>
                    </>
                  ) : selectedDeviceData.status === 'ready' || selectedDeviceData.status === 'online' ? (
                    <Button
                      className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                      onClick={() => handleStartRecording(selectedDeviceData.id)}
                    >
                      <Play className="w-4 h-4" />
                      Start Recording
                    </Button>
                  ) : (
                    <Button variant="outline" className="flex-1" disabled>
                      <WifiOff className="w-4 h-4 mr-2" />
                      Device Offline
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right - Upload Queue */}
        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Upload className="w-5 h-5 text-purple-600" />
                  Upload Queue
                </CardTitle>
                <Badge variant="secondary">{uploads.length} files</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {uploads.length > 0 ? (
                uploads.map((upload) => (
                  <UploadItem key={upload.id} upload={upload} />
                ))
              ) : (
                <div className="text-center py-8">
                  <HardDrive className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No uploads in queue</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Workflow Status */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Radio className="w-5 h-5 text-indigo-600" />
                AI Processing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Real-time Detection</p>
                  <p className="text-xs text-gray-500">Active on all recordings</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Monitor className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Cloud Sync</p>
                  <p className="text-xs text-gray-500">Auto-upload enabled</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Zap className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">PACP Compliance</p>
                  <p className="text-xs text-gray-500">Standards verified</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default OperationsPage