'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
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
import { Label } from '@/components/ui/label'
import { X ,Trash2, Save, PencilLine, XCircle, Users } from 'lucide-react'

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
import { useDialog } from '@/components/providers/DialogProvider'
import { useUser } from '@/components/providers/UserContext'

export default function EventModal(props) {

  const { open, onOpenChange, date, userId, selectedDate, onEventSaved, eventData } = props;
  const { userData } = useUser() || {};
  const isTeamLead = userData?.role === 'user';
  
  // basic event state
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
  const {showDelete} = useDialog();

  // assignment state (team lead can assign schedule to operator and QC tech)
  const [operators, setOperators] = useState([]);
  const [qcTechnicians, setQcTechnicians] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [operatorUserId, setOperatorUserId] = useState('');
  const [operatorName, setOperatorName] = useState('');
  const [operatorEmail, setOperatorEmail] = useState('');

  const [qcUserId, setQcUserId] = useState('');
  const [qcName, setQcName] = useState('');
  const [qcEmail, setQcEmail] = useState('');

  const clearOperatorSelection = useCallback(() => {
    setOperatorUserId('');
    setOperatorName('');
    setOperatorEmail('');
  }, []);

  const clearQcSelection = useCallback(() => {
    setQcUserId('');
    setQcName('');
    setQcEmail('');
  }, []);

  const fetchUsers = useCallback(async () => {
    if (!isTeamLead) return;
    try {
      setLoadingUsers(true);
      const { ok, data } = await api("/api/users/get-all-user", "GET");

      if (ok && data?.users) {
        let operatorUsers = data.users.filter((u) => u.role === "operator");
        let qcUsers = data.users.filter((u) => u.role === "qc-technician");

        if (Array.isArray(userData?.managedMembers) && userData.managedMembers.length > 0) {
          const managedIds = new Set(userData.managedMembers.map((id) => String(id)));
          operatorUsers = operatorUsers.filter((u) => u._id && managedIds.has(String(u._id)));
          qcUsers = qcUsers.filter((u) => u._id && managedIds.has(String(u._id)));
        }

        setOperators(operatorUsers);
        setQcTechnicians(qcUsers);
      }
    } catch (error) {
      console.error("Error fetching users for schedule assignment:", error);
      showAlert("Failed to fetch team members for schedule assignment", "error");
    } finally {
      setLoadingUsers(false);
    }
  }, [isTeamLead, showAlert, userData?.managedMembers]);

  const handleOperatorSelect = useCallback((id) => {
    const selected = operators.find((op) => (op.user_id || op._id) === id);
    if (selected) {
      const fullName = [selected.first_name, selected.last_name].filter(Boolean).join(" ").trim() || selected.name || selected.email || "";
      setOperatorUserId(id);
      setOperatorName(fullName);
      setOperatorEmail(selected.email || "");
    }
  }, [operators]);

  const handleQcSelect = useCallback((id) => {
    const selected = qcTechnicians.find((qc) => (qc.user_id || qc._id) === id);
    if (selected) {
      const fullName = [selected.first_name, selected.last_name].filter(Boolean).join(" ").trim() || selected.name || selected.email || "";
      setQcUserId(id);
      setQcName(fullName);
      setQcEmail(selected.email || "");
    }
  }, [qcTechnicians]);


  useEffect(() => {
    if (open && drawerRef.current) {
      setDrawerContainer(drawerRef.current)
    }
  }, [open])
  
  

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

        // pre-fill assignments if event has assigned operator / QC
        const assigned = eventData.assignedTo;
        if (assigned && typeof assigned === 'object') {
          const op = assigned.operator || assigned.assignedOperator;
          const qc = assigned.qcTechnician || assigned.qc || assigned.qcTech;

          if (op) {
            const opId = op.userId || op.user_id || op._id || '';
            const opName = op.name || [op.first_name, op.last_name].filter(Boolean).join(' ').trim() || '';
            setOperatorUserId(opId);
            setOperatorName(opName);
            setOperatorEmail(op.email || '');
          } else {
            clearOperatorSelection();
          }

          if (qc) {
            const qcId = qc.userId || qc.user_id || qc._id || '';
            const qcNameFull = qc.name || [qc.first_name, qc.last_name].filter(Boolean).join(' ').trim() || '';
            setQcUserId(qcId);
            setQcName(qcNameFull);
            setQcEmail(qc.email || '');
          } else {
            clearQcSelection();
          }
        } else {
          clearOperatorSelection();
          clearQcSelection();
        }
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
        clearOperatorSelection();
        clearQcSelection();
      }
    }
  }, [open, eventData, selectedDate, clearOperatorSelection, clearQcSelection]);
  
  // load team members when the drawer opens (team lead only)
  useEffect(() => {
    if (open && isTeamLead) {
      fetchUsers();
    }
  }, [open, isTeamLead, fetchUsers]);
  
  
  

  const handleSave = async () => {
    try {
      let assignedTo;
      if (operatorUserId || qcUserId) {
        assignedTo = {
          operator: operatorUserId
            ? {
                userId: operatorUserId,
                name: operatorName,
                email: operatorEmail,
              }
            : undefined,
          qcTechnician: qcUserId
            ? {
                userId: qcUserId,
                name: qcName,
                email: qcEmail,
              }
            : undefined,
        };
      }

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
        ...(assignedTo ? { assignedTo } : {}),
      };
  
      const endpoint = eventData?._id
        ? `/api/calendar/update-event/${eventData._id}`
        : '/api/calendar/create-event';
  
      const method = eventData?._id ? 'PUT' : 'POST';
  
      const { ok, data } = await api(endpoint, method, payload);
  
      if (ok && data?._id) {
        showAlert(eventData ? "Event Updated Successfully!" : "Event Successfully Saved!", "success");
        if (onEventSaved) onEventSaved();
        onOpenChange(false);
      } else {
        showAlert(`Failed to save event: ${data?.message || 'Unknown error'}`, "error");
      }
    } catch (error) {
      console.error('Error saving event:', error.message);
      showAlert("An error occurred while saving the event", "error");
    }
  };
  
  
  const handleDeleteEvent = async () => {
    showDelete({
      title: "Delete Event",
      description: "Are you sure you want to delete this event from the calendar?",
      onConfirm: async () => {
        try {
          const { ok, data } = await api(`/api/calendar/delete-event/${eventData._id}`, "DELETE");
  
          if (ok) {
            showAlert("Event deleted successfully", "success");
            if (onEventSaved) onEventSaved();
            onOpenChange(false);
          } else {
            showAlert(`Failed to delete event: ${data.message}`, "error");
          }
        } catch (err) {
          console.error("Delete error:", err);
          showAlert("An error occurred while deleting", "error");
        }
      },
      onCancel: () => showAlert("Cancelled", "info"),
    });
  };
  

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

              {isTeamLead && (
                <div className="space-y-4 rounded-lg border bg-muted/40 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-800">
                        Assign schedule to team
                      </span>
                    </div>
                    {loadingUsers && (
                      <span className="text-xs text-gray-500">
                        Loading team members...
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-700">
                        Assigned Operator
                      </Label>
                      <Select
                        value={operatorUserId}
                        onValueChange={handleOperatorSelect}
                      >
                        <SelectTrigger className="h-9 w-full text-sm">
                          <SelectValue placeholder="Choose operator (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {operators.length === 0 ? (
                            <div className="px-3 py-4 text-center text-xs text-gray-500">
                              No operators available
                            </div>
                          ) : (
                            operators.map((op) => {
                              const id = op.user_id || op._id;
                              const name = [op.first_name, op.last_name].filter(Boolean).join(' ').trim() || op.name || op.email;
                              return (
                                <SelectItem key={id} value={id}>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium">{name}</span>
                                    {op.email && (
                                      <span className="text-xs text-gray-500">{op.email}</span>
                                    )}
                                  </div>
                                </SelectItem>
                              );
                            })
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-700">
                        QC Technician
                      </Label>
                      <Select
                        value={qcUserId}
                        onValueChange={handleQcSelect}
                      >
                        <SelectTrigger className="h-9 w-full text-sm">
                          <SelectValue placeholder="Choose QC tech (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {qcTechnicians.length === 0 ? (
                            <div className="px-3 py-4 text-center text-xs text-gray-500">
                              No QC technicians available
                            </div>
                          ) : (
                            qcTechnicians.map((qc) => {
                              const id = qc.user_id || qc._id;
                              const name = [qc.first_name, qc.last_name].filter(Boolean).join(' ').trim() || qc.name || qc.email;
                              return (
                                <SelectItem key={id} value={id}>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium">{name}</span>
                                    {qc.email && (
                                      <span className="text-xs text-gray-500">{qc.email}</span>
                                    )}
                                  </div>
                                </SelectItem>
                              );
                            })
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

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
            <div className={`flex ${eventData ? 'gap-2 justify-between' : 'gap-2'}`}>
              <DrawerClose asChild>
                <Button variant="outline" className="flex-1 flex items-center justify-center gap-1">
                  <XCircle className="w-4 h-4" />
                  Cancel
                </Button>
              </DrawerClose>

              {eventData && (
                <Button
                  variant="destructive"
                  onClick={handleDeleteEvent}
                  className="flex-1 flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              )}

              <Button
                variant="success"
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-1"
              >
                {eventData ? (
                  <>
                    <PencilLine className="w-4 h-4" />
                    Update
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>

        </div>
      </DrawerContent>
    </Drawer>
  )
}
