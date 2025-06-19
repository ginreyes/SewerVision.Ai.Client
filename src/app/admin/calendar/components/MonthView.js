'use client'

import React from 'react'

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function MonthViewCalendar(props) {
  const {currentYear, currentMonth, today, event_list, AddEvent} = props
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7

  const days = Array.from({ length: totalCells }, (_, i) => {
    const dayNumber = i - firstDayOfMonth + 1
    return dayNumber > 0 && dayNumber <= daysInMonth ? dayNumber : null
  })

  // Color map based on your filter component
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
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-gray-300 sticky top-0 bg-white z-10">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="p-4 text-center font-semibold text-gray-600 border-r border-gray-300 last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const clickedDate = day ? new Date(currentYear, currentMonth, day) : null
            const clickedDateString = clickedDate?.toDateString()

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

                    {/* Events for the day */}
                    {event_list
                      .filter(event => {
                        const eventDate = new Date(event.start_date).toDateString()
                        return eventDate === clickedDateString
                      })
                      .map((event, i) => (
                        <div
                            key={i}
                            title={event.title}
                            className={`mt-1 text-xs rounded px-1 py-0.5 truncate border cursor-pointer hover:opacity-90 ${categoryColorMap[event.category] || 'bg-gray-200 text-gray-800 border-gray-300'}`}
                            onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering AddEvent for the day
                            AddEvent(event);     // Pass the full event object for editing
                            }}
                        >
                        {event.title}
                      </div>
                      ))}
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
