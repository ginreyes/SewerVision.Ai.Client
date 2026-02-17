'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
import { api, getCookie } from '@/lib/helper'
import { useUser } from '@/components/providers/UserContext'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { useAlert } from '@/components/providers/AlertProvider'
import { Wrench, AlertTriangle } from 'lucide-react'

const EquipmentPage = () => {
  const router = useRouter()
  const { showAlert } = useAlert()
  const { userId } = useUser() || {}
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [reportingId, setReportingId] = useState(null)
  const [powerModalOpen, setPowerModalOpen] = useState(false)
  const [powerModalDevice, setPowerModalDevice] = useState(null)
  const [sendingPower, setSendingPower] = useState(false)
  const [statistics, setStatistics] = useState({
    total: 0,
    online: 0,
    recording: 0,
    offline: 0
  })
  
  useEffect(() => {
    fetchDevices()
  }, [userId])

  const fetchDevices = async () => {
    try {
      setLoading(true)
      if (!userId) {
        setLoading(false)
        setRefreshing(false)
        return
      }

      // Fetch devices assigned to this operator (backend filters by operatorId)
      const devicesResponse = await api(`/api/devices/get-all-devices?operatorId=${userId}`, 'GET')
      const raw = devicesResponse.data
      const list = Array.isArray(raw) ? raw : raw?.data ?? []
      if (devicesResponse.ok && list.length >= 0) {
        const operatorDevices = list

        const formattedDevices = operatorDevices.map(device => ({
          id: device._id,
          name: device.name || 'Unknown Device',
          type: device.type?.toLowerCase() || 'camera',
          status: device.status || 'offline',
          reportedStatus: device.reportedStatus || null,
          battery: device.specifications?.battery ? (typeof device.specifications.battery === 'number' ? device.specifications.battery : parseInt(String(device.specifications.battery).replace('%', ''), 10) || 0) : 0,
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

  const handleReportStatus = async (deviceId, reportedStatus) => {
    if (!userId) return
    setReportingId(deviceId)
    try {
      const res = await api(`/api/devices/${deviceId}/report-status`, 'PUT', {
        reportedStatus,
        reportedBy: userId,
      })
      if (res.ok) {
        const updated = res.data?.data ?? res.data
        setDevices(prev =>
          prev.map(d => (d.id === deviceId ? { ...d, reportedStatus: updated?.reportedStatus ?? reportedStatus } : d))
        )
        showAlert('Device report updated', 'success')
      } else {
        showAlert(res.data?.message || 'Failed to report status', 'error')
      }
    } catch (e) {
      showAlert(e?.message || 'Failed to report status', 'error')
    } finally {
      setReportingId(null)
    }
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
                        <DropdownMenuItem onClick={() => router.push(`/operator/equipement/${device.id}`)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <SettingsIcon className="w-4 h-4 mr-2" />
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setPowerModalDevice(device)
                            setPowerModalOpen(true)
                          }}
                        >
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
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3 p-2 bg-gray-50 rounded-lg">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{device.location}</span>
                  </div>

                  {/* Report status: needs repair / needs maintenance */}
                  <div className="mb-4 p-3 border border-gray-100 rounded-lg bg-slate-50/50">
                    <p className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Report device
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      {device.reportedStatus && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                          device.reportedStatus === 'needs_repair' ? 'bg-red-100 text-red-700 border border-red-200' :
                          device.reportedStatus === 'needs_maintenance' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                          'bg-green-100 text-green-700 border border-green-200'
                        }`}>
                          {device.reportedStatus === 'needs_repair' && <Wrench className="w-3 h-3" />}
                          {device.reportedStatus === 'needs_maintenance' && <Wrench className="w-3 h-3" />}
                          {device.reportedStatus === 'ok' && <CheckCircle className="w-3 h-3" />}
                          {device.reportedStatus === 'needs_repair' ? 'Needs repair' : device.reportedStatus === 'needs_maintenance' ? 'Needs maintenance' : 'OK'}
                        </span>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline" className="h-7 text-xs" disabled={reportingId === device.id}>
                            {reportingId === device.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Report…'}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem onClick={() => handleReportStatus(device.id, 'ok')}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            OK
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleReportStatus(device.id, 'needs_maintenance')}>
                            <Wrench className="w-4 h-4 mr-2" />
                            Needs maintenance
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleReportStatus(device.id, 'needs_repair')}>
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Needs repair
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
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

      {/* Power Options modal */}
      <Dialog open={powerModalOpen} onOpenChange={setPowerModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Power options</DialogTitle>
            <DialogDescription>
              {powerModalDevice ? (
                <>Send a power command to <strong>{powerModalDevice.name}</strong>. The device must be online to receive it.</>
              ) : (
                'Select a device first.'
              )}
            </DialogDescription>
          </DialogHeader>
          {powerModalDevice && (
            <div className="grid gap-2 py-2">
              <Button
                variant="outline"
                className="justify-start gap-2"
                disabled={sendingPower}
                onClick={async () => {
                  setSendingPower(true)
                  await new Promise((r) => setTimeout(r, 600))
                  showAlert(
                    powerModalDevice.status === 'online' || powerModalDevice.status === 'ready'
                      ? 'Restart command sent to device.'
                      : 'Device must be online to receive the command.',
                    powerModalDevice.status === 'online' || powerModalDevice.status === 'ready' ? 'success' : 'warning'
                  )
                  setSendingPower(false)
                  setPowerModalOpen(false)
                }}
              >
                {sendingPower ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                Restart device
              </Button>
              <Button
                variant="outline"
                className="justify-start gap-2"
                disabled={sendingPower}
                onClick={async () => {
                  setSendingPower(true)
                  await new Promise((r) => setTimeout(r, 600))
                  showAlert(
                    powerModalDevice.status === 'online' || powerModalDevice.status === 'ready'
                      ? 'Standby command sent.'
                      : 'Device must be online.',
                    powerModalDevice.status === 'online' || powerModalDevice.status === 'ready' ? 'success' : 'warning'
                  )
                  setSendingPower(false)
                  setPowerModalOpen(false)
                }}
              >
                <Activity className="w-4 h-4" />
                Standby
              </Button>
              <Button
                variant="outline"
                className="justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled={sendingPower}
                onClick={async () => {
                  setSendingPower(true)
                  await new Promise((r) => setTimeout(r, 600))
                  showAlert(
                    powerModalDevice.status === 'online' || powerModalDevice.status === 'ready'
                      ? 'Shutdown command sent.'
                      : 'Device must be online.',
                    powerModalDevice.status === 'online' || powerModalDevice.status === 'ready' ? 'success' : 'warning'
                  )
                  setSendingPower(false)
                  setPowerModalOpen(false)
                }}
              >
                <Power className="w-4 h-4" />
                Shutdown
              </Button>
            </div>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setPowerModalOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default EquipmentPage
