"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  Loader2,
  MessageSquareWarning,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAlert } from "@/components/providers/AlertProvider";
import { useUser } from "@/components/providers/UserContext";
import {
  useCreateComplaint,
  useSupportTeam,
} from "@/hooks/useQueryHooks";
import { getUserName } from "../constants";
import { CATEGORY_OPTIONS, SOURCE_OPTIONS, SEVERITY_OPTIONS } from "./constants";

// Simple customer search (uses the team endpoint for now, or you can wire up a user search)
function useCustomerSearch(query) {
  // For MVP, customer info is entered manually.
  // In production, you'd search via /api/users?role=customer&search=query
  return { customers: [], isSearching: false };
}

export default function CreateComplaintModal({ open, onOpenChange, onCreated }) {
  const { userId } = useUser();
  const { showAlert } = useAlert();
  const { data: teamData } = useSupportTeam();
  const createMutation = useCreateComplaint();

  const team = useMemo(() => (Array.isArray(teamData) ? teamData : []), [teamData]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "service",
    severity: "medium",
    source: "phone",
    customerId: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    assignedTo: "",
    tags: "",
  });

  const updateField = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const isValid =
    form.title.trim() &&
    form.description.trim() &&
    form.customerId.trim() &&
    form.customerName.trim() &&
    form.customerEmail.trim();

  const handleSubmit = useCallback(async () => {
    if (!isValid) {
      showAlert("Please fill all required fields", "error");
      return;
    }
    try {
      await createMutation.mutateAsync({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        severity: form.severity,
        source: form.source,
        customerId: form.customerId.trim(),
        customerName: form.customerName.trim(),
        customerEmail: form.customerEmail.trim(),
        customerPhone: form.customerPhone.trim(),
        assignedTo: form.assignedTo || undefined,
        createdBy: userId,
        tags: form.tags
          ? form.tags
              .split(",")
              .map((t) => t.trim().toLowerCase())
              .filter(Boolean)
          : [],
      });
      showAlert("Complaint created successfully", "success");
      setForm({
        title: "",
        description: "",
        category: "service",
        severity: "medium",
        source: "phone",
        customerId: "",
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        assignedTo: "",
        tags: "",
      });
      onOpenChange(false);
      onCreated?.();
    } catch (e) {
      showAlert(e.message, "error");
    }
  }, [form, isValid, userId, createMutation, showAlert, onOpenChange, onCreated]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquareWarning className="w-5 h-5 text-teal-600" />
            New Customer Complaint
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Title */}
          <div>
            <Label className="text-xs font-medium text-gray-600">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Brief complaint title"
              className="mt-1"
              maxLength={200}
            />
          </div>

          {/* Description */}
          <div>
            <Label className="text-xs font-medium text-gray-600">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Detailed description of the customer complaint..."
              rows={4}
              className="mt-1"
              maxLength={3000}
            />
          </div>

          {/* Customer Info */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-3">
            <p className="text-xs font-semibold text-gray-700">Customer Information</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium text-gray-600">
                  Customer ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={form.customerId}
                  onChange={(e) => updateField("customerId", e.target.value)}
                  placeholder="Customer user ID"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-600">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={form.customerName}
                  onChange={(e) => updateField("customerName", e.target.value)}
                  placeholder="Full name"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium text-gray-600">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={form.customerEmail}
                  onChange={(e) => updateField("customerEmail", e.target.value)}
                  placeholder="customer@email.com"
                  type="email"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-600">Phone</Label>
                <Input
                  value={form.customerPhone}
                  onChange={(e) => updateField("customerPhone", e.target.value)}
                  placeholder="Phone number"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Classification */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs font-medium text-gray-600">Category</Label>
              <Select value={form.category} onValueChange={(v) => updateField("category", v)}>
                <SelectTrigger className="mt-1 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.filter((o) => o.value !== "all").map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-600">Severity</Label>
              <Select value={form.severity} onValueChange={(v) => updateField("severity", v)}>
                <SelectTrigger className="mt-1 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEVERITY_OPTIONS.filter((o) => o.value !== "all").map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-600">Source</Label>
              <Select value={form.source} onValueChange={(v) => updateField("source", v)}>
                <SelectTrigger className="mt-1 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOURCE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignment */}
          <div>
            <Label className="text-xs font-medium text-gray-600">Assign To (optional)</Label>
            <Select
              value={form.assignedTo || "unassigned"}
              onValueChange={(v) => updateField("assignedTo", v === "unassigned" ? "" : v)}
            >
              <SelectTrigger className="mt-1 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {team.map((member) => (
                  <SelectItem key={member._id} value={member._id}>
                    {getUserName(member)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div>
            <Label className="text-xs font-medium text-gray-600">Tags (comma separated)</Label>
            <Input
              value={form.tags}
              onChange={(e) => updateField("tags", e.target.value)}
              placeholder="e.g. urgent, billing-error, vip"
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            className="bg-teal-600 hover:bg-teal-700"
            onClick={handleSubmit}
            disabled={!isValid || createMutation.isPending}
          >
            {createMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <MessageSquareWarning className="w-4 h-4 mr-1" />
            )}
            Create Complaint
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
