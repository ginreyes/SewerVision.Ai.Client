'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { X } from 'lucide-react'

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'
import { DatePicker } from '@/components/ui/datePicker'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/lib/helper'
import { useAlert } from '@/components/providers/AlertProvider'

export default function EventModal(props) {

  const { open, onOpenChange, date, userId, selectedDate, onEventSaved, eventData } = props;
  
  //states
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [eventUrl, setEventUrl] = useState('')
  const [category, setCategory] = useState('');
  const [isAllDay, setIsAllDay] = useState(true)
  const [start_date, setStartDate] = useState(date ?? new Date())
  const [end_date, setEndDate] = useState(date ?? new Date())
  const  drawerRef = useRef(null)
  const [drawerContainer, setDrawerContainer] = useState(null)
  const {showAlert} = useAlert();



  useEffect(() => {
    if (open && drawerRef.current) {
      setDrawerContainer(drawerRef.current)
    }
  }, [open])
  
  useEffect(() => {
    handleFetchCategories();
  }, [])

  useEffect(() => {
    if (open) {
      if (selectedDate && !isNaN(new Date(selectedDate).getTime())) {
        const date = new Date(selectedDate)
        setStartDate(date)
        setEndDate(date)
      } else {
        setStartDate(null)
        setEndDate(null)
      }
    }
  }, [open, selectedDate])


  useEffect(() => {
    if (open) {
      if (eventData) {
        setTitle(eventData.title || '');
        setDescription(eventData.description || '');
        setLocation(eventData.location || '');
        setEventUrl(eventData.eventUrl || '');
        setCategory(eventData.category || '');
        setIsAllDay(eventData.isAllDay || false);
        setStartDate(eventData.start_date ? new Date(eventData.start_date) : new Date());
        setEndDate(eventData.end_date ? new Date(eventData.end_date) : new Date());
      } 
      else if (selectedDate && !isNaN(new Date(selectedDate).getTime())) {
        const date = new Date(selectedDate);
        setStartDate(date);
        setEndDate(date);
        setTitle('');
        setDescription('');
        setLocation('');
        setEventUrl('');
        setCategory('');
        setIsAllDay(false);
      }
    }
  }, [open, eventData, selectedDate]);
  
  
  

  const handleSave = async () => {
    try {
      const payload = {
        userId,
        title,
        description,
        location,
        eventUrl,
        category,
        isAllDay,
        start_date,
        end_date,
      };
  
      const endpoint = eventData?._id 
        ? `/api/calendar/update-event/${eventData._id}` 
        : '/api/calendar/create-event';
      
      const method = eventData?._id ? 'PUT' : 'POST';
      
      const data = await api(endpoint, method, payload);
  
      if (data && data._id) {
        showAlert(eventData ? "Event Updated Successfully!" : "Event Successfully Saved!", "success");
      }
      
      if (onEventSaved) onEventSaved();
      onOpenChange(false); 
    } 
    catch (error) {
      console.error('Error saving event:', error.message);
    }
  };
  

  const handleFetchCategories =()=>{
    
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (drawerRef.current) {
        setDrawerContainer(drawerRef.current)
      } 
      else {
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [open])


  
  return (
    <Drawer 
      open={open} 
      onOpenChange={onOpenChange} 
      direction="right" 
    >
      <DrawerTrigger asChild>
        <Button className="hidden">Open</Button>
      </DrawerTrigger>
      <DrawerContent className="fixed inset-y-0 right-0 z-50 h-full w-96 border-l bg-background p-0 shadow-lg" >
        <div className="flex h-full flex-col " ref={drawerRef} >
          {/* Header */}
          <DrawerHeader className="flex flex-row items-center justify-between border-b p-4">

            <DrawerTitle className="text-lg font-semibold">
              {eventData ? 'Edit Event' : 'Add Event'}
            </DrawerTitle>

            <DrawerClose asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DrawerClose>

          </DrawerHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Event title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full h-10 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-ring">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="family">Family</SelectItem>
                    <SelectItem value="holiday">Holiday</SelectItem>
                    <SelectItem value="etc">Etc</SelectItem>
                  </SelectContent>
                </Select>
              </div>

                {selectedDate && (
                  <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <DatePicker 
                      date={start_date} 
                      onChange={setStartDate} 
                      container={drawerContainer}
                    
                    />  
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <DatePicker 
                      date={end_date} 
                      onChange={setEndDate}
                      container={drawerContainer}
                    />
                  </div>
                </div>
                )}

              <div className="flex items-center space-x-2">
              <Switch
                id="all-day"
                checked={isAllDay}
                onCheckedChange={(checked) => {
                  setIsAllDay(checked)
                  if (!checked && start_date && end_date) {
                    const start = new Date(start_date)
                    const end = new Date(end_date)
                    start.setHours(9, 0)
                    end.setHours(17, 0)
                    setStartDate(new Date(start))
                    setEndDate(new Date(end))
                  }
                }}
              />

                <Label htmlFor="all-day"> 
                  All Day
                </Label>
              </div>

              {!isAllDay && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={start_date ? new Date(start_date).toISOString().substring(11, 16) : ''}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(':');
                        const newDate = new Date(start_date);
                        newDate.setHours(hours, minutes);
                        setStartDate(newDate);
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={end_date ? new Date(end_date).toISOString().substring(11, 16) : ''}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(':');
                        const newDate = new Date(end_date);
                        newDate.setHours(hours, minutes);
                        setEndDate(newDate);
                      }}
                    />
                  </div>
                </div>
              )}


              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Enter location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventUrl">Event URL</Label>
                <Input
                  id="eventUrl"
                  placeholder="https://example.com"
                  value={eventUrl}
                  onChange={(e) => setEventUrl(e.target.value)}
                />
              </div>

             
    
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

                
            </div>
          </div>

          {/* Footer */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <DrawerClose asChild>
                <Button variant="outline" className="flex-1">
                  Cancel
                </Button>
              </DrawerClose>
              <Button variant="rose" onClick={handleSave} className="flex-1">
                Save Event
              </Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
