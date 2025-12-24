'use client'

import React, { useState, useEffect } from 'react'

import { 
  Video,           
  Tablet, 
  Smartphone, 
  Battery, 
  MapPin, 
  Search, 
  Signal,          
  CheckCircle,  
  AlertCircle      
} from 'lucide-react'
import { api } from '@/lib/helper'

const EquipmentPage = () => {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchDevices = async () => {
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
          
          const formattedDevices = operatorDevices.map(device => ({
            id: device._id,
            name: device.name || 'Unknown Device',
            type: device.type?.toLowerCase() || 'camera',
            status: device.status || 'offline',
            battery: device.specifications?.battery ? parseInt(device.specifications.battery.replace('%', '')) : 0,
            location: device.location || 'Unknown',
            signal: device.status === 'online' || device.status === 'recording' ? 'strong' : 
                   device.status === 'offline' ? 'none' : 'medium'
          }))
          
          setDevices(formattedDevices)
        }
      } catch (error) {
        console.error('Error fetching devices:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDevices()
  }, [])

  const mockDevices = [
    {
      id: 'dev-101',
      name: 'SewerCam Pro 3000',
      type: 'camera',
      status: 'recording',
      battery: 78,
      location: 'Manhole #5, 3rd Ave',
      signal: 'strong'
    },
    {
      id: 'dev-102',
      name: 'FieldPad X1',
      type: 'tablet',
      status: 'online',
      battery: 92,
      location: 'Vehicle Mount - Truck 7',
      signal: 'strong'
    },
    {
      id: 'dev-103',
      name: 'Inspector Phone',
      type: 'smartphone',
      status: 'online',
      battery: 45,
      location: 'Personal Carry',
      signal: 'medium'
    },
    {
      id: 'dev-104',
      name: 'Backup Camera Unit',
      type: 'camera',
      status: 'offline',
      battery: 12,
      location: 'Storage - Bay C',
      signal: 'none'
    }
  ]

  const [searchQuery, setSearchQuery] = useState('')

  // Filter devices
  const filteredDevices = devices.filter((device) =>
    device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get icon
  const getIcon = (type) => {
    switch (type) {
      case 'camera': return Video
      case 'tablet': return Tablet
      case 'smartphone': return Smartphone
      default: return Video
    }
  }

  // Status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'recording':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1 animate-pulse" />
            Recording
          </span>
        )
      case 'online':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Online
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            Offline
          </span>
        )
    }
  }

  // Signal icon
  const getSignalIcon = (signal) => {
    if (signal === 'strong') {
      return <Signal className="w-4 h-4 text-green-500" />
    }
    if (signal === 'medium') {
      return <Signal className="w-4 h-4 text-yellow-500" />
    }
    return <Signal className="w-4 h-4 text-gray-400" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading equipment data...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto bg-white">


      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
            My Equipment
          </h1>
          <p className="text-slate-600 mt-1">Your field devices at a glance</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="relative max-w-lg mx-auto mb-8">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search devices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-3 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent text-slate-700 placeholder-slate-400 transition-all duration-200"
          />
        </div>

        {/* Device Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDevices.length > 0 ? (
            filteredDevices.map((device) => {
              const Icon = getIcon(device.type)
              return (
                <div
                  key={device.id}
                  className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden group"
                >
                  {/* Gradient Top Bar */}
                  <div className={`h-1.5 ${
                    device.status === 'recording' ? 'bg-red-400' :
                    device.status === 'online' ? 'bg-green-400' : 'bg-gray-300'
                  }`}></div>

                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-xl ${
                          device.type === 'camera' ? 'bg-gradient-to-br from-blue-500 to-blue-700' :
                          device.type === 'tablet' ? 'bg-gradient-to-br from-violet-500 to-violet-700' :
                          'bg-gradient-to-br from-slate-500 to-slate-700'
                        }`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 group-hover:text-slate-700 transition-colors">
                            {device.name}
                          </h3>
                          <p className="text-sm text-slate-500 capitalize">{device.type}</p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex-shrink-0">
                        {getStatusBadge(device.status)}
                      </div>
                    </div>

                    {/* Info Rows */}
                    <div className="space-y-3">
                      {/* Battery */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 flex items-center">
                          <Battery className="w-4 h-4 mr-1.5 text-slate-500" />
                          Battery
                        </span>
                        <span className="font-medium text-slate-900">{device.battery}%</span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 flex items-center">
                          <MapPin className="w-4 h-4 mr-1.5 text-slate-500" />
                          Location
                        </span>
                        <span className="font-medium text-slate-900 truncate max-w-[180px] text-right">
                          {device.location}
                        </span>
                      </div>

                      {/* Signal */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Signal</span>
                        <span className="text-slate-500">{getSignalIcon(device.signal)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="col-span-1 md:col-span-2 text-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">No devices found</h3>
              <p className="text-slate-500 mt-1">Try adjusting your search.</p>
            </div>
          )}
        </div>

       
      </div>
    </div>
  )
}

export default EquipmentPage