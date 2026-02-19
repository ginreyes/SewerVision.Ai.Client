'use client'

import React, { useState } from 'react'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

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

  const categoryColorMap = {
    personal: 'bg-[#FF3D1C]/10 text-[#FF3D1C] border-[#FF3D1C]',
    business: 'bg-[#696CFF]/10 text-[#696CFF] border-[#696CFF]',
    family: 'bg-[#FFAB00]/10 text-[#FFAB00] border-[#FFAB00]',
    holiday: 'bg-[#71DD37]/10 text-[#71DD37] border-[#71DD37]',
    etc: 'bg-[#03C3EC]/10 text-[#03C3EC] border-[#03C3EC]',
  }

  return (
    <div className="w-full">
      <div className="h-[600px] w-full overflow-y-auto">
        {/* Header */}
        <div className="grid grid-cols-7 border-b border-gray-300 sticky top-0 bg-white z-10">
          {daysOfWeek.map((day) => (
            <div key={day} className="p-4 text-center font-semibold text-gray-600 border-r border-gray-300 last:border-r-0">
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
                className={`h-32 p-2 border-r border-b border-gray-300 last:border-r-0 
                  ${day ? 'hover:bg-gray-50 cursor-pointer' : 'bg-gray-50'} 
                  ${day && day === today.getDate() && currentMonth === today.getMonth() ? 'bg-blue-50 border-blue-200' : ''}`}
              >
                {day && (
                  <>
                    <div className={`text-lg font-medium ${day === today.getDate() && currentMonth === today.getMonth() ? 'text-blue-600' : 'text-gray-800'}`}>
                      {day}
                    </div>

                    {/* Show up to 3 events */}
                    {shownEvents.map((event, i) => (
                      <div
                        key={i}
                        title={event.title}
                        className={`mt-1 text-xs rounded px-1 py-0.5 truncate border cursor-pointer hover:opacity-90 ${categoryColorMap[event.category] || 'bg-gray-200 text-gray-800 border-gray-300'}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          AddEvent(event)
                        }}
                      >
                        {event.title}
                      </div>
                    ))}

                    {/* If more than 3, show "+N more" popover */}
                    {remainingCount > 0 && (
                      <Popover open={openPopoverIndex === index} onOpenChange={(open) => setOpenPopoverIndex(open ? index : null)}>
                      <PopoverTrigger asChild>
                        <div
                          onClick={(e) => {
                            e.stopPropagation()
                            setOpenPopoverIndex(index) // open the specific popover
                          }}
                          className="mt-1 text-xs text-blue-500 underline cursor-pointer"
                        >
                          +{remainingCount} more
                        </div>
                      </PopoverTrigger>
                    
                      <PopoverContent
                        side="bottom"
                        className="w-64 p-3 rounded-lg shadow-md border bg-white space-y-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-sm text-gray-700">
                            {clickedDate?.toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </div>
                          <button
                            className="text-gray-400 hover:text-gray-600 text-sm"
                            onClick={() => setOpenPopoverIndex(null)} // <-- Close popover here
                          >
                            ×
                          </button>
                        </div>
                    
                        {events.map((event, i) => (
                          <div
                            key={i}
                            className={cn(
                              'text-xs font-medium px-2 py-1 rounded cursor-pointer truncate',
                              categoryColorMap[event.category] || 'bg-gray-100 text-gray-800'
                            )}
                            title={event.title}
                            onClick={(e) => {
                              e.stopPropagation()
                              AddEvent(event)
                              setOpenPopoverIndex(null) // also close popover when selecting event
                            }}
                          >
                            {event.title}
                          </div>
                        ))}
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
