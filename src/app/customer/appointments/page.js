"use client";

import React, { useState } from "react";
import {
  CalendarDays, Plus, Clock, CheckCircle2, AlertCircle,
  ChevronLeft, ChevronRight, Bell, MapPin, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useAlert } from "@/components/providers/AlertProvider";
import { useUser } from "@/components/providers/UserContext";
import {
  useCustomerAppointments,
  useAvailableSlots,
  useCreateAppointment,
  useDeleteAppointment,
} from "@/hooks/useQueryHooks";

const STATUS_COLORS = {
  confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  completed: "bg-blue-100 text-blue-700 border-blue-200",
};

export default function AppointmentScheduler() {
  const { showAlert } = useAlert();
  const { userId } = useUser();

  const { data: appointmentsData, isLoading } = useCustomerAppointments(userId);
  const appointments = appointmentsData?.data || [];

  const [showForm, setShowForm] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [form, setForm] = useState({ title: "", date: "", location: "" });

  // Slots for the selected date in the form
  const { data: slots = [] } = useAvailableSlots(form.date);

  const createMutation = useCreateAppointment();
  const deleteMutation = useDeleteAppointment();

  function handleBook() {
    if (!form.title || !form.date || !selectedSlot) {
      showAlert("Please fill all fields and select a time slot", "error");
      return;
    }
    createMutation.mutate(
      { title: form.title, date: form.date, time: selectedSlot, location: form.location || "TBD", customerId: userId },
      {
        onSuccess: () => {
          showAlert("Appointment request submitted — you'll receive a confirmation", "success");
          setShowForm(false);
          setForm({ title: "", date: "", location: "" });
          setSelectedSlot(null);
        },
        onError: (err) => {
          showAlert(err.message || "Failed to book appointment", "error");
        },
      }
    );
  }

  function handleCancel(id) {
    deleteMutation.mutate(id, {
      onSuccess: () => showAlert("Appointment cancelled", "success"),
      onError: (err) => showAlert(err.message || "Failed to cancel", "error"),
    });
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-6 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
        <p className="text-sm text-gray-500">Loading appointments…</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Appointment Scheduler</h1>
            <p className="text-sm text-gray-500">Request and schedule inspection dates and consultations</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
          <Plus className="w-4 h-4" /> Book Appointment
        </Button>
      </div>

      {/* Upcoming appointments */}
      <div className="space-y-3 mb-6">
        <h2 className="text-sm font-semibold text-gray-700">
          {appointments.length > 0 ? "Upcoming Appointments" : "No appointments yet"}
        </h2>
        {appointments.map(apt => (
          <Card key={apt._id} className="border-gray-200 hover:border-emerald-200 transition-all">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex flex-col items-center justify-center shrink-0">
                <span className="text-xs font-bold text-emerald-700">{new Date(apt.date).toLocaleDateString("en-US", { month: "short" })}</span>
                <span className="text-lg font-bold text-emerald-900 leading-none">{new Date(apt.date).getDate()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{apt.title}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                  <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{apt.time}</span>
                  <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{apt.location}</span>
                </div>
              </div>
              <Badge variant="outline" className={`capitalize ${STATUS_COLORS[apt.status] || ""}`}>{apt.status}</Badge>
              {apt.status === "pending" && (
                <button onClick={() => handleCancel(apt._id)}
                  disabled={deleteMutation.isPending}
                  className="text-xs text-red-500 hover:text-red-700 transition-colors shrink-0">
                  Cancel
                </button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Book Appointment</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Purpose</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. CCTV Inspection, Site Assessment…" className="mt-1" />
            </div>
            <div>
              <Label>Preferred Date</Label>
              <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="mt-1" />
            </div>
            {form.date && (
              <div>
                <Label>Time Slot</Label>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {slots.length > 0 ? slots.map(slot => (
                    <button key={slot.time} disabled={!slot.available} onClick={() => setSelectedSlot(slot.time)}
                      className={`p-2 rounded-lg border text-xs font-medium transition-colors ${!slot.available ? "bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed" : selectedSlot === slot.time ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300"}`}>
                      {slot.time}
                      {!slot.available && <span className="block text-[10px] font-normal text-gray-400">Booked</span>}
                    </button>
                  )) : (
                    <p className="col-span-4 text-xs text-gray-400 py-2">Select a date to see available slots</p>
                  )}
                </div>
              </div>
            )}
            <div>
              <Label>Location (optional)</Label>
              <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Site address or 'Remote'" className="mt-1" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleBook} disabled={createMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {createMutation.isPending ? "Submitting…" : "Request Appointment"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
