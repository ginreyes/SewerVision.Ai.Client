'use client'

import React, { useEffect, useState } from 'react'
import {
  Camera,
  Smartphone,
  Tablet,
  Upload,
  Play,
  CheckCircle,
  Clock,
  Battery,
  Settings,
  Plus,
  Search,
  Cloud,
  Eye,
  Brain,
  FileText,
  Truck,
  MapPin,
  Monitor,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import AddDeviceModal from './components/AddDeviceModal'
import ViewFootage from './components/ViewFotage'
import DeviceSettingsModal from './components/DeviceSettingModal'
import { api } from '@/lib/helper'

const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
)

const DeviceCard = ({ device, isField = true, onSettings, onViewFootage, isSelected }) => {
  const Icon = getDeviceIcon(device.type)
  const aiStatus = isField ? getAIProcessingStatus(device.aiProcessing) : null

  return (
    <div
      className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
        isSelected
          ? 'ring-2 ring-blue-500 scale-[1.02] bg-blue-50'
          : 'hover:-translate-y-1'
      }`}
      onClick={() => onSettings(device)}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${device.color} text-white`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(device.status)}
            <span className={`text-sm font-medium ${getStatusColor(device.status)}`}>
              {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
            </span>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">{device.name}</h3>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center justify-between">
            <span className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {device.location}
            </span>
            {isField && device.battery && (
              <span className="flex items-center">
                <Battery className="w-4 h-4 mr-1" />
                {device.battery}%
              </span>
            )}
          </div>

          {isField && device.operator && (
            <div className="flex items-center">
              <span>Operator: {device.operator}</span>
            </div>
          )}

          {!isField && device.load && (
            <div className="flex items-center justify-between">
              <span>Load: {device.load}%</span>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  device.performance === 'high'
                    ? 'bg-green-100 text-green-800'
                    : device.performance === 'optimal'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {device.performance}
              </span>
            </div>
          )}

          {isField && device.footage && (
            <div className="flex items-center justify-between">
              <span>Footage: {device.footage}</span>
              <span>Duration: {device.duration}</span>
            </div>
          )}

          {!isField && device.currentTask && (
            <div className="text-xs text-gray-500">Current: {device.currentTask}</div>
          )}
        </div>

        {isField && device.aiProcessing && (
          <div className="mt-4 flex items-center justify-between">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${aiStatus.color}`}>
              {aiStatus.text}
            </span>
            {device.confidence && (
              <span className="text-xs text-gray-500">Confidence: {device.confidence}%</span>
            )}
          </div>
        )}

        <div className="mt-4 flex space-x-2">
          {isField && device.hasFootage ? (
            <Button
              className="flex-1 bg-blue-500"
              onClick={(e) => {
                e.stopPropagation()
                onViewFootage(device)
              }}
            >
              <Play className="w-4 h-4 mr-2" />
              View Footage
            </Button>
          ) : (
            <Button variant="outline" className="flex-1" disabled={!device.hasFootage}>
              {isField ? (device.hasFootage ? 'View Footage' : 'No Footage') : 'Monitor'}
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              onSettings(device)
            }}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// --- Utility Functions ---
const getDeviceIcon = (type) => {
  const icons = {
    camera: Camera,
    tablet: Tablet,
    smartphone: Smartphone,
    console: Monitor,
    'ai-server': Brain,
    storage: Cloud,
    workstation: FileText,
    scanner: Smartphone,
    default: Monitor,
  }
  return icons[type] || icons.default
}

const getStatusColor = (status) => {
  const colors = {
    online: 'text-green-500',
    recording: 'text-red-500',
    processing: 'text-yellow-500',
    uploading: 'text-blue-500',
    active: 'text-green-500',
    offline: 'text-gray-400',
    completed: 'text-purple-500',
  }
  return colors[status] || 'text-gray-400'
}

const getStatusIcon = (status) => {
  switch (status) {
    case 'recording':
      return <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
    case 'processing':
      return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />
    case 'uploading':
      return <Upload className="w-4 h-4 text-blue-500 animate-bounce" />
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-purple-500" />
    case 'online':
      return <div className="w-2 h-2 bg-green-500 rounded-full" />
    case 'active':
      return <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
    default:
      return <div className="w-2 h-2 bg-gray-400 rounded-full" />
  }
}

const getAIProcessingStatus = (status) => {
  const statusInfo = {
    ready: { color: 'bg-blue-100 text-blue-800', text: 'Ready for AI' },
    processing: { color: 'bg-yellow-100 text-yellow-800', text: 'AI Processing' },
    uploading: { color: 'bg-purple-100 text-purple-800', text: 'Uploading' },
    completed: { color: 'bg-green-100 text-green-800', text: 'AI Complete' },
  }
  return statusInfo[status] || { color: 'bg-gray-100 text-gray-800', text: 'Unknown' }
}

// --- Main Component ---
const Devices = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [activeTab, setActiveTab] = useState('field')
  const [showModal, setShowModal] = useState(false)
  const [currentView, setCurrentView] = useState('devices')
  const [selectedFootageDevice, setSelectedFootageDevice] = useState(null)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [selectedSettingsDevice, setSelectedSettingsDevice] = useState(null)
  const [fieldDevices, setFieldDevices] = useState([])
  const [cloudDevices, setCloudDevices] = useState([])
  const [selectedDeviceId, setSelectedDeviceId] = useState(null)

  // ✅ Define fetchDevices as a reusable function
  const fetchDevices = async () => {
    try {
      const { data, error } = await api('/api/devices/get-device')
      if (error) {
        console.error('Error fetching devices:', error)
        return
      }

      const enriched = data.map(device => {
        const colorMap = {
          camera: 'bg-gradient-to-br from-blue-500 to-purple-600',
          tablet: 'bg-gradient-to-br from-green-500 to-emerald-600',
          smartphone: 'bg-gradient-to-br from-gray-500 to-gray-700',
          console: 'bg-gradient-to-br from-orange-500 to-red-600',
          'ai-server': 'bg-gradient-to-br from-purple-500 to-pink-600',
          storage: 'bg-gradient-to-br from-blue-500 to-cyan-600',
          workstation: 'bg-gradient-to-br from-indigo-500 to-blue-600',
          default: 'bg-gradient-to-br from-gray-400 to-gray-600',
        }

        const type = device.type?.toLowerCase() || 'default'
        const color = colorMap[type] || colorMap.default

        // Simulate real UI data
        const isField = device.category === 'field'
        const fakeBattery = isField ? Math.floor(Math.random() * 100) : null
        const fakeFootage = isField ? `${Math.floor(Math.random() * 10)} GB` : null
        const fakeDuration = isField ? `${Math.floor(Math.random() * 60) + 10} min` : null
        const fakeConfidence = isField ? Math.floor(Math.random() * 15) + 85 : null

        return {
          ...device,
          id: device._id,
          color,
          battery: fakeBattery,
          footage: fakeFootage,
          duration: fakeDuration,
          confidence: fakeConfidence,
          hasFootage: !!fakeFootage,
          aiProcessing: device.settings?.aiEnabled ? 'ready' : 'completed',
          operator: device.operator || 'Unassigned',
          icon: getDeviceIcon(type),
        }
      })

      setFieldDevices(enriched.filter(d => d.category === 'field'))
      setCloudDevices(enriched.filter(d => d.category === 'cloud'))
    } catch (err) {
      console.error('Fetch error:', err)
    }
  }

  // ✅ Fetch devices on mount
  useEffect(() => {
    fetchDevices()
  }, [])

  // ✅ Helper to get current device list
  const getDevices = () => {
    return activeTab === 'field' ? fieldDevices : cloudDevices
  }

  const filteredDevices = getDevices().filter(device => {
    const matchesSearch =
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.type.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === 'all' || device.status === filterStatus
    return matchesSearch && matchesFilter
  })

  // ✅ FIXED: Set correct device + clear footage state to avoid cross-contamination
  const handleViewFootage = (device) => {
    if (device.hasFootage) {
      console.log('▶️ Viewing footage for:', device.name, device._id)
      setSelectedDeviceId(device._id)
      setSelectedFootageDevice(device)
      setCurrentView('footage')
    } else {
      alert('No footage available for this device')
    }
  }

  const handleBackToDevices = () => {
    console.log('🔙 Returning to device list')
    setCurrentView('devices')
    setSelectedFootageDevice(null)
    // Keep selection: setSelectedDeviceId(null)
  }

  const handleOpenSettings = (device) => {
    console.log('⚙️ Opening settings for:', device.name, device._id)
    setSelectedDeviceId(device._id)
    setSelectedSettingsDevice(device) 
    setSelectedFootageDevice(null)   
    setShowSettingsModal(true)
  }

  if (currentView === 'footage' && selectedFootageDevice) {
    return (
      <ViewFootage
        deviceId={selectedFootageDevice.id}
        footageId={selectedFootageDevice.footageId || 'default'}
        deviceName={selectedFootageDevice.name}
        onBack={handleBackToDevices}
      />
    )
  }

  return (
    <div className="max-w-7xl mx-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">SewerVision.ai Devices</h1>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Live System
              </span>
            </div>
            <Button variant="gradient" onClick={() => setShowModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Device
            </Button>
          </div>
        </div>
      </div>

      <AddDeviceModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        onAddDevice={(newDevice) => {
          console.log('✅ New device added:', newDevice)
        }}
        onSuccess={fetchDevices}
      />

      {/* ✅ Pass selectedSettingsDevice — now always correct */}
      <DeviceSettingsModal
        isOpen={showSettingsModal}
        onClose={() => {
          setShowSettingsModal(false)
          // Optionally clear: setSelectedDeviceId(null)
        }}
        device={selectedSettingsDevice} // ✅ This is now properly set
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Active Inspections" value="3" subtitle="Field devices recording" icon={Camera} color="bg-gradient-to-br from-blue-500 to-purple-600" />
          <StatCard title="AI Processing Queue" value="12" subtitle="Videos awaiting analysis" icon={Brain} color="bg-gradient-to-br from-purple-500 to-pink-600" />
          <StatCard title="QC Reviews Pending" value="8" subtitle="Awaiting technician review" icon={Eye} color="bg-gradient-to-br from-orange-500 to-red-600" />
          <StatCard title="Reports Generated" value="156" subtitle="This month" icon={FileText} color="bg-gradient-to-br from-green-500 to-emerald-600" />
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('field')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeTab === 'field'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Truck className="w-4 h-4 mr-2 inline" />
              Field Devices
            </button>
            <button
              onClick={() => setActiveTab('cloud')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeTab === 'cloud'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Cloud className="w-4 h-4 mr-2 inline" />
              Cloud Infrastructure
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search devices..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="online">Online</option>
            <option value="recording">Recording</option>
            <option value="processing">Processing</option>
            <option value="offline">Offline</option>
          </select>
        </div>

        {/* Device Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDevices.map(device => (
            <DeviceCard
              key={device._id}
              device={device}
              isField={activeTab === 'field'}
              onViewFootage={handleViewFootage}
              onSettings={handleOpenSettings} // ✅ Now properly sets correct device
              isSelected={device._id === selectedDeviceId}
            />
          ))}
        </div>

        {/* AI Workflow (Field Only) */}
        {activeTab === 'field' && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Workflow Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Upload className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">Upload</p>
                <p className="text-xs text-gray-500">3 Active</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">AI Processing</p>
                <p className="text-xs text-gray-500">12 Queued</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Eye className="w-6 h-6 text-orange-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">QC Review</p>
                <p className="text-xs text-gray-500">8 Pending</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">Complete</p>
                <p className="text-xs text-gray-500">156 Reports</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Devices