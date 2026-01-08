'use client'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Upload, Video, Play, Pause, CheckCircle, Clock, MapPin, Camera, Wifi, Battery, Monitor, Truck, AlertTriangle } from 'lucide-react'
import { api } from '@/lib/helper'

const OperationsPage = () => {
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [devices, setDevices] = useState([])
  const [uploads, setUploads] = useState([])
  const [loading, setLoading] = useState(true)
  
  const fetchData = useCallback(async () => {
      try {
        const username = localStorage.getItem('username')
        if (!username) return

        // Get user ID
        const userResponse = await api(`/api/users/role/${username}`, 'GET')
        if (!userResponse.ok || !userResponse.data?._id) return

        const userId = userResponse.data._id

        // Fetch devices assigned to operator
        const devicesResponse = await api('/api/devices/get-all-devices', 'GET')
        if (devicesResponse.ok && devicesResponse.data?.data) {
          const allDevices = devicesResponse.data.data
          const operatorDevices = allDevices.filter(d => 
            d.operator && (d.operator._id === userId || d.operator.toString() === userId)
          )
          
          const formattedDevices = operatorDevices.map((device, index) => formatDevice(device, index, username))
          
          setDevices(formattedDevices)
          if (formattedDevices.length > 0) {
            setSelectedDevice(formattedDevices[0].id)
          }
        }

        // Fetch uploads
        const uploadsResponse = await api('/api/uploads/get-all-uploads?limit=10', 'GET')
        if (uploadsResponse.ok && uploadsResponse.data?.data?.uploads) {
          const allUploads = uploadsResponse.data.data.uploads
          const formattedUploads = allUploads.slice(0, 4).map((upload, index) => ({
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
    }

    fetchData()
  }, [fetchData])

  const handleStartRecording = useCallback(async (deviceId) => {
    try {
      const response = await api(`/api/operations/devices/${deviceId}/start-recording`, 'POST')
      if (response.ok) {
        // Refresh devices
        const devicesResponse = await api('/api/devices/get-all-devices', 'GET')
        if (devicesResponse.ok && devicesResponse.data?.data) {
          const allDevices = devicesResponse.data.data
          const username = localStorage.getItem('username')
          const userResponse = await api(`/api/users/role/${username}`, 'GET')
          if (userResponse.ok && userResponse.data?._id) {
            const userId = userResponse.data._id
            const operatorDevices = allDevices.filter(d => 
              d.operator && (d.operator._id === userId || d.operator.toString() === userId)
            )
            const formattedDevices = operatorDevices.map((device, index) => formatDevice(device, index, username))
            setDevices(formattedDevices)
          }
        }
      }
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }, [])

  const handleStopRecording = useCallback(async (deviceId) => {
    try {
      const response = await api(`/api/operations/devices/${deviceId}/stop-recording`, 'POST')
      if (response.ok) {
        // Refresh devices
        const devicesResponse = await api('/api/devices/get-all-devices', 'GET')
        if (devicesResponse.ok && devicesResponse.data?.data) {
          const allDevices = devicesResponse.data.data
          const username = localStorage.getItem('username')
          const userResponse = await api(`/api/users/role/${username}`, 'GET')
          if (userResponse.ok && userResponse.data?._id) {
            const userId = userResponse.data._id
            const operatorDevices = allDevices.filter(d => 
              d.operator && (d.operator._id === userId || d.operator.toString() === userId)
            )
            const formattedDevices = operatorDevices.map((device, index) => formatDevice(device, index, username))
            setDevices(formattedDevices)
          }
        }
      }
    } catch (error) {
      console.error('Error stopping recording:', error)
    }
  }, [])

  // Helper function to format devices (reusable)
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

  const getDeviceStatusColor = useCallback((status) => {
    switch (status) {
      case 'recording': return 'bg-red-100 text-red-800 border-red-200'
      case 'ready': return 'bg-green-100 text-green-800 border-green-200'
      case 'uploading': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'offline': return 'bg-gray-100 text-gray-600 border-gray-200'
      default: return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }, [])

  const getSignalIcon = useCallback((signal) => {
    switch (signal) {
      case 'strong': return <Wifi className="w-4 h-4 text-green-600" />
      case 'weak': return <Wifi className="w-4 h-4 text-yellow-600" />
      case 'none': return <Wifi className="w-4 h-4 text-red-600" />
      default: return <Wifi className="w-4 h-4 text-gray-400" />
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading operations data...</div>
      </div>
    )
  }

  const selectedDeviceData = devices.find(d => d.id === selectedDevice)

  return (
    <div className="max-w-8xl mx-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Multi-Device Operations</h1>
              <p className="text-gray-600 mt-1">PACP Certified Operator - Fleet Management</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{devices.filter(d => d.status === 'recording').length}</div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{devices.filter(d => d.status === 'ready').length}</div>
                <div className="text-sm text-gray-600">Ready</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{devices.filter(d => d.status === 'offline').length}</div>
                <div className="text-sm text-gray-600">Offline</div>
              </div>
            </div>
          </div>
        </div>

        {/* Device Grid Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {devices.length > 0 ? devices.map((device) => (
            <div 
              key={device.id}
              onClick={() => setSelectedDevice(device.id)}
              className={`bg-white rounded-lg shadow-sm p-4 cursor-pointer transition-all hover:shadow-md ${
                selectedDevice === device.id ? 'ring-2 ring-blue-500 border-blue-200' : 'border border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Truck className="w-5 h-5 text-gray-600" />
                  <h3 className="font-medium text-gray-900 text-sm">{device.name}</h3>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDeviceStatusColor(device.status)}`}>
                  {device.status}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="text-gray-900 font-medium">{device.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Operator:</span>
                  <span className="text-gray-900">{device.operator}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Signal:</span>
                  {getSignalIcon(device.signal)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Battery:</span>
                  <div className="flex items-center space-x-1">
                    <Battery className={`w-4 h-4 ${device.battery > 50 ? 'text-green-600' : device.battery > 20 ? 'text-yellow-600' : 'text-red-600'}`} />
                    <span className="text-gray-900">{device.battery}%</span>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              No devices assigned. Please contact an administrator.
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Selected Device Control */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Device Control</h2>
              <span className="text-lg font-medium text-gray-600">{selectedDeviceData?.name}</span>
            </div>
            
            {selectedDeviceData?.status === 'recording' ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <h3 className="text-lg font-semibold text-gray-900">Recording Active</h3>
                  </div>
                  <div className="text-2xl font-mono text-gray-900">{selectedDeviceData.recordingTime}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{selectedDeviceData.footage}</div>
                    <div className="text-sm text-gray-600">Inspected</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{selectedDeviceData.aiDetections}</div>
                    <div className="text-sm text-gray-600">AI Detections</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">Live</div>
                    <div className="text-sm text-gray-600">Processing</div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button 
                    onClick={() => handleStopRecording(selectedDeviceData.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2"
                  >
                    <Pause className="w-5 h-5" />
                    <span>Stop Recording</span>
                  </button>
                  <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium">
                    Add Annotation
                  </button>
                </div>
              </div>
            ) : selectedDeviceData?.status === 'ready' ? (
              <div className="text-center py-8">
                <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Device Ready</h3>
                <p className="text-gray-600 mb-6">Location: {selectedDeviceData.location}</p>
                <button 
                  onClick={() => handleStartRecording(selectedDeviceData.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 mx-auto"
                >
                  <Play className="w-5 h-5" />
                  <span>Start Recording</span>
                </button>
              </div>
            ) : selectedDeviceData?.status === 'offline' ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Device Offline</h3>
                <p className="text-gray-600 mb-6">Check connection and battery status</p>
                <button className="bg-gray-400 text-white px-6 py-3 rounded-lg font-medium cursor-not-allowed">
                  Reconnecting...
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Upload className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Uploading Data</h3>
                <p className="text-gray-600 mb-6">Please wait while data syncs to cloud</p>
              </div>
            )}
          </div>

          {/* Upload Queue - All Devices */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Queue - All Devices</h2>
            <div className="space-y-4">
              {uploads.length > 0 ? uploads.map((file) => (
                <div key={file.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">{file.name}</h3>
                      <p className="text-sm text-gray-600">{file.device}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      file.status === 'complete' ? 'bg-green-100 text-green-800' :
                      file.status === 'uploading' ? 'bg-blue-100 text-blue-800' :
                      file.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {file.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>{file.size}</span>
                    <span>{file.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        file.status === 'complete' ? 'bg-green-500' : 
                        file.status === 'failed' ? 'bg-red-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${file.progress}%` }}
                    ></div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  No uploads in queue
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fleet AI Status */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Fleet AI Workflow Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white rounded-lg p-4">
              <Monitor className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Multi-Device Sync</h3>
              <p className="text-sm text-gray-600">All devices stream to unified cloud</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <Video className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Parallel Processing</h3>
              <p className="text-sm text-gray-600">AI processes multiple feeds simultaneously</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Cross-Device Analytics</h3>
              <p className="text-sm text-gray-600">Consolidated detection across fleet</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Real-Time Coordination</h3>
              <p className="text-sm text-gray-600">Manage multiple inspections efficiently</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OperationsPage