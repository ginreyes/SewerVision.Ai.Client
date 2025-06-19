'use client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Calendar  as ShadcnCalendar } from '@/components/ui/calendar'
import React, { useState, useRef, useEffect } from 'react'
import EventFilters from './components/FilterComponent'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import EventModal from './components/AddEventModal'
import { useUser } from '@/components/providers/UserContext'
import { api } from '@/lib/helper'
import MonthViewCalendar from './components/MonthView'
import ListViewCalendar from './components/ListViewCalendar'
import { createPortal } from "react-dom";
import Calendar13 from '@/components/calendar-13'




const Calendar = () => {
  const [date, setDate] = useState(new Date())
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [viewMode, setViewMode] = useState('month');
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [event_list,setEventList] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const {userId} = useUser()


  const handleFetchListEvents = async () => {
    try {
      const result = await api('/api/calendar/get-event', 'GET');
      setEventList(result);
    } 
    catch (error) {
      console.error("Failed to fetch events:", error.message || error);
    }
  };

  


  const AddEvent = (date) => {
    setSelectedDate(date);
    setSelectedEvent(event_list); 
    setDrawerOpen(true);
  };
  
  const generateCalendarGrid = () => {
    const today = new Date();
  
    // Fallbacks in case state hasn't been initialized properly
    const month = typeof currentMonth === 'number' ? currentMonth : today.getMonth();
    const year = typeof currentYear === 'number' ? currentYear : today.getFullYear();
  
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
  
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
    const days = [];
  
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
  
    return { days, monthNames, daysOfWeek, currentMonth: month, currentYear: year, today };
  };
  

  const handlePrevious = () => {
    const newDate = new Date(date);
    if (viewMode === 'list' || viewMode === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } 
    else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } 
    else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    }
  
    setDate(newDate);
    setCurrentMonth(newDate.getMonth());
    setCurrentYear(newDate.getFullYear());
  };
  
  const handleNext = () => {
    const newDate = new Date(date);
    if (viewMode === 'list' || viewMode === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } 
    else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } 
    else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    }
  
    setDate(newDate);
    setCurrentMonth(newDate.getMonth());
    setCurrentYear(newDate.getFullYear());
  };
  

  const handleChangeHeader =()=>{
    if (viewMode === 'month') {
      return `${monthNames[currentMonth]} ${currentYear}`
    } 
    else if (viewMode === 'week') {
      const startOfWeek = new Date(date)
      startOfWeek.setDate(date.getDate() - date.getDay()) 

      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)

      const sameMonth = startOfWeek.getMonth() === endOfWeek.getMonth()
      const options = { month: 'short', day: 'numeric' }
      const startStr = startOfWeek.toLocaleDateString('en-US', options)
      const endStr = endOfWeek.toLocaleDateString('en-US', sameMonth ? { day: 'numeric' } : options)
      const yearStr = endOfWeek.getFullYear()

      return `${startStr} – ${endStr}, ${yearStr}`
    } 
    else if (viewMode === 'day') {
      const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }
      return date.toLocaleDateString('en-US', options)
    }
    else if (viewMode === 'list') {
      return `${monthNames[currentMonth]} ${currentYear}`
    }
  };

  useEffect(() => {
    handleFetchListEvents();
  }, [event_list])
  

  const handleAddOrEditEvent = (data) => {
    if (data instanceof Date) {
      setSelectedDate(data);
      setSelectedEvent(null); 
    } else {
      setSelectedEvent(data); 
      setSelectedDate(new Date(data.start_date));
    }
    setDrawerOpen(true);
  };

  
  const { days, monthNames, daysOfWeek,  today } = generateCalendarGrid()

  return (
    <>
     <Card className="flex auto w-full flex-row overflow-hidden">
      <div className="w-[309px] border-r flex flex-col p-4 bg-gray-50">
        {/* Add Event Button - Centered */}
        <div className="flex justify-center mb-6">
          <Button
            variant="rose"
            className="w-[200px] h-12 cursor-pointer "
            onClick={AddEvent}
          >
            + Add Event
          </Button>
        </div>

        <div
          className="flex justify-center flex-1 border-b border-gray-300 mb-4 relative z-50"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <ShadcnCalendar
            mode="single"
            selected={date}
            onSelect={setDate}
            captionLayout="dropdown"
          />
        </div>



        <div className="space-y-3">
          <EventFilters/>
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className='flex justify-between border-b pb-5'>
          <div className="flex space-x-4 justify-start "> 
              <Button onClick={handlePrevious} variant="outline" className='cursor-pointer'><ArrowLeft/></Button>
              <Button onClick={handleNext} variant="outline" className='cursor-pointer'><ArrowRight/></Button>
              <h1 className="text-3xl font-bold text-gray-800 select-none">
                {handleChangeHeader()}
              </h1>
            </div>
            
            <div className="flex justify-end space-x-4">
              {['month', 'week', 'day', 'list'].map((mode) => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? 'rose' : 'outline'}
                  onClick={() => setViewMode(mode)}
                  className="cursor-pointer w-24 text-center"
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Button>
              ))}
            </div>

        </div>
         {/* View Tabs Render */}
         <div className="w-full">

          {viewMode === 'month' && (
            <MonthViewCalendar
              currentYear={currentYear}
              currentMonth={currentMonth}
              today={new Date()}
              event_list={event_list}
              AddEvent={handleAddOrEditEvent}
            />
          )}


          {viewMode === 'week' && (
            <div className="w-full h-[600px] overflow-y-auto border rounded mt-4">
              {/* Top header row with days and dates */}
              <div className="grid grid-cols-[100px_repeat(7,minmax(0,1fr))] border-b bg-white sticky top-0 z-10">
                <div className="bg-gray-100 p-2 font-bold text-sm text-center border-r">Time</div>
                {Array.from({ length: 7 }).map((_, index) => {
                  const currentDate = new Date(date)
                  currentDate.setDate(date.getDate() - date.getDay() + index)
                  const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'short' })
                  const dayMonth = `${currentDate.getMonth() + 1}/${currentDate.getDate()}`
                  return (
                    <div key={index} className="p-2 text-center font-semibold border-r">
                      {dayName} {dayMonth}
                    </div>
                  )
                })}
              </div>
              {Array.from({ length: 24 }).map((_, hour) => (
                <div key={hour} className="grid grid-cols-[100px_repeat(7,minmax(0,1fr))] border-b h-16">
                  {/* Time Label */}
                  <div className="text-sm text-gray-600 border-r bg-gray-50 p-2 text-right pr-3">
                    {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                  </div>
                  {Array.from({ length: 7 }).map((_, idx) => (
                    <div key={idx} className="border-r hover:bg-gray-100 cursor-pointer" />
                  ))}
                </div>
              ))}
            </div>
          )}

          {viewMode === "day" && (
            <div className="w-full h-[600px] overflow-y-auto border rounded mt-4">
              <div className="grid grid-cols-[100px_minmax(0,1fr)] border-b bg-white sticky top-0 z-10">
                <div className="bg-gray-100 p-2 font-bold text-sm text-center border-r">Time</div>
                <div className="p-2 text-center font-semibold border-r">

                  {date.toLocaleDateString("en-US", { weekday: "long" })}
                </div>
              </div>
              {Array.from({ length: 24 }).map((_, hour) => (
                <div
                  key={hour}
                  className="grid grid-cols-[100px_minmax(0,1fr)] border-b h-16"
                >
                  {/* Time label */}
                  <div className="text-sm text-gray-600 border-r bg-gray-50 p-2 text-right pr-3">
                    {hour === 0
                      ? "12 AM"
                      : hour < 12
                      ? `${hour} AM`
                      : hour === 12
                      ? "12 PM"
                      : `${hour - 12} PM`}
                  </div>

                  {/* Empty hour slot */}
                  <div className="border-r border-l border-gray-300 hover:bg-gray-100 cursor-pointer" />
                </div>
              ))}
            </div>
          )}

          {viewMode === "list" && (
            <ListViewCalendar 
            event_list={event_list} 
            onEventClick={handleAddOrEditEvent} 
            />
          )}
        </div>

        <EventModal
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          date={selectedDate}
          selectedDate={selectedDate}
          userId={userId}
          onEventSaved={handleFetchListEvents}
          eventData={selectedEvent} 
        />
      </div>
    </Card>
    </>
   
  )
}

export default Calendar