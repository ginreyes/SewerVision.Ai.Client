'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  User,
  Wrench,
  Camera,
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  Edit2,
  Trash2,
  Filter,
  RefreshCw,
  Loader2,
  FileText,
  AlertTriangle,
  Grid3x3,
  List
} from 'lucide-react'

import CalendarGrid from './components/CalendarGrid'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useAlert } from '@/components/providers/AlertProvider'
import { useUser } from '@/components/providers/UserContext'
import { api } from '@/lib/helper'

// Event type configuration matching operator design
const eventTypes = {
  inspection: {
    label: 'Inspection',
    color: 'bg-blue-500',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    icon: Camera
  },
  maintenance: {
    label: 'Maintenance',
    color: 'bg-orange-500',
    bgLight: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
    icon: Wrench
  },
  meeting: {
    label: 'Meeting',
    color: 'bg-purple-500',
    bgLight: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    icon: User
  },
  deadline: {
    label: 'Deadline',
    color: 'bg-red-500',
    bgLight: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    icon: AlertCircle
  },
  other: {
    label: 'Other',
    color: 'bg-gray-500',
    bgLight: 'bg-gray-50',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-200',
    icon: FileText
  }
}

// Status configuration
const statusConfig = {
  scheduled: { color: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  'in-progress': { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500 animate-pulse' },
  completed: { color: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' },
  cancelled: { color: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' }
}

const OperatorCalendarPage = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filterType, setFilterType] = useState('all')
  const [statistics, setStatistics] = useState({
    todayEvents: 0,
    upcomingEvents: 0,
    completedEvents: 0,
    totalEvents: 0
  })
  
  const { showAlert } = useAlert()
  const { userId } = useUser()

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: new Date().toISOString().slice(0, 16),
    end_date: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    type: 'inspection',
    location: '',
    assignedTo: '',
    status: 'scheduled',
    priority: 'medium',
    notes: ''
  })

  // Fetch events
  const fetchEvents = useCallback(async () => {
    try {
      const { data, ok } = await api(`/api/operator/calendar/events?userId=${userId}`, 'GET')
      if (ok) {
        setEvents(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      showAlert('Failed to load events', 'error')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [userId, showAlert])

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    try {
      const { data, ok } = await api(`/api/operator/calendar/statistics?userId=${userId}`, 'GET')
      if (ok) {
        setStatistics(data.data || statistics)
      }
    } catch (error) {
      console.error('Error fetching statistics:', error)
    }
  }, [userId])

  useEffect(() => {
    if (userId) {
      fetchEvents()
      fetchStatistics()
    }
  }, [userId, fetchEvents, fetchStatistics])

  // Create event
  const handleCreateEvent = async () => {
    if (!formData.title) {
      showAlert('Please enter an event title', 'warning')
      return
    }

    try {
      const payload = {
        ...formData,
        userId,
        start_date: new Date(formData.start_date),
        end_date: new Date(formData.end_date)
      }

      const { ok } = await api('/api/operator/calendar/events', 'POST', payload)
      
      if (ok) {
        showAlert('Event created successfully!', 'success')
        setShowCreateModal(false)
        fetchEvents()
        fetchStatistics()
        resetForm()
      }
    } catch (error) {
      showAlert('Failed to create event', 'error')
    }
  }

  // Update event status
  const handleUpdateStatus = async (eventId, newStatus) => {
    try {
      const { ok } = await api(`/api/operator/calendar/events/${eventId}/status`, 'PATCH', { status: newStatus })
      
      if (ok) {
        showAlert('Status updated successfully', 'success')
        fetchEvents()
        fetchStatistics()
        setSelectedEvent({ ...selectedEvent, status: newStatus })
      }
    } catch (error) {
      showAlert('Failed to update status', 'error')
    }
  }

  // Delete event
  const handleDeleteEvent = async (eventId) => {
    try {
      const { ok } = await api(`/api/operator/calendar/events/${eventId}`, 'DELETE')
      
      if (ok) {
        showAlert('Event deleted successfully', 'success')
        setShowEventModal(false)
        fetchEvents()
        fetchStatistics()
      }
    } catch (error) {
      showAlert('Failed to delete event', 'error')
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      start_date: new Date().toISOString().slice(0, 16),
      end_date: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
      type: 'inspection',
      location: '',
      assignedTo: '',
      status: 'scheduled',
      priority: 'medium',
      notes: ''
    })
  }

  // Filter events
  const filteredEvents = filterType === 'all' 
    ? events 
    : events.filter(e => e.type === filterType)

  // Group events by date
  const eventsByDate = filteredEvents.reduce((acc, event) => {
    const dateKey = new Date(event.start_date).toDateString()
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(event)
    return acc
  }, {})

  // Get today's events
  const todayEvents = events.filter(e => {
    const eventDate = new Date(e.start_date)
    const today = new Date()
    return eventDate.toDateString() === today.toDateString()
  })

  // Get upcoming events (next 7 days)
  const upcomingEvents = events.filter(e => {
    const eventDate = new Date(e.start_date)
    const today = new Date()
    const weekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    return eventDate > today && eventDate <= weekLater
  }).sort((a, b) => new Date(a.start_date) - new Date(b.start_date))

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchEvents()
    await fetchStatistics()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading calendar...</p>
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
            <CalendarIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Calendar & Schedule</h1>
            <p className="text-sm text-gray-600 mt-0.5">Manage your inspections, maintenance, and tasks</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 border border-gray-200">
            <Button
              onClick={() => setViewMode('grid')}
              variant="ghost"
              size="sm"
              className={`gap-1.5 transition-all ${
                viewMode === 'grid' 
                  ? 'bg-white shadow-sm text-blue-600 hover:text-blue-700 hover:bg-white' 
                  : 'hover:bg-gray-200'
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
              <span className="hidden sm:inline">Grid</span>
            </Button>
            <Button
              onClick={() => setViewMode('list')}
              variant="ghost"
              size="sm"
              className={`gap-1.5 transition-all ${
                viewMode === 'list' 
                  ? 'bg-white shadow-sm text-blue-600 hover:text-blue-700 hover:bg-white' 
                  : 'hover:bg-gray-200'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List</span>
            </Button>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="gap-2 border-gray-300"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Event</span>
          </Button>
        </div>
      </div>

      {/* Stats Grid - Matching operator design */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Today's Events</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.todayEvents}</p>
                <p className="text-xs text-gray-400 mt-1">Scheduled today</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <CalendarIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.upcomingEvents}</p>
                <p className="text-xs text-gray-400 mt-1">Next 7 days</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.completedEvents}</p>
                <p className="text-xs text-gray-400 mt-1">All time</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Total Events</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.totalEvents}</p>
                <p className="text-xs text-gray-400 mt-1">Overall</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg">
                <Info className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Filter Card */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-600" />
                Filter Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <button
                onClick={() => setFilterType('all')}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                  filterType === 'all' 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                All Events
              </button>
              {Object.entries(eventTypes).map(([key, config]) => {
                const Icon = config.icon
                return (
                  <button
                    key={key}
                    onClick={() => setFilterType(key)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center gap-2 text-sm font-medium ${
                      filterType === key 
                        ? `${config.bgLight} ${config.textColor} border ${config.borderColor}` 
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {config.label}
                  </button>
                )
              })}
            </CardContent>
          </Card>

          {/* Today's Events */}
          {todayEvents.length > 0 && (
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  Today's Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {todayEvents.map(event => {
                  const typeConfig = eventTypes[event.type] || eventTypes.other
                  const Icon = typeConfig.icon
                  return (
                    <div
                      key={event._id}
                      onClick={() => {
                        setSelectedEvent(event)
                        setShowEventModal(true)
                      }}
                      className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all ${typeConfig.borderColor} ${typeConfig.bgLight}`}
                    >
                      <div className="flex items-start gap-2">
                        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${typeConfig.textColor}`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">{event.title}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            {new Date(event.start_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {event.location && (
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}

          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-purple-600" />
                  Upcoming (7 days)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {upcomingEvents.slice(0, 5).map(event => {
                  const typeConfig = eventTypes[event.type] || eventTypes.other
                  return (
                    <div
                      key={event._id}
                      onClick={() => {
                        setSelectedEvent(event)
                        setShowEventModal(true)
                      }}
                      className="p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <div className={`w-2 h-2 rounded-full ${typeConfig.color} mt-2 flex-shrink-0`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">{event.title}</p>
                          <p className="text-xs text-gray-600">
                            {new Date(event.start_date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content - Grid or List View */}
        <div className="lg:col-span-3">
          {viewMode === 'grid' ? (
            <CalendarGrid
              events={filteredEvents}
              onEventClick={(event) => {
                setSelectedEvent(event)
                setShowEventModal(true)
              }}
              onDateClick={(date) => {
                setFormData({
                  ...formData,
                  start_date: date.toISOString().slice(0, 16),
                  end_date: new Date(date.getTime() + 3600000).toISOString().slice(0, 16)
                })
                setShowCreateModal(true)
              }}
              onCreateEvent={(date) => {
                setFormData({
                  ...formData,
                  start_date: date.toISOString().slice(0, 16),
                  end_date: new Date(date.getTime() + 3600000).toISOString().slice(0, 16)
                })
                setShowCreateModal(true)
              }}
            />
          ) : (
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>All Events</span>
                  <Badge variant="secondary">{filteredEvents.length} events</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
              {filteredEvents.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 mb-2">No events found</p>
                  <Button onClick={() => setShowCreateModal(true)} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Event
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(eventsByDate)
                    .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
                    .map(([date, dayEvents]) => (
                      <div key={date}>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          {new Date(date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </h3>
                        <div className="space-y-3">
                          {dayEvents.map(event => {
                            const typeConfig = eventTypes[event.type] || eventTypes.other
                            const statusCfg = statusConfig[event.status] || statusConfig.scheduled
                            const Icon = typeConfig.icon
                            
                            return (
                              <div
                                key={event._id}
                                onClick={() => {
                                  setSelectedEvent(event)
                                  setShowEventModal(true)
                                }}
                                className={`p-4 rounded-lg border hover:shadow-lg transition-all cursor-pointer ${typeConfig.borderColor} bg-white`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`p-2 rounded-lg ${typeConfig.bgLight} flex-shrink-0`}>
                                    <Icon className={`w-5 h-5 ${typeConfig.textColor}`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                      <h4 className="font-semibold text-gray-900">{event.title}</h4>
                                      <div className="flex items-center gap-2 flex-shrink-0">
                                        <Badge className={`text-xs px-2 py-0.5 ${typeConfig.bgLight} ${typeConfig.textColor} border-0`}>
                                          {typeConfig.label}
                                        </Badge>
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${statusCfg.color}`}>
                                          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                                          {event.status}
                                        </span>
                                      </div>
                                    </div>
                                    {event.description && (
                                      <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                                    )}
                                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        {new Date(event.start_date).toLocaleTimeString('en-US', { 
                                          hour: '2-digit', 
                                          minute: '2-digit' 
                                        })}
                                        {' - '}
                                        {new Date(event.end_date).toLocaleTimeString('en-US', { 
                                          hour: '2-digit', 
                                          minute: '2-digit' 
                                        })}
                                      </span>
                                      {event.location && (
                                        <span className="flex items-center gap-1">
                                          <MapPin className="w-3.5 h-3.5" />
                                          {event.location}
                                        </span>
                                      )}
                                      {event.assignedTo && (
                                        <span className="flex items-center gap-1">
                                          <User className="w-3.5 h-3.5" />
                                          {event.assignedTo}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
          )}
        </div>
      </div>

      {/* Event Detail Modal */}
      <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {React.createElement(eventTypes[selectedEvent.type]?.icon || FileText, {
                    className: `w-6 h-6 ${eventTypes[selectedEvent.type]?.textColor || 'text-gray-700'}`
                  })}
                  {selectedEvent.title}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-2">
                  <Badge className={`${eventTypes[selectedEvent.type]?.bgLight} ${eventTypes[selectedEvent.type]?.textColor} border-0`}>
                    {eventTypes[selectedEvent.type]?.label}
                  </Badge>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig[selectedEvent.status]?.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[selectedEvent.status]?.dot}`} />
                    {selectedEvent.status}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Time</p>
                      <p className="text-sm text-gray-600">
                        {new Date(selectedEvent.start_date).toLocaleString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                        <br />
                        to {new Date(selectedEvent.end_date).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  {selectedEvent.location && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Location</p>
                        <p className="text-sm text-gray-600">{selectedEvent.location}</p>
                      </div>
                    </div>
                  )}

                  {selectedEvent.assignedTo && (
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Assigned To</p>
                        <p className="text-sm text-gray-600">{selectedEvent.assignedTo}</p>
                      </div>
                    </div>
                  )}

                  {selectedEvent.description && (
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">Description</p>
                        <p className="text-sm text-gray-600">{selectedEvent.description}</p>
                      </div>
                    </div>
                  )}

                  {selectedEvent.notes && (
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">Notes</p>
                        <p className="text-sm text-gray-600">{selectedEvent.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="gap-2">
                {selectedEvent.status === 'scheduled' && (
                  <Button
                    onClick={() => handleUpdateStatus(selectedEvent._id, 'in-progress')}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    Start
                  </Button>
                )}
                {selectedEvent.status === 'in-progress' && (
                  <Button
                    onClick={() => handleUpdateStatus(selectedEvent._id, 'completed')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Complete
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteEvent(selectedEvent._id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                <Button variant="outline" onClick={() => setShowEventModal(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Event Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Plus className="w-6 h-6 text-blue-600" />
              Create New Event
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Downtown Sewer Inspection"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="type">Event Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(eventTypes).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        {React.createElement(config.icon, { className: 'w-4 h-4' })}
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start">Start Time *</Label>
                <Input
                  id="start"
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="end">End Time *</Label>
                <Input
                  id="end"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Main St & 5th Ave"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Input
                id="assignedTo"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                placeholder="e.g., John Operator"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add event details..."
                rows={3}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any additional notes..."
                rows={2}
                className="mt-1.5"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateModal(false)
              resetForm()
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreateEvent} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default OperatorCalendarPage
