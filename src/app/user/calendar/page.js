'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar as ShadcnCalendar } from '@/components/ui/calendar';
import React, { useState, useEffect } from 'react';
import EventFilters from '@/app/user/calendar/components/FilterComponent';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import EventModal from '@/app/user/calendar/components/AddEventModal';
import { useUser } from '@/components/providers/UserContext';
import { api } from '@/lib/helper';
import MonthViewCalendar from '@/app/user/calendar/components/MonthView';
import ListViewCalendar from '@/app/user/calendar/components/ListViewCalendar';
import WeekView from '@/app/user/calendar/components/WeekView';
import DayView from '@/app/user/calendar/components/DayView';

const generateCalendarGrid = (selectedMonth, selectedYear) => {
  const today = new Date();
  const month = typeof selectedMonth === 'number' ? selectedMonth : today.getMonth();
  const year = typeof selectedYear === 'number' ? selectedYear : today.getFullYear();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
  for (let day = 1; day <= daysInMonth; day++) days.push(day);
  return {
    days,
    monthNames,
    daysOfWeek,
    currentMonth: month,
    currentYear: year,
    today,
  };
};

export default function UserCalendarPage() {
  const [date, setDate] = useState(new Date());
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [viewMode, setViewMode] = useState('month');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [event_list, setEventList] = useState([]);
  const { monthNames } = generateCalendarGrid();
  const { userId } = useUser() || {};

  const [filters, setFilters] = useState({
    viewAll: true,
    personal: true,
    business: true,
    family: true,
    holiday: true,
    etc: true,
  });

  const handleFetchListEvents = async () => {
    try {
      const result = await api('/api/calendar/get-event', 'GET');
      const data = result?.data ?? result;
      setEventList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch events:', error?.message || error);
      setEventList([]);
    }
  };

  const AddEvent = (date) => {
    setSelectedDate(date);
    setSelectedEvent(event_list);
    setDrawerOpen(true);
  };

  const filteredEvents = filters.viewAll
    ? (Array.isArray(event_list) ? event_list : [])
    : (Array.isArray(event_list) ? event_list.filter((event) => filters[event.category]) : []);

  const handlePrevious = () => {
    const newDate = new Date(date);
    if (viewMode === 'day') newDate.setDate(newDate.getDate() - 1);
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() - 7);
    else if (viewMode === 'month' || viewMode === 'list') newDate.setMonth(newDate.getMonth() - 1);
    setDate(newDate);
    setCurrentMonth(newDate.getMonth());
    setCurrentYear(newDate.getFullYear());
  };

  const handleNext = () => {
    const newDate = new Date(date);
    if (viewMode === 'day') newDate.setDate(newDate.getDate() + 1);
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() + 7);
    else if (viewMode === 'month' || viewMode === 'list') newDate.setMonth(newDate.getMonth() + 1);
    setDate(newDate);
    setCurrentMonth(newDate.getMonth());
    setCurrentYear(newDate.getFullYear());
  };

  const handleChangeHeader = () => {
    if (viewMode === 'month') return `${monthNames[currentMonth]} ${currentYear}`;
    if (viewMode === 'week') {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      const sameMonth = startOfWeek.getMonth() === endOfWeek.getMonth();
      const options = { month: 'short', day: 'numeric' };
      const startStr = startOfWeek.toLocaleDateString('en-US', options);
      const endStr = endOfWeek.toLocaleDateString('en-US', sameMonth ? { day: 'numeric' } : options);
      return `${startStr} – ${endStr}, ${endOfWeek.getFullYear()}`;
    }
    if (viewMode === 'day') {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    if (viewMode === 'list') return `${monthNames[currentMonth]} ${currentYear}`;
    return '';
  };

  useEffect(() => {
    handleFetchListEvents();
  }, []);

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

  return (
    <div className="max-w-7xl mx-auto">
      <Card className="flex auto w-full flex-row overflow-hidden">
        <div className="w-[309px] border-r flex flex-col p-4 bg-gray-50">
          <div className="flex justify-center mb-6">
            <Button variant="rose" className="w-[200px] h-12 cursor-pointer" onClick={AddEvent}>
              + Add Event
            </Button>
          </div>
          <ShadcnCalendar mode="single" selected={date} onSelect={setDate} captionLayout="dropdown" />
          <div className="space-y-3">
            <EventFilters filters={filters} setFilters={setFilters} />
          </div>
        </div>

        <div className="flex-1 p-6">
          <div className="flex justify-between border-b pb-5">
            <div className="flex space-x-4 justify-start">
              <Button onClick={handlePrevious} variant="outline" className="cursor-pointer">
                <ArrowLeft />
              </Button>
              <Button onClick={handleNext} variant="outline" className="cursor-pointer">
                <ArrowRight />
              </Button>
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

          <div className="w-full">
            {viewMode === 'month' && (
              <MonthViewCalendar
                currentYear={currentYear}
                currentMonth={currentMonth}
                today={new Date()}
                event_list={filteredEvents}
                AddEvent={handleAddOrEditEvent}
              />
            )}
            {viewMode === 'week' && (
              <WeekView
                date={date}
                AddEvent={handleAddOrEditEvent}
                event_list={filteredEvents}
              />
            )}
            {viewMode === 'day' && (
              <DayView
                date={date}
                AddEvent={handleAddOrEditEvent}
                event_list={filteredEvents}
              />
            )}
            {viewMode === 'list' && (
              <ListViewCalendar
                date={date}
                event_list={filteredEvents}
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
    </div>
  );
}
