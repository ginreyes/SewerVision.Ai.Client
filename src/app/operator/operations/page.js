'use client'
import React, { useState } from 'react'
import { Upload, Video, Play, Pause, CheckCircle, Clock, MapPin, Camera, Wifi, Battery, Monitor, Truck, AlertTriangle } from 'lucide-react'

const OperationsPage = () => {
  const [selectedDevice, setSelectedDevice] = useState('device1')
  
  const devices = [
    { 
      id: 'device1', 
      name: 'Truck A - Camera 1', 
      status: 'recording', 
      location: 'Main St & 1st Ave',
      recordingTime: '00:12:34',
      footage: '180 ft',
      aiDetections: 12,
      battery: 85,
      signal: 'strong',
      operator: 'John Smith'
    },
    { 
      id: 'device2', 
      name: 'Truck A - Camera 2', 
      status: 'ready', 
      location: 'Standby',
      recordingTime: '00:00:00',
      footage: '0 ft',
      aiDetections: 0,
      battery: 92,
      signal: 'strong',
      operator: 'John Smith'
    },
    { 
      id: 'device3', 
      name: 'Truck B - Camera 1', 
      status: 'uploading', 
      location: 'Oak Ave Pipeline',
      recordingTime: '00:00:00',
      footage: '245 ft',
      aiDetections: 8,
      battery: 67,
      signal: 'weak',
      operator: 'Sarah Johnson'
    },
    { 
      id: 'device4', 
      name: 'Truck C - Camera 1', 
      status: 'offline', 
      location: 'Broadway Segment',
      recordingTime: '00:00:00',
      footage: '0 ft',
      aiDetections: 0,
      battery: 23,
      signal: 'none',
      operator: 'Mike Davis'
    }
  ]

  const uploads = [
    { id: 1, device: 'Truck A - Camera 1', name: "Main St Pipeline - Section A", size: "245 MB", status: "uploading", progress: 67 },
    { id: 2, device: 'Truck B - Camera 1', name: "Oak Ave Inspection", size: "189 MB", status: "complete", progress: 100 },
    { id: 3, device: 'Truck A - Camera 2', name: "Broadway Segment 1-3", size: "312 MB", status: "pending", progress: 0 },
    { id: 4, device: 'Truck C - Camera 1', name: "Pine St Lateral", size: "156 MB", status: "failed", progress: 23 }
  ]

  const getDeviceStatusColor = (status) => {
    switch (status) {
      case 'recording': return 'bg-red-100 text-red-800 border-red-200'
      case 'ready': return 'bg-green-100 text-green-800 border-green-200'
      case 'uploading': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'offline': return 'bg-gray-100 text-gray-600 border-gray-200'
      default: return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const getSignalIcon = (signal) => {
    switch (signal) {
      case 'strong': return <Wifi className="w-4 h-4 text-green-600" />
      case 'weak': return <Wifi className="w-4 h-4 text-yellow-600" />
      case 'none': return <Wifi className="w-4 h-4 text-red-600" />
      default: return <Wifi className="w-4 h-4 text-gray-400" />
    }
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
          {devices.map((device) => (
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
          ))}
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
                  <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2">
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
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 mx-auto">
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
              {uploads.map((file) => (
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
              ))}
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