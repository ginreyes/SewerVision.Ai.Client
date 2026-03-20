"use client";

import React, { useState, useMemo } from "react";
import {
  MessageSquareWarning,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Search as SearchIcon,
  ChevronRight,
  Send,
  Loader2,
  ArrowLeft,
  Ticket,
  LinkIcon,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/components/providers/UserContext";
import { useAlert } from "@/components/providers/AlertProvider";
import EmptySewerComponent from "@/components/shared/EmptySewerComponent";
import {
  useCustomerComplaints,
  useCreateCustomerComplaint,
  useComplaint,
} from "@/hooks/useQueryHooks";

// ── Constants ──

const STATUS_COLORS = {
  new: "bg-amber-100 text-amber-700 border-amber-200",
  investigating: "bg-blue-100 text-blue-700 border-blue-200",
  "action-required": "bg-orange-100 text-orange-700 border-orange-200",
  resolved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  dismissed: "bg-gray-100 text-gray-600 border-gray-200",
};

const STATUS_LABELS = {
  new: "Submitted",
  investigating: "Under Review",
  "action-required": "Action Required",
  resolved: "Resolved",
  dismissed: "Closed",
};

const STATUS_ICONS = {
  new: AlertCircle,
  investigating: Clock,
  "action-required": AlertCircle,
  resolved: CheckCircle,
  dismissed: XCircle,
};

const SEVERITY_COLORS = {
  critical: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-green-100 text-green-700",
};

const CATEGORIES = [
  { value: "service", label: "Service Issue" },
  { value: "billing", label: "Billing Problem" },
  { value: "technical", label: "Technical Issue" },
  { value: "delivery", label: "Delivery Problem" },
  { value: "quality", label: "Quality Concern" },
  { value: "communication", label: "Communication Issue" },
  { value: "other", label: "Other" },
];

const SEVERITY_OPTIONS = [
  { value: "low", label: "Low - Minor inconvenience" },
  { value: "medium", label: "Medium - Noticeable impact" },
  { value: "high", label: "High - Significant impact" },
  { value: "critical", label: "Critical - Urgent attention needed" },
];

// ── Complaint Detail View ──

function ComplaintDetailView({ complaintId, onBack }) {
  const { data: complaint, isLoading } = useComplaint(complaintId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="text-center py-16 text-gray-500">Complaint not found</div>
    );
  }

  const StatusIcon = STATUS_ICONS[complaint.status] || AlertCircle;
  const linkedTicket = complaint.linkedTicketId;

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to complaints
      </Button>

      {/* Main complaint card */}
      <Card>
        <CardContent className="p-5">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {complaint.title}
          </h3>
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <Badge className={`${STATUS_COLORS[complaint.status]} text-xs`}>
              <StatusIcon className="w-3 h-3 mr-1 inline" />
              {STATUS_LABELS[complaint.status] || complaint.status}
            </Badge>
            <Badge
              variant="outline"
              className={`text-xs capitalize ${SEVERITY_COLORS[complaint.severity] || ""}`}
            >
              {complaint.severity} severity
            </Badge>
            <Badge variant="outline" className="text-xs capitalize">
              {complaint.category}
            </Badge>
            <span className="text-xs text-gray-400">
              {complaint.created_at
                ? new Date(complaint.created_at).toLocaleString()
                : ""}
            </span>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {complaint.description}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Linked ticket info */}
      {linkedTicket && (
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <LinkIcon className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-semibold text-gray-900">
                Support Ticket Created
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Ticket className="w-3.5 h-3.5" />
              <span>{linkedTicket.subject || "Support ticket"}</span>
              {linkedTicket.status && (
                <Badge
                  variant="outline"
                  className="text-[10px] capitalize"
                >
                  {linkedTicket.status}
                </Badge>
              )}
              {linkedTicket.priority && (
                <Badge
                  variant="outline"
                  className="text-[10px] capitalize"
                >
                  {linkedTicket.priority} priority
                </Badge>
              )}
            </div>
            {linkedTicket.responses?.length > 0 && (
              <p className="text-xs text-gray-500 mt-1.5">
                {linkedTicket.responses.length} response
                {linkedTicket.responses.length > 1 ? "s" : ""} from support team
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resolution (if resolved) */}
      {complaint.status === "resolved" && complaint.resolution && (
        <Card className="border-l-4 border-l-emerald-400">
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold text-emerald-700 mb-1">
              Resolution
            </h4>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {complaint.resolution}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Status timeline info */}
      <Card>
        <CardContent className="p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Category</span>
              <p className="font-medium capitalize">{complaint.category}</p>
            </div>
            <div>
              <span className="text-gray-500">Severity</span>
              <p className="font-medium capitalize">{complaint.severity}</p>
            </div>
            <div>
              <span className="text-gray-500">Submitted</span>
              <p className="font-medium">
                {complaint.created_at
                  ? new Date(complaint.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "\u2014"}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Assigned To</span>
              <p className="font-medium">
                {complaint.assignedTo
                  ? `${complaint.assignedTo.first_name || ""} ${complaint.assignedTo.last_name || ""}`.trim() ||
                    "Support Team"
                  : "Pending assignment"}
              </p>
            </div>
            {complaint.resolvedAt && (
              <div>
                <span className="text-gray-500">Resolved</span>
                <p className="font-medium text-emerald-600">
                  {new Date(complaint.resolvedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Page ──

export default function CustomerComplaintsPage() {
  const { userId, userData } = useUser();
  const { showAlert } = useAlert();
  const [activeTab, setActiveTab] = useState("complaints");
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState("medium");

  const { data: complaintsRaw, isLoading, refetch } = useCustomerComplaints(userId, {
    refetchInterval: 30000,
  });
  const createMutation = useCreateCustomerComplaint();

  const complaints = useMemo(() => {
    return Array.isArray(complaintsRaw) ? complaintsRaw : [];
  }, [complaintsRaw]);

  // Stats
  const statusCounts = useMemo(() => {
    const counts = { new: 0, investigating: 0, resolved: 0, total: complaints.length };
    complaints.forEach((c) => {
      if (c.status === "new") counts.new++;
      else if (c.status === "investigating" || c.status === "action-required")
        counts.investigating++;
      else if (c.status === "resolved") counts.resolved++;
    });
    return counts;
  }, [complaints]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !category || !description.trim()) {
      showAlert("Please fill all required fields", "error");
      return;
    }
    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        category,
        severity,
        customerId: userId,
        customerName:
          `${userData?.first_name || ""} ${userData?.last_name || ""}`.trim() ||
          userData?.username ||
          "Customer",
        customerEmail: userData?.email || "",
        customerPhone: userData?.phone_number || "",
      });
      showAlert("Complaint submitted successfully!", "success");
      setTitle("");
      setDescription("");
      setCategory("");
      setSeverity("medium");
      setActiveTab("complaints");
      refetch();
    } catch (e) {
      showAlert(e.message, "error");
    }
  };

  // Detail view
  if (selectedComplaintId) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <ComplaintDetailView
          complaintId={selectedComplaintId}
          onBack={() => setSelectedComplaintId(null)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
            <MessageSquareWarning className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Complaints</h1>
            <p className="text-sm text-gray-500">
              Submit and track your complaints
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Submitted",
            value: statusCounts.new,
            color: "text-amber-600",
            icon: AlertCircle,
          },
          {
            label: "Under Review",
            value: statusCounts.investigating,
            color: "text-blue-600",
            icon: Clock,
          },
          {
            label: "Resolved",
            value: statusCounts.resolved,
            color: "text-emerald-600",
            icon: CheckCircle,
          },
          {
            label: "Total",
            value: statusCounts.total,
            color: "text-gray-700",
            icon: MessageSquareWarning,
          },
        ].map((s) => (
          <Card key={s.label} className="border shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase">
                  {s.label}
                </p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
              <s.icon className={`w-5 h-5 ${s.color} opacity-40`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="complaints">My Complaints</TabsTrigger>
          <TabsTrigger value="new">Submit Complaint</TabsTrigger>
        </TabsList>

        {/* ── My Complaints Tab ── */}
        <TabsContent value="complaints" className="mt-4">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
            </div>
          ) : complaints.length === 0 ? (
            <div className="rounded-xl border py-16">
              <EmptySewerComponent
                variant="no-tickets"
                title="No complaints yet"
                subtitle="If you have an issue, submit a complaint and our team will look into it"
                size="md"
                action={{
                  label: "Submit Complaint",
                  onClick: () => setActiveTab("new"),
                }}
              />
            </div>
          ) : (
            <div className="space-y-2">
              {complaints.map((c) => {
                const StatusIcon = STATUS_ICONS[c.status] || AlertCircle;
                const hasTicket = !!c.linkedTicketId;
                return (
                  <Card
                    key={c._id}
                    className="border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedComplaintId(c._id)}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {c.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge
                            className={`${STATUS_COLORS[c.status]} text-[10px]`}
                          >
                            <StatusIcon className="w-2.5 h-2.5 mr-0.5 inline" />
                            {STATUS_LABELS[c.status] || c.status}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-[10px] capitalize ${SEVERITY_COLORS[c.severity] || ""}`}
                          >
                            {c.severity}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-[10px] capitalize"
                          >
                            {c.category}
                          </Badge>
                          <span className="text-[10px] text-gray-400">
                            {c.created_at
                              ? new Date(c.created_at).toLocaleDateString()
                              : ""}
                          </span>
                          {hasTicket && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] bg-emerald-50 text-emerald-700"
                            >
                              <Ticket className="w-2.5 h-2.5 mr-0.5 inline" />
                              Ticket created
                            </Badge>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── Submit Complaint Tab ── */}
        <TabsContent value="new" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Submit a Complaint</CardTitle>
              <CardDescription>
                Tell us about your issue and we will investigate it promptly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div className="space-y-1.5">
                  <Label>
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Brief summary of your complaint"
                    maxLength={200}
                  />
                </div>

                {/* Category & Severity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>
                      Category <span className="text-red-500">*</span>
                    </Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category..." />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Severity</Label>
                    <Select value={severity} onValueChange={setSeverity}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SEVERITY_OPTIONS.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <Label>
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your complaint in detail. Include any relevant information that will help us investigate..."
                    rows={6}
                    className="resize-none"
                    maxLength={3000}
                  />
                  <p className="text-xs text-gray-400 text-right">
                    {description.length}/3000
                  </p>
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {createMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-1.5" />
                    )}
                    Submit Complaint
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
