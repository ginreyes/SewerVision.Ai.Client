'use client'
import React, { useState } from 'react'
import { Settings, Server, Database, Cpu, HardDrive, Wifi, AlertTriangle, CheckCircle, Clock, Activity, BarChart3, RefreshCw, Shield, Zap, Monitor } from 'lucide-react'

const MaintenancePage = () => {
  const [selectedSystem, setSelectedSystem] = useState('all')
  const [refreshing, setRefreshing] = useState(false)

  const systemStatus = [
    {
      id: 'cloud-infrastructure',
      name: 'Cloud Infrastructure',
      status: 'healthy',
      uptime: '99.9%',
      lastCheck: '2 minutes ago',
      cpu: 23,
      memory: 67,
      storage: 45,
      icon: Server
    },
    {
      id: 'ai-processing',
      name: 'AI Processing Pipeline',
      status: 'healthy',
      uptime: '99.7%',
      lastCheck: '1 minute ago',
      cpu: 78,
      memory: 82,
      storage: 34,
      icon: Cpu
    },
    {
      id: 'database',
      name: 'Database Cluster',
      status: 'warning',
      uptime: '99.5%',
      lastCheck: '30 seconds ago',
      cpu: 45,
      memory: 89,
      storage: 71,
      icon: Database
    },
    {
      id: 'streaming-service',
      name: 'Video Streaming Service',
      status: 'healthy',
      uptime: '99.8%',
      lastCheck: '1 minute ago',
      cpu: 56,
      memory: 43,
      storage: 28,
      icon: Monitor
    }
  ]

  const maintenanceTasks = [
    {
      id: 'MT-001',
      task: 'AI Model Retraining - Crack Detection',
      priority: 'high',
      status: 'in-progress',
      assignedTo: 'AI Team',
      estimatedCompletion: '2024-09-02 14:00',
      progress: 75
    },
    {
      id: 'MT-002',
      task: 'Database Index Optimization',
      priority: 'medium',
      status: 'scheduled',
      assignedTo: 'DevOps Team',
      estimatedCompletion: '2024-09-03 02:00',
      progress: 0
    },
    {
      id: 'MT-003',
      task: 'Security Certificate Renewal',
      priority: 'high',
      status: 'pending',
      assignedTo: 'Security Team',
      estimatedCompletion: '2024-09-01 18:00',
      progress: 0
    },
    {
      id: 'MT-004',
      task: 'Cloud Storage Cleanup',
      priority: 'low',
      status: 'completed',
      assignedTo: 'DevOps Team',
      estimatedCompletion: '2024-08-31 16:00',
      progress: 100
    }
  ]

  const alerts = [
    {
      id: 'AL-001',
      type: 'warning',
      message: 'Database memory usage approaching 90%',
      timestamp: '2024-09-01 15:30',
      system: 'database'
    },
    {
      id: 'AL-002',
      type: 'info',
      message: 'Scheduled maintenance window starting in 2 hours',
      timestamp: '2024-09-01 15:15',
      system: 'cloud-infrastructure'
    },
    {
      id: 'AL-003',
      type: 'error',
      message: 'SSL certificate expires in 7 days',
      timestamp: '2024-09-01 14:45',
      system: 'security'
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100 border-green-200'
      case 'warning': return 'text-yellow-600 bg-yellow-100 border-yellow-200'
      case 'error': return 'text-red-600 bg-red-100 border-red-200'
      case 'completed': return 'text-green-600 bg-green-100 border-green-200'
      case 'in-progress': return 'text-blue-600 bg-blue-100 border-blue-200'
      case 'scheduled': return 'text-purple-600 bg-purple-100 border-purple-200'
      case 'pending': return 'text-orange-600 bg-orange-100 border-orange-200'
      default: return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-500" />
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 2000)
  }

  return (
    <div className="min-h-screen  p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">System Maintenance Dashboard</h1>
            <p className="text-gray-600">SewerVision.ai Infrastructure Monitoring & Maintenance</p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Status
          </button>
        </div>

        {/* System Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {systemStatus.map((system) => {
            const IconComponent = system.icon
            return (
              <div key={system.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <IconComponent className="h-8 w-8 text-blue-600" />
                  <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(system.status)}`}>
                    {system.status}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{system.name}</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Uptime:</span>
                    <span className="text-green-600">{system.uptime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Check:</span>
                    <span>{system.lastCheck}</span>
                  </div>
                </div>
                
                {/* Resource Usage */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">CPU</span>
                    <span className="text-gray-700">{system.cpu}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${system.cpu}%` }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Memory</span>
                    <span className="text-gray-700">{system.memory}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${system.memory > 80 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${system.memory}%` }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Storage</span>
                    <span className="text-gray-700">{system.storage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${system.storage}%` }}></div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Alerts Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">System Alerts</h2>
          </div>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="mr-3">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1">
                  <p className="text-gray-800">{alert.message}</p>
                  <div className="flex items-center mt-1 text-xs text-gray-500">
                    <span>{alert.timestamp}</span>
                    <span className="mx-2">•</span>
                    <span className="capitalize">{alert.system.replace('-', ' ')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance Tasks */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Maintenance Tasks</h2>
              <div className="flex gap-2">
                <select
                  value={selectedSystem}
                  onChange={(e) => setSelectedSystem(e.target.value)}
                  className="px-3 py-1 bg-gray-100 border border-gray-300 rounded text-gray-800 text-sm focus:ring-2 focus:ring-blue-200 focus:border-transparent"
                >
                  <option value="all">All Tasks</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    ETA
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {maintenanceTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{task.task}</div>
                        <div className="text-xs text-gray-500">{task.id}</div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {task.assignedTo}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${task.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-700">{task.progress}%</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(task.estimatedCompletion).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <Activity className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">AI Processing Speed:</span>
                <span className="text-green-600">+15% this week</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Error Rate:</span>
                <span className="text-green-600">0.02%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Response Time:</span>
                <span className="text-blue-600">285ms</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Security Status</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Last Security Scan:</span>
                <span className="text-green-600">2 hours ago</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vulnerabilities:</span>
                <span className="text-green-600">0 critical</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Firewall Status:</span>
                <span className="text-green-600">Active</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <BarChart3 className="h-6 w-6 text-purple-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Resource Usage</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Storage:</span>
                <span className="text-blue-600">2.4 TB / 5 TB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bandwidth Usage:</span>
                <span className="text-purple-600">1.8 GB/s peak</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Connections:</span>
                <span className="text-yellow-600">1,247</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MaintenancePage