'use client'

import React, { useState } from 'react'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { getCalendarCategoryClass } from '@/lib/statusConfig'

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function MonthViewCalendar({ currentYear, currentMonth, today, event_list, AddEvent }) {
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7
  const [openPopoverIndex, setOpenPopoverIndex] = useState(null)

  const days = Array.from({ length: totalCells }, (_, i) => {
    const dayNumber = i - firstDayOfMonth + 1
    return dayNumber > 0 && dayNumber <= daysInMonth ? dayNumber : null
  })

  const isToday = (day) => day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()

  return (
    <div className="w-full">
      <div className="h-[600px] w-full overflow-y-auto">
        {/* Header */}
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-[#3f4856] sticky top-0 bg-gray-50 dark:bg-[#0f1623] z-10">
          {daysOfWeek.map((day) => (
            <div key={day} className="p-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-300 border-r border-gray-200 dark:border-[#3f4856] last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const clickedDate = day ? new Date(currentYear, currentMonth, day) : null
            const clickedDateString = clickedDate?.toDateString()

            const events = event_list?.filter(event => {
              const eventDate = new Date(event.start_date).toDateString()
              return eventDate === clickedDateString
            })

            const shownEvents = events.slice(0, 2)
            const remainingCount = events.length - 2

            return (
              <div
                key={index}
                onClick={day ? () => AddEvent(clickedDate) : undefined}
                className={cn(
                  'h-32 p-2 border-r border-b border-gray-100 dark:border-[#3f4856] last:border-r-0 transition-colors',
                  day
                    ? 'bg-white dark:bg-[#1a2332] hover:bg-gray-50 dark:hover:bg-[#243042] cursor-pointer'
                    : 'bg-gray-50/50 dark:bg-[#0f1623]',
                  isToday(day) && 'bg-blue-50/50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30'
                )}
              >
                {day && (
                  <>
                    <div className={cn(
                      'text-sm font-semibold mb-1',
                      isToday(day) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'
                    )}>
                      {isToday(day) ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold">
                          {day}
                        </span>
                      ) : day}
                    </div>

                    {/* Events */}
                    {shownEvents.map((event, i) => (
                      <div
                        key={i}
                        title={event.title}
                        className={cn(
                          'mt-0.5 text-[11px] rounded px-1.5 py-0.5 truncate border cursor-pointer hover:opacity-80 transition-opacity',
                          getCalendarCategoryClass(event.category) || 'bg-gray-100 dark:bg-[#374151] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-[#4b5563]'
                        )}
                        onClick={(e) => {
                          e.stopPropagation()
                          AddEvent(event)
                        }}
                      >
                        {event.title}
                      </div>
                    ))}

                    {/* More events popover */}
                    {remainingCount > 0 && (
                      <Popover open={openPopoverIndex === index} onOpenChange={(open) => setOpenPopoverIndex(open ? index : null)}>
                        <PopoverTrigger asChild>
                          <div
                            onClick={(e) => {
                              e.stopPropagation()
                              setOpenPopoverIndex(index)
                            }}
                            className="mt-0.5 text-[11px] text-blue-500 dark:text-blue-300 hover:underline cursor-pointer"
                          >
                            +{remainingCount} more
                          </div>
                        </PopoverTrigger>

                        <PopoverContent
                          side="bottom"
                          className="w-64 p-3 rounded-xl shadow-lg"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold text-sm">
                              {clickedDate?.toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </div>
                            <button
                              className="text-muted-foreground hover:text-foreground text-sm"
                              onClick={() => setOpenPopoverIndex(null)}
                            >
                              ×
                            </button>
                          </div>

                          <div className="space-y-1">
                            {events.map((event, i) => (
                              <div
                                key={i}
                                className={cn(
                                  'text-xs font-medium px-2 py-1.5 rounded-lg cursor-pointer truncate',
                                  getCalendarCategoryClass(event.category) || 'bg-muted text-muted-foreground'
                                )}
                                title={event.title}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  AddEvent(event)
                                  setOpenPopoverIndex(null)
                                }}
                              >
                                {event.title}
                              </div>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}

                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
