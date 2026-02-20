'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Wifi,
  Monitor,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowRight,
  Link2,
  Smartphone,
  Settings,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Power,
} from 'lucide-react'
import { devicesApi } from '@/data/devicesApi'
import { useUser } from '@/components/providers/UserContext'
import { useAlert } from '@/components/providers/AlertProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const STEPS = [
  {
    title: 'Power on the device',
    description: 'Turn on your inspection camera or crawler and wait until it finishes booting.',
    icon: Power,
  },
  {
    title: 'Connect to the same network',
    description: 'Ensure the device and this computer (or tablet) are on the same Wi‑Fi or LAN so they can talk to each other.',
    icon: Wifi,
  },
  {
    title: 'Set the device IP address (Admin)',
    description: 'An admin must add or edit the device in Admin → Devices, and set the device’s IP address in the device settings (Network / General tab).',
    icon: Settings,
  },
  {
    title: 'Test the connection',
    description: 'Use "Test connection" below for your device. If it succeeds, the device is reachable and you can use Power Options from Equipment.',
    icon: Link2,
  },
  {
    title: 'Use Power Options',
    description: 'From My Equipment or the device detail page, use Power Options to send Restart, Standby, or Shutdown to the device.',
    icon: Monitor,
  },
]

export default function ConnectDevicePage() {
  const { userId } = useUser() || {}
  const { showAlert } = useAlert()
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [testingId, setTestingId] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState({})
  const [stepsExpanded, setStepsExpanded] = useState(true)

  const fetchDevices = useCallback(async () => {
    if (!userId) return
    try {
      setLoading(true)
      const list = await devicesApi.getDevices({ operatorId: userId })
      setDevices(Array.isArray(list) ? list : [])
    } catch (err) {
      console.error(err)
      showAlert(err?.message || 'Failed to load devices', 'error')
      setDevices([])
    } finally {
      setLoading(false)
    }
  }, [userId, showAlert])

  useEffect(() => {
    fetchDevices()
  }, [fetchDevices])

  const handleTestConnection = async (deviceId) => {
    setTestingId(deviceId)
    setConnectionStatus((prev) => ({ ...prev, [deviceId]: undefined }))
    try {
      const res = await devicesApi.testConnection(deviceId)
      setConnectionStatus((prev) => ({ ...prev, [deviceId]: res.reachable === true }))
      showAlert(res.reachable ? 'Device is reachable.' : 'Device did not respond.', res.reachable ? 'success' : 'warning')
    } catch (err) {
      setConnectionStatus((prev) => ({ ...prev, [deviceId]: false }))
      showAlert(err?.message || 'Connection test failed', 'error')
    } finally {
      setTestingId(null)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Link2 className="w-7 h-7 text-indigo-600" />
          Connect a device
        </h1>
        <p className="text-gray-600 mt-1">
          Set up and verify the connection between your inspection device and Concertina so you can send power commands and control the device from the app.
        </p>
      </div>

      {/* How to connect — steps */}
      <Card>
        <CardHeader
          className="cursor-pointer select-none"
          onClick={() => setStepsExpanded((e) => !e)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              How to connect a device
            </CardTitle>
            {stepsExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </CardHeader>
        {stepsExpanded && (
          <CardContent className="pt-0 space-y-6">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 flex items-center gap-2">
                      <Icon className="w-4 h-4 text-gray-500" />
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                  </div>
                </div>
              )
            })}
          </CardContent>
        )}
      </Card>

      {/* My devices — test connection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Monitor className="w-5 h-5 text-indigo-600" />
            My devices
          </CardTitle>
          <p className="text-sm text-gray-500 font-normal">
            Test whether each device is reachable. If the device has no IP set in Admin, the test will report not reachable.
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : devices.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Smartphone className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No devices assigned to you.</p>
              <p className="text-sm mt-1">Ask your team leader to assign you a device from Device Assignments.</p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/operator/equipement">View Equipment</Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-3">
              {devices.map((d) => {
                const id = d._id || d.id
                const testing = testingId === id
                const reachable = connectionStatus[id]
                const hasIp = !!d.ipAddress
                return (
                  <li
                    key={id}
                    className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border bg-gray-50/50 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-white border flex items-center justify-center">
                        <Monitor className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{d.name || 'Unnamed device'}</p>
                        <p className="text-sm text-gray-500">
                          {hasIp ? (
                            <span className="font-mono">{d.ipAddress}</span>
                          ) : (
                            <span className="text-amber-600">No IP configured — set in Admin</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {reachable === true && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Reachable
                        </Badge>
                      )}
                      {reachable === false && (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          <XCircle className="w-3 h-3 mr-1" />
                          Not reachable
                        </Badge>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestConnection(id)}
                        disabled={testing}
                      >
                        {testing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Wifi className="w-4 h-4 mr-1" />
                            Test connection
                          </>
                        )}
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/operator/equipement/${id}`} className="gap-1">
                          Details
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/operator/equipement">My Equipment</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/operator/operations">Operations Center</Link>
        </Button>
      </div>
    </div>
  )
}
