"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import React, { useState, useEffect } from "react";
import QCEventFilters from "./components/QCFilterComponent";
import { ArrowLeft, ArrowRight, CalendarCheck } from "lucide-react";
import EventModal from "@/app/admin/calendar/components/AddEventModal";
import { useUser } from "@/components/providers/UserContext";
import { api } from "@/lib/helper";
import QCMonthViewCalendar from "./components/QCMonthView";
import ListViewCalendar from "@/app/admin/calendar/components/ListViewCalendar";
import WeekView from "@/app/admin/calendar/components/WeekView";
import DayView from "@/app/admin/calendar/components/DayView";
import { useAlert } from "@/components/providers/AlertProvider";
import qcApi from "@/data/qcApi";

const QCCalendarPage = () => {
  const [date, setDate] = useState(new Date());
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [viewMode, setViewMode] = useState("month");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [event_list, setEventList] = useState([]);
  const [qcAssignments, setQcAssignments] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { userId } = useUser();
  const { showAlert } = useAlert();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const [filters, setFilters] = useState({
    viewAll: true,
    qcReviews: true,
    deadlines: true,
    meetings: true,
    personal: true,
    business: true,
    family: false,
    holiday: false,
    etc: false,
  });

  useEffect(() => {
    handleFetchListEvents();
    if (userId) {
      fetchQCAssignments();
    }
  }, [userId]);

  const fetchQCAssignments = async () => {
    try {
      if (!userId) return;
      const assignments = await qcApi.getAssignments(userId);
      setQcAssignments(assignments || []);
      
      // Convert assignments to calendar events
      const assignmentEvents = (assignments || []).map(assignment => {
        const project = assignment.projectId || assignment;
        const deadlineDate = assignment.deadline 
          ? new Date(assignment.deadline) 
          : (assignment.assignedAt ? new Date(assignment.assignedAt) : new Date());
        
        return {
          id: `qc-${assignment._id || assignment.projectId?._id || assignment.projectId}`,
          title: `QC Review: ${project?.name || 'Project'}`,
          description: `Review ${assignment.totalDetections || 0} detections`,
          start_date: deadlineDate.toISOString(),
          end_date: deadlineDate.toISOString(),
          category: 'qcReviews',
          location: project?.location || '',
          isAllDay: true,
          userId: userId,
        };
      }).filter(Boolean);

      // Merge with existing events, removing old QC events first
      setEventList(prev => {
        const nonQCEvents = prev.filter(e => !e.id?.startsWith('qc-'));
        return [...nonQCEvents, ...assignmentEvents];
      });
    } catch (error) {
      console.error("Error fetching QC assignments:", error);
      showAlert("Failed to load QC assignments", "error");
    }
  };

  const handleFetchListEvents = async () => {
    try {
      const result = await api("/api/calendar/get-event", "GET");
      if (result.ok && result.data?.data) {
        const events = Array.isArray(result.data.data) ? result.data.data : [];
        // Filter out QC events to avoid duplicates
        const existingQCIds = new Set();
        setEventList(prev => {
          prev.forEach(e => {
            if (e.id?.startsWith('qc-')) {
              existingQCIds.add(e.id);
            }
          });
          return prev.filter(e => !e.id?.startsWith('qc-')).concat(events);
        });
      }
    } catch (error) {
      console.error("Failed to fetch events:", error.message || error);
      showAlert("Failed to load calendar events", "error");
    }
  };

  const AddEvent = (date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setDrawerOpen(true);
  };

  const filteredEvents = filters.viewAll
    ? (Array.isArray(event_list) ? event_list : [])
    : (Array.isArray(event_list) ? event_list.filter(event => {
        // Handle QC-specific categories
        if (event.category === 'qcReviews') return filters.qcReviews;
        if (event.category === 'deadlines') return filters.deadlines;
        if (event.category === 'meetings') return filters.meetings;
        // Handle other categories
        return filters[event.category] || false;
      }) : []);

  const handlePrevious = () => {
    const newDate = new Date(date);
    if (viewMode === "day") {
      newDate.setDate(newDate.getDate() - 1);
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else if (viewMode === "month" || viewMode === "list") {
      newDate.setMonth(newDate.getMonth() - 1);
    }

    setDate(newDate);
    setCurrentMonth(newDate.getMonth());
    setCurrentYear(newDate.getFullYear());
  };

  const handleNext = () => {
    const newDate = new Date(date);
    if (viewMode === "day") {
      newDate.setDate(newDate.getDate() + 1);
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else if (viewMode === "month" || viewMode === "list") {
      newDate.setMonth(newDate.getMonth() + 1);
    }

    setDate(newDate);
    setCurrentMonth(newDate.getMonth());
    setCurrentYear(newDate.getFullYear());
  };

  const handleChangeHeader = () => {
    if (viewMode === "month") {
      return `${monthNames[currentMonth]} ${currentYear}`;
    } else if (viewMode === "week") {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const sameMonth = startOfWeek.getMonth() === endOfWeek.getMonth();
      const options = { month: "short", day: "numeric" };
      const startStr = startOfWeek.toLocaleDateString("en-US", options);
      const endStr = endOfWeek.toLocaleDateString(
        "en-US",
        sameMonth ? { day: "numeric" } : options
      );
      const yearStr = endOfWeek.getFullYear();

      return `${startStr} – ${endStr}, ${yearStr}`;
    } else if (viewMode === "day") {
      const options = {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
      };
      return date.toLocaleDateString("en-US", options);
    } else if (viewMode === "list") {
      return `${monthNames[currentMonth]} ${currentYear}`;
    }
  };

  const handleAddOrEditEvent = (data) => {
    if (data instanceof Date) {
      setSelectedDate(data);
      setSelectedEvent(null);
    } else {
      setSelectedEvent(data);
      setSelectedDate(new Date(data.start_date || data.startDate || data.date));
    }
    setDrawerOpen(true);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">QC Calendar</h1>
          <p className="text-gray-600">Manage your QC reviews, deadlines, and schedule</p>
        </div>

        <Card className="flex auto w-full flex-row overflow-hidden">
          <div className="w-[309px] border-r flex flex-col p-4 bg-gray-50">
            {/* Add Event Button - Centered */}
            <div className="flex justify-center mb-6">
              <Button
                variant="rose"
                className="w-[200px] h-12 cursor-pointer"
                onClick={AddEvent}
              >
                <CalendarCheck className="w-4 h-4 mr-2" />
                + Add Event
              </Button>
            </div>

            <ShadcnCalendar
              mode="single"
              selected={date}
              onSelect={(selectedDate) => {
                if (selectedDate) {
                  setDate(selectedDate);
                  setCurrentMonth(selectedDate.getMonth());
                  setCurrentYear(selectedDate.getFullYear());
                }
              }}
              captionLayout="dropdown"
            />

            <div className="space-y-3 mt-4">
              <QCEventFilters filters={filters} setFilters={setFilters} />
            </div>

            {/* QC Assignments Summary */}
            {qcAssignments.length > 0 && (
              <div className="mt-4 p-3 bg-rose-50 rounded-lg border border-rose-200">
                <div className="text-sm font-semibold text-rose-800 mb-2">
                  QC Assignments
                </div>
                <div className="text-xs text-rose-600">
                  {qcAssignments.filter(a => a.status === 'assigned' || a.status === 'in-progress').length} active
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {qcAssignments.length} total assigned
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 p-6">
            <div className="flex justify-between border-b pb-5">
              <div className="flex space-x-4 justify-start">
                <Button
                  onClick={handlePrevious}
                  variant="outline"
                  className="cursor-pointer"
                >
                  <ArrowLeft />
                </Button>
                <Button
                  onClick={handleNext}
                  variant="outline"
                  className="cursor-pointer"
                >
                  <ArrowRight />
                </Button>
                <h1 className="text-3xl font-bold text-gray-800 select-none">
                  {handleChangeHeader()}
                </h1>
              </div>

              <div className="flex justify-end space-x-4">
                {["month", "week", "day", "list"].map((mode) => (
                  <Button
                    key={mode}
                    variant={viewMode === mode ? "rose" : "outline"}
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
              {viewMode === "month" && (
                <QCMonthViewCalendar
                  currentYear={currentYear}
                  currentMonth={currentMonth}
                  today={new Date()}
                  event_list={filteredEvents}
                  AddEvent={handleAddOrEditEvent}
                />
              )}

              {viewMode === "week" && (
                <WeekView
                  date={date}
                  AddEvent={handleAddOrEditEvent}
                  event_list={filteredEvents}
                />
              )}

              {viewMode === "day" && (
                <DayView
                  date={date}
                  AddEvent={handleAddOrEditEvent}
                  event_list={filteredEvents}
                />
              )}

              {viewMode === "list" && (
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
    </>
  );
};

export default QCCalendarPage;
