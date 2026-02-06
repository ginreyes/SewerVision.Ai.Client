'use client'

import React, { useState } from 'react'
import {
  Camera,
  Wrench,
  User,
  AlertCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Event type configuration matching operator design
const eventTypeConfig = {
  inspection: {
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-300',
    icon: Camera
  },
  maintenance: {
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-300',
    icon: Wrench
  },
  meeting: {
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-300',
    icon: User
  },
  deadline: {
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-300',
    icon: AlertCircle
  },
  other: {
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-300',
    icon: FileText
  }
}

export default function CalendarGrid({ events, onEventClick, onDateClick, onCreateEvent }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [openPopoverIndex, setOpenPopoverIndex] = useState(null)
  
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()
  const today = new Date()
  
  // Calculate calendar grid
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7
  
  const days = Array.from({ length: totalCells }, (_, i) => {
    const dayNumber = i - firstDayOfMonth + 1
    return dayNumber > 0 && dayNumber <= daysInMonth ? dayNumber : null
  })

  // Navigation handlers
  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  return (
    <div className="bg-white rounded-xl shadow-md border-0 overflow-hidden">
      {/* Calendar Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">
              {monthNames[currentMonth]} {currentYear}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleToday}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-8"
            >
              Today
            </Button>
            <div className="flex items-center gap-1">
              <Button
                onClick={handlePreviousMonth}
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleNextMonth}
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-auto max-h-[600px]">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="p-3 text-center text-sm font-semibold text-gray-600 border-r border-gray-200 last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Date Grid */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const clickedDate = day ? new Date(currentYear, currentMonth, day) : null
            const clickedDateString = clickedDate?.toDateString()
            const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()

            // Filter events for this day
            const dayEvents = day ? events.filter(event => {
              const eventDate = new Date(event.start_date)
              return eventDate.toDateString() === clickedDateString
            }) : []

            const shownEvents = dayEvents.slice(0, 2)
            const remainingCount = dayEvents.length - 2

            return (
              <div
                key={index}
                onClick={day ? () => onDateClick?.(clickedDate) : undefined}
                className={`min-h-[120px] p-2 border-r border-b border-gray-200 last:border-r-0 transition-all ${
                  day 
                    ? 'hover:bg-blue-50 cursor-pointer' 
                    : 'bg-gray-50/50'
                } ${
                  isToday 
                    ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200 ring-inset' 
                    : ''
                }`}
              >
                {day && (
                  <>
                    {/* Day Number */}
                    <div className="flex items-center justify-between mb-1">
                      <div
                        className={`text-sm font-semibold ${
                          isToday
                            ? 'bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center'
                            : 'text-gray-700'
                        }`}
                      >
                        {day}
                      </div>
                      {dayEvents.length > 0 && (
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      )}
                    </div>

                    {/* Event Pills */}
                    <div className="space-y-1">
                      {shownEvents.map((event, i) => {
                        const config = eventTypeConfig[event.type] || eventTypeConfig.other
                        const Icon = config.icon
                        const eventTime = new Date(event.start_date).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })

                        return (
                          <div
                            key={i}
                            onClick={(e) => {
                              e.stopPropagation()
                              onEventClick?.(event)
                            }}
                            className={`group text-xs rounded-md px-2 py-1 truncate border cursor-pointer hover:shadow-md transition-all ${config.bgColor} ${config.textColor} ${config.borderColor}`}
                            title={`${eventTime} - ${event.title}`}
                          >
                            <div className="flex items-center gap-1">
                              <Icon className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate font-medium">{event.title}</span>
                            </div>
                          </div>
                        )
                      })}

                      {/* Show "+N more" if there are more events */}
                      {remainingCount > 0 && (
                        <Popover 
                          open={openPopoverIndex === index} 
                          onOpenChange={(open) => setOpenPopoverIndex(open ? index : null)}
                        >
                          <PopoverTrigger asChild>
                            <div
                              onClick={(e) => {
                                e.stopPropagation()
                                setOpenPopoverIndex(index)
                              }}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer px-2 py-1 hover:bg-blue-50 rounded transition-colors"
                            >
                              +{remainingCount} more event{remainingCount > 1 ? 's' : ''}
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 p-3">
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              <p className="text-sm font-semibold text-gray-700 mb-2">
                                All Events for {monthNames[currentMonth]} {day}
                              </p>
                              {dayEvents.map((event, i) => {
                                const config = eventTypeConfig[event.type] || eventTypeConfig.other
                                const Icon = config.icon
                                const eventTime = new Date(event.start_date).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })

                                return (
                                  <div
                                    key={i}
                                    onClick={() => {
                                      setOpenPopoverIndex(null)
                                      onEventClick?.(event)
                                    }}
                                    className={`p-2 rounded-lg border cursor-pointer hover:shadow-md transition-all ${config.bgColor} ${config.borderColor}`}
                                  >
                                    <div className="flex items-start gap-2">
                                      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${config.textColor}`} />
                                      <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium ${config.textColor} truncate`}>
                                          {event.title}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-0.5">
                                          {eventTime}
                                        </p>
                                        {event.location && (
                                          <p className="text-xs text-gray-500 mt-0.5 truncate">
                                            📍 {event.location}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>

                    {/* Quick Add Button on Hover */}
                    {dayEvents.length === 0 && (
                      <div 
                        className="opacity-0 group-hover:opacity-100 transition-opacity mt-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          onCreateEvent?.(clickedDate)
                        }}
                      >
                        <div className="flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-blue-600 cursor-pointer">
                          <Plus className="w-3 h-3" />
                          <span>Add event</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Calendar Footer */}
      <div className="bg-gray-50 border-t border-gray-200 p-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            {Object.entries(eventTypeConfig).map(([key, config]) => {
              const Icon = config.icon
              return (
                <div key={key} className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded border ${config.bgColor} ${config.borderColor}`}>
                    <Icon className={`w-2 h-2 ${config.textColor} m-0.5`} />
                  </div>
                  <span className="text-gray-600 capitalize">{key}</span>
                </div>
              )
            })}
          </div>
          <div className="text-gray-500">
            Click a date to create event
          </div>
        </div>
      </div>
    </div>
  )
}
