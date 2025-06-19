'use client'

import React, { useState , useEffect} from 'react'

export default function ListViewCalendar(props) {

  const {event_list ,onEventClick} = props

  // Group events by date
  const groupedByDate = event_list.reduce((acc, event) => {
    const dateKey = new Date(event.start_date).toDateString()
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(event)
    return acc
  }, {})


  const categoryColors = {
    personal: "#FF3D1C",
    business: "#696CFF",
    family: "#FFAB00",
    holiday: "#71DD37",
    etc: "#03C3EC",
    viewAll: "#8491A2", 
  };
  

  return (
    <div className="w-full h-[600px] overflow-y-auto border rounded mt-4">
      <div className="divide-y">
        {event_list.length === 0 ? (
          <div className="p-4 text-center text-gray-500 italic">No events</div>
        ) : (
          Object.entries(groupedByDate).map(([dateStr, events]) => {
            const date = new Date(dateStr)
            return (
              <div key={dateStr} className="p-4 bg-gray-50">
                {/* Date header */}
                <div className="flex justify-between items-center pb-2 mb-2 border-b border-gray-200">
                  <span className="text-lg font-semibold">
                    {date.toLocaleDateString(undefined, {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="text-sm text-gray-600">
                    {date.toLocaleDateString(undefined, {
                      weekday: 'long',
                    })}
                  </span>
                </div>

                {/* Events for that date */}
                <div className="space-y-3">
                  {events.map((event) => (
                  <div
                    key={event._id}
                    onClick={() => onEventClick(event)}
                    className="p-3 bg-white shadow rounded hover:bg-gray-50 transition cursor-pointer"
                  >
                  <div className="grid grid-cols-12 items-center gap-2">
                    {/* Time or All-Day — Column 1 (span 3) */}
                    <div className="col-span-3 text-sm font-semibold text-blue-600">
                      {event.isAllDay
                        ? "all day"
                        : `${new Date(event.start_date).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          })} – ${new Date(event.end_date).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          })}`}
                    </div>
                
                    {/* Category — Column 2 (span 2) */}
                    <div className="col-span-2">
                      {event.category && (
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block w-3 h-3 rounded-full"
                            style={{ backgroundColor: categoryColors[event.category.toLowerCase()] || "#CBD5E0" }} 
                          ></span>
                          <span className="text-xs text-gray-600 capitalize">{event.category}</span>
                        </div>
                      )}
                    </div>

                
                    {/* Title — Column 3 (span 7) */}
                    <div className="col-span-7">
                      <span className="font-medium text-gray-800">{event.title}</span>
                    </div>
                  </div>
                  </div>
       
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
