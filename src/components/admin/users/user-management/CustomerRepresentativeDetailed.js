"use client";

import React from "react";
import {
  Phone,
  Globe,
  MessageSquare,
  Clock,
  Ticket,
  Users,
  Shield,
  UserPlus,
  UserMinus,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ROLE_BADGE_CLASSES } from "@/lib/roleThemes";

const AVAILABILITY_OPTIONS = [
  { value: "available", label: "Available", color: "bg-emerald-500" },
  { value: "busy", label: "Busy", color: "bg-amber-500" },
  { value: "away", label: "Away", color: "bg-gray-400" },
  { value: "offline", label: "Offline", color: "bg-red-500" },
];

const SPECIALTY_OPTIONS = [
  "General Support",
  "Billing & Accounts",
  "Technical Issues",
  "Project Inquiries",
  "Onboarding",
  "Escalation Handling",
];

const CustomerRepresentativeDetailed = ({
  user,
  form,
  isEdit,
  setForm,
  managedMembers = [],
  setManagedMembers,
  availableMembers = [],
  selectedMemberId = "",
  setSelectedMemberId,
}) => {
  return (
    <div className="space-y-6">
      {/* Support Profile */}
      <Card className="border-teal-100 shadow-sm">
        <CardHeader className="border-b border-teal-50 bg-teal-50/30">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-100 rounded-lg text-teal-600">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-lg">Support Profile</CardTitle>
              <CardDescription>Role-specific details and availability</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Status & Department */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-gray-700 flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-gray-400" /> Availability
              </Label>
              <Select
                disabled={!isEdit}
                value={form.availability_status || "available"}
                onValueChange={(v) => setForm({ ...form, availability_status: v })}
              >
                <SelectTrigger className={!isEdit ? "bg-gray-50" : "bg-white"}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABILITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${opt.color}`} />
                        {opt.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-700 flex items-center gap-1.5">
                <Users className="w-3 h-3 text-gray-400" /> Department
              </Label>
              <Input
                disabled={!isEdit}
                value={form.department || ""}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                placeholder="e.g., Customer Success"
                className={!isEdit ? "bg-gray-50" : "bg-white"}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-700 flex items-center gap-1.5">
                <Ticket className="w-3 h-3 text-gray-400" /> Max Concurrent Tickets
              </Label>
              <Input
                disabled={!isEdit}
                type="number"
                min={1}
                max={50}
                value={form.max_concurrent_tickets || 10}
                onChange={(e) => setForm({ ...form, max_concurrent_tickets: parseInt(e.target.value) || 10 })}
                className={!isEdit ? "bg-gray-50" : "bg-white"}
              />
            </div>
          </div>

          {/* Specialty & Contact */}
          <div className="pt-4 border-t border-gray-100">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-sm">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-medium">
                Expertise & Contact
              </Badge>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-gray-700 flex items-center gap-1.5">
                  <MessageSquare className="w-3 h-3 text-gray-400" /> Support Specialty
                </Label>
                <Select
                  disabled={!isEdit}
                  value={form.support_specialty || ""}
                  onValueChange={(v) => setForm({ ...form, support_specialty: v })}
                >
                  <SelectTrigger className={!isEdit ? "bg-gray-50" : "bg-white"}>
                    <SelectValue placeholder="Select specialty..." />
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIALTY_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-700 flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-gray-400" /> Phone Number
                </Label>
                <Input
                  disabled={!isEdit}
                  value={form.phone_number || ""}
                  onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                  placeholder="+63..."
                  className={!isEdit ? "bg-gray-50" : "bg-white"}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-700 flex items-center gap-1.5">
                  <Globe className="w-3 h-3 text-gray-400" /> Languages Spoken
                </Label>
                <Input
                  disabled={!isEdit}
                  value={form.languages_spoken || ""}
                  onChange={(e) => setForm({ ...form, languages_spoken: e.target.value })}
                  placeholder="e.g., English, Filipino, Spanish"
                  className={!isEdit ? "bg-gray-50" : "bg-white"}
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="pt-4 border-t border-gray-100">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-sm">
              <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200 font-medium">
                About
              </Badge>
            </h4>
            <div className="space-y-1.5">
              <Label className="text-gray-700">Bio / Notes</Label>
              <Textarea
                disabled={!isEdit}
                value={form.bio || ""}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={3}
                placeholder="Brief description of this representative's background and experience..."
                className={!isEdit ? "bg-gray-50 resize-none" : "bg-white resize-none"}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assigned Team Members */}
      <Card className="border-teal-100 shadow-sm">
        <CardHeader className="border-b border-teal-50 bg-teal-50/30">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-100 rounded-lg text-teal-600">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-lg">Assigned Team Members</CardTitle>
              <CardDescription>Customer-rep users managed by this representative</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Team Overview */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Team Size</p>
              <p className="text-xl font-semibold text-gray-900">{managedMembers.length}</p>
            </div>
            {!isEdit && (
              <span className="text-xs text-gray-500">Switch to edit mode to modify members.</span>
            )}
          </div>

          {/* Current Members List */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 text-sm">
              Current Members ({managedMembers.length})
            </h4>
            {managedMembers.length === 0 ? (
              <p className="text-sm text-gray-500">No team members assigned yet.</p>
            ) : (
              <div className="space-y-2">
                {managedMembers.map((m) => (
                  <div
                    key={m._id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg border border-gray-100 bg-white"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <UserAvatar
                        src={m.avatar}
                        fallback={((m.first_name || m.username || "?").charAt(0) || "").toUpperCase()}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {(m.first_name || "") + " " + (m.last_name || "") || m.username}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{m.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={ROLE_BADGE_CLASSES[m.role] || "bg-gray-100 text-gray-700 border-gray-200"}>
                        {m.role === "customer-rep" ? "Customer Rep" : m.role}
                      </Badge>
                      {isEdit && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() =>
                            setManagedMembers((prev) =>
                              prev.filter((mm) => mm._id !== m._id)
                            )
                          }
                        >
                          <UserMinus className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Member Control */}
          {isEdit && (
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-teal-600" />
                Add Member
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-3 items-center">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">
                    Select a customer-rep user to assign under this representative.
                  </Label>
                  <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose member to add" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMembers
                        .filter((cand) => !managedMembers.some((m) => m._id === cand._id))
                        .map((cand) => (
                          <SelectItem key={cand._id} value={cand._id}>
                            {cand.name || `${cand.first_name || ""} ${cand.last_name || ""}`.trim() || cand.username} — {cand.role}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  disabled={!selectedMemberId}
                  className="mt-1 bg-teal-600 hover:bg-teal-700 text-white"
                  onClick={() => {
                    if (!selectedMemberId) return;
                    const candidate = availableMembers.find((c) => c._id === selectedMemberId);
                    if (!candidate) return;
                    setManagedMembers((prev) => [
                      ...prev,
                      {
                        _id: candidate._id,
                        first_name: candidate.first_name,
                        last_name: candidate.last_name,
                        username: candidate.username,
                        email: candidate.email,
                        role: candidate.role,
                        active: candidate.active,
                        avatar: candidate.avatar,
                      },
                    ]);
                    setSelectedMemberId("");
                  }}
                >
                  Add Member
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Changes to team members will be saved when you click{" "}
                <span className="font-semibold">Save Changes</span> at the top.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerRepresentativeDetailed;
