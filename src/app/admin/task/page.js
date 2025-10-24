'use client'
import React, { useState } from 'react'
import { 
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  AlertCircle,
  Camera,
  FileText,
  Brain,
  Eye,
  Download,
  MoreHorizontal,
  Play,
  Search,
  Star,
  Flag
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import AddNewTaskModal from './components/AddNewTaskModal '

const Task = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [activeTab, setActiveTab] = useState('active')
  const [selectedTask, setSelectedTask] = useState(null)
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Main St Pipeline Inspection',
      description: 'CCTV inspection of 500ft main street sewer line',
      status: 'in-progress',
      priority: 'high',
      assignee: 'John Smith',
      location: 'Main St Pipeline',
      device: 'CCTV Inspection Camera Unit 1',
      startTime: '2024-08-12 09:00',
      estimatedDuration: '2 hours',
      progress: 65,
      type: 'inspection',
      aiProcessing: 'ready',
      footage: '2.3 GB',
      confidence: 94
    },
    {
      id: 2,
      title: 'Oak Ave Pipeline Assessment',
      description: 'Post-repair verification and documentation',
      status: 'pending',
      priority: 'medium',
      assignee: 'Sarah Johnson',
      location: 'Oak Ave',
      device: 'Mobile Inspection Tablet',
      startTime: '2024-08-12 14:00',
      estimatedDuration: '1.5 hours',
      progress: 0,
      type: 'assessment',
      aiProcessing: 'pending',
      footage: '0 GB'
    },
    {
      id: 3,
      title: 'QC Review - Pipeline 45A',
      description: 'Review AI-generated defect detection results',
      status: 'in-progress',
      priority: 'high',
      assignee: 'Mike Davis',
      location: 'QC Department',
      device: 'QC Review Station',
      startTime: '2024-08-12 10:30',
      estimatedDuration: '45 minutes',
      progress: 80,
      type: 'review',
      aiProcessing: 'completed',
      footage: '5.2 GB',
      confidence: 92
    },
    {
      id: 4,
      title: 'Industrial District Survey',
      description: 'Preliminary assessment of multiple manholes',
      status: 'scheduled',
      priority: 'low',
      assignee: 'Lisa Chen',
      location: 'Industrial District',
      device: 'Handheld Scanner',
      startTime: '2024-08-13 08:00',
      estimatedDuration: '3 hours',
      progress: 0,
      type: 'survey',
      aiProcessing: 'pending',
      footage: '0 GB'
    },
    {
      id: 5,
      title: 'Report Generation - Elm Street',
      description: 'Generate PACP compliant inspection report',
      status: 'completed',
      priority: 'medium',
      assignee: 'QC Technician',
      location: 'Cloud Processing',
      device: 'AI Processing Node 1',
      startTime: '2024-08-11 16:00',
      estimatedDuration: '30 minutes',
      progress: 100,
      type: 'report',
      aiProcessing: 'completed',
      footage: '1.8 GB',
      confidence: 96
    },
    {
      id: 6,
      title: 'Emergency Blockage Investigation',
      description: 'Urgent inspection due to reported backup',
      status: 'urgent',
      priority: 'critical',
      assignee: 'Emergency Team',
      location: 'Residential Block 5',
      device: 'Mobile Unit Alpha',
      startTime: '2024-08-12 11:45',
      estimatedDuration: '1 hour',
      progress: 25,
      type: 'emergency',
      aiProcessing: 'processing',
      footage: '0.8 GB'
    }
  ])

  const handleAddTask = (newTask) => {
    setTasks(prevTasks => [newTask, ...prevTasks])
  }

  const getFilteredTasks = () => {
    let filtered = tasks

    // Filter by tab (active/completed/all)
    if (activeTab === 'active') {
      filtered = filtered.filter(task => ['pending', 'in-progress', 'scheduled', 'urgent'].includes(task.status))
    } else if (activeTab === 'completed') {
      filtered = filtered.filter(task => task.status === 'completed')
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignee.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => task.status === filterStatus)
    }

    // Filter by priority
    if (filterPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === filterPriority)
    }

    return filtered
  }

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'text-yellow-600 bg-yellow-100',
      'in-progress': 'text-blue-600 bg-blue-100',
      'completed': 'text-green-600 bg-green-100',
      'scheduled': 'text-purple-600 bg-purple-100',
      'urgent': 'text-red-600 bg-red-100'
    }
    return colors[status] || 'text-gray-600 bg-gray-100'
  }

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'text-gray-600',
      'medium': 'text-yellow-600',
      'high': 'text-orange-600',
      'critical': 'text-red-600'
    }
    return colors[priority] || 'text-gray-600'
  }

  const getTaskIcon = (type) => {
    const icons = {
      'inspection': Camera,
      'assessment': FileText,
      'review': Eye,
      'survey': MapPin,
      'report': FileText,
      'emergency': AlertCircle
    }
    const Icon = icons[type] || FileText
    return <Icon className="w-5 h-5" />
  }

  const getTaskTypeColor = (type) => {
    const colors = {
      'inspection': 'bg-gradient-to-br from-blue-500 to-purple-600',
      'assessment': 'bg-gradient-to-br from-green-500 to-emerald-600',
      'review': 'bg-gradient-to-br from-orange-500 to-red-600',
      'survey': 'bg-gradient-to-br from-indigo-500 to-blue-600',
      'report': 'bg-gradient-to-br from-purple-500 to-pink-600',
      'emergency': 'bg-gradient-to-br from-red-500 to-red-700'
    }
    return colors[type] || 'bg-gradient-to-br from-gray-500 to-gray-700'
  }

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

  const TaskCard = ({ task }) => {
    const statusClasses = getStatusColor(task.status)
    const typeColor = getTaskTypeColor(task.type)
    
    return (
      <div 
        className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${
          selectedTask?.id === task.id ? 'ring-2 ring-blue-500' : ''
        }`}
        onClick={() => setSelectedTask(task)}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl ${typeColor} text-white`}>
              {getTaskIcon(task.type)}
            </div>
            <div className="flex items-center space-x-2">
              <Flag className={`w-4 h-4 ${getPriorityColor(task.priority)}`} />
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses}`}>
                {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' ')}
              </span>
            </div>
          </div>

          {/* Title and Description */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{task.title}</h3>
          <p className="text-sm text-gray-600 mb-4">{task.description}</p>

          {/* Task Details */}
          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                {task.assignee}
              </span>
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {task.location}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(task.startTime).toLocaleDateString()}
              </span>
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {task.estimatedDuration}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <Camera className="w-4 h-4 mr-2" />
                {task.device}
              </span>
              {task.footage && (
                <span className="text-xs text-gray-500">
                  {task.footage}
                </span>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {task.progress > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Progress</span>
                <span>{task.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${task.progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* AI Processing Status */}
          {task.aiProcessing && (
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  task.aiProcessing === 'completed' ? 'bg-green-100 text-green-800' :
                  task.aiProcessing === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                  task.aiProcessing === 'ready' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  <Brain className="w-3 h-3 mr-1 inline" />
                  AI {task.aiProcessing.charAt(0).toUpperCase() + task.aiProcessing.slice(1)}
                </span>
                {task.confidence && (
                  <span className="text-xs text-gray-500">
                    Confidence: {task.confidence}%
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button className="flex-1 bg-blue-500">
              {task.status === 'completed' ? (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </>
              ) : task.status === 'in-progress' ? (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Monitor
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Task
                </>
              )}
            </Button>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const filteredTasks = getFilteredTasks()

  return (
    <div className="max-w-7xl mx-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">SewerVision.ai Tasks</h1>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Live System
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <AddNewTaskModal onAddTask={handleAddTask} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Active Tasks" 
            value="5" 
            subtitle="Currently in progress"
            icon={Clock}
            color="bg-gradient-to-br from-blue-500 to-purple-600"
          />
          <StatCard 
            title="Urgent Tasks" 
            value="1" 
            subtitle="Requires immediate attention"
            icon={AlertCircle}
            color="bg-gradient-to-br from-red-500 to-red-700"
          />
          <StatCard 
            title="Completed Today" 
            value="3" 
            subtitle="Tasks finished today"
            icon={CheckCircle2}
            color="bg-gradient-to-br from-green-500 to-emerald-600"
          />
          <StatCard 
            title="Team Efficiency" 
            value="94%" 
            subtitle="On-time completion rate"
            icon={Star}
            color="bg-gradient-to-br from-purple-500 to-pink-600"
          />
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'active' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Clock className="w-4 h-4 mr-2 inline" />
              Active Tasks
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'completed' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 mr-2 inline" />
              Completed
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'all' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Tasks
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="scheduled">Scheduled</option>
            <option value="urgent">Urgent</option>
          </select>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>

        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Task