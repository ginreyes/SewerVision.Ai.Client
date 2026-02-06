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
  AlertCircle,
  Monitor,
  RefreshCw,
  Loader2,
  Wifi,
  WifiOff,
  Activity,
  Zap,
  Play,
  Pause,
  Power,
  MoreVertical,
  Eye,
  Settings as SettingsIcon
} from 'lucide-react'
import { api } from '@/lib/helper'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const EquipmentPage = () => {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statistics, setStatistics] = useState({
    total: 0,
    online: 0,
    recording: 0,
    offline: 0
  })
  
  useEffect(() => {
    fetchDevices()
  }, [])

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
                 device.status === 'offline' ? 'none' : 'medium',
          lastActive: device.updatedAt || device.createdAt
        }))
        
        setDevices(formattedDevices)
        
        // Calculate statistics
        setStatistics({
          total: formattedDevices.length,
          online: formattedDevices.filter(d => d.status === 'online').length,
          recording: formattedDevices.filter(d => d.status === 'recording').length,
          offline: formattedDevices.filter(d => d.status === 'offline').length
        })
      }
    } catch (error) {
      console.error('Error fetching devices:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchDevices()
  }

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
      default: return Monitor
    }
  }

  // Status configuration
  const statusConfig = {
    recording: { 
      color: 'bg-red-100 text-red-700 border-red-200', 
      dot: 'bg-red-500 animate-pulse',
      label: 'Recording'
    },
    online: { 
      color: 'bg-green-100 text-green-700 border-green-200', 
      dot: 'bg-green-500',
      label: 'Online'
    },
    ready: { 
      color: 'bg-blue-100 text-blue-700 border-blue-200', 
      dot: 'bg-blue-500',
      label: 'Ready'
    },
    offline: { 
      color: 'bg-gray-100 text-gray-600 border-gray-200', 
      dot: 'bg-gray-400',
      label: 'Offline'
    }
  }

  // Battery color
  const getBatteryColor = (level) => {
    if (level > 50) return 'text-green-500'
    if (level > 20) return 'text-yellow-500'
    return 'text-red-500'
  }

  // Signal color
  const getSignalColor = (signal) => {
    if (signal === 'strong') return 'text-green-500'
    if (signal === 'medium') return 'text-yellow-500'
    return 'text-gray-400'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading equipment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <Monitor className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Equipment</h1>
            <p className="text-sm text-gray-600 mt-0.5">Manage your field devices</p>
          </div>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          size="sm"
          className="gap-2 border-gray-300"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Stats Grid - Matching operator design */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Total Devices</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.total}</p>
                <p className="text-xs text-gray-400 mt-1">Assigned to you</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <Monitor className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Online</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.online}</p>
                <p className="text-xs text-gray-400 mt-1">Connected</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                <Wifi className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Recording</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.recording}</p>
                <p className="text-xs text-gray-400 mt-1">Active now</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg">
                <Video className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Offline</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.offline}</p>
                <p className="text-xs text-gray-400 mt-1">Not connected</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 shadow-lg">
                <WifiOff className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search devices by name, type, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gray-300 focus-visible:ring-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Device Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDevices.length > 0 ? (
          filteredDevices.map((device) => {
            const Icon = getIcon(device.type)
            const config = statusConfig[device.status] || statusConfig.offline

            return (
              <Card
                key={device.id}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md group cursor-pointer"
              >
                {/* Status Bar */}
                <div className={`h-1 ${
                  device.status === 'recording' ? 'bg-red-500' :
                  device.status === 'online' ? 'bg-green-500' :
                  device.status === 'ready' ? 'bg-blue-500' : 'bg-gray-300'
                }`}></div>

                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`p-3 rounded-xl flex-shrink-0 ${
                        device.type === 'camera' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                        device.type === 'tablet' ? 'bg-gradient-to-br from-violet-500 to-violet-600' :
                        device.type === 'smartphone' ? 'bg-gradient-to-br from-orange-500 to-orange-600' :
                        'bg-gradient-to-br from-gray-500 to-gray-600'
                      }`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                          {device.name}
                        </h3>
                        <p className="text-xs text-gray-500 capitalize">{device.type}</p>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <SettingsIcon className="w-4 h-4 mr-2" />
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Power className="w-4 h-4 mr-2" />
                          Power Options
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                      {config.label}
                    </span>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <Battery className={`w-5 h-5 mx-auto mb-1 ${getBatteryColor(device.battery)}`} />
                      <p className="text-xs font-medium text-gray-900">{device.battery}%</p>
                      <p className="text-xs text-gray-500">Battery</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <Signal className={`w-5 h-5 mx-auto mb-1 ${getSignalColor(device.signal)}`} />
                      <p className="text-xs font-medium text-gray-900 capitalize">{device.signal}</p>
                      <p className="text-xs text-gray-500">Signal</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <Activity className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                      <p className="text-xs font-medium text-gray-900">Active</p>
                      <p className="text-xs text-gray-500">Status</p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 p-2 bg-gray-50 rounded-lg">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{device.location}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {device.status === 'recording' ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1 gap-1.5"
                      >
                        <Pause className="w-4 h-4" />
                        Stop Recording
                      </Button>
                    ) : device.status === 'online' || device.status === 'ready' ? (
                      <Button
                        size="sm"
                        className="flex-1 gap-1.5 bg-green-600 hover:bg-green-700"
                      >
                        <Play className="w-4 h-4" />
                        Start Recording
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        disabled
                      >
                        <WifiOff className="w-4 h-4 mr-1.5" />
                        Offline
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <Card className="border-0 shadow-md">
              <CardContent className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No devices found</h3>
                <p className="text-gray-500">
                  {searchQuery 
                    ? 'Try adjusting your search terms.' 
                    : 'No equipment has been assigned to you yet.'}
                </p>
                {searchQuery && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                    className="mt-4"
                  >
                    Clear Search
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default EquipmentPage
