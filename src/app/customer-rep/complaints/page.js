"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquareWarning,
  RefreshCw,
  Plus,
  AlertTriangle,
  Search as SearchIcon,
  Clock,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SewerTable from "@/components/ui/SewerTable";
import { useComplaintsAll, useComplaintStats } from "@/hooks/useQueryHooks";
import { getUserName } from "@/components/customer-rep/constants";

// Extracted components
import ComplaintDetail from "@/components/customer-rep/complaints/ComplaintDetail";
import CreateComplaintModal from "@/components/customer-rep/complaints/CreateComplaintModal";
import renderComplaintCell from "@/components/customer-rep/complaints/renderComplaintCell";
import {
  FILTER_OPTIONS,
  COLUMNS,
  COLUMN_DEFAULTS,
} from "@/components/customer-rep/complaints/constants";

// ── Stat card ──
function StatMini({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-lg font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default function CustomerRepComplaints() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const {
    data: complaintsData,
    isLoading,
    refetch,
  } = useComplaintsAll({}, { refetchInterval: 30000 });

  const { data: stats } = useComplaintStats({ refetchInterval: 30000 });

  const complaints = useMemo(() => {
    const raw = complaintsData?.data ?? complaintsData;
    return Array.isArray(raw) ? raw : [];
  }, [complaintsData]);

  const tableData = useMemo(() => {
    return complaints.map((c) => ({
      _id: c._id,
      title: c.title || "Untitled",
      customer: c.customerName || getUserName(c.customerId),
      category: c.category || "other",
      severity: c.severity || "medium",
      status: c.status || "new",
      source: c.source || "other",
      hasTicket: !!c.linkedTicketId,
      createdAt: c.created_at || c.createdAt,
    }));
  }, [complaints]);

  const handleNavigateTicket = useCallback(
    (ticketId) => {
      router.push(`/customer-rep/tickets?id=${ticketId}`);
    },
    [router]
  );

  // ── Detail View ──
  if (selectedComplaintId) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <ComplaintDetail
            complaintId={selectedComplaintId}
            onBack={() => setSelectedComplaintId(null)}
            onNavigateTicket={handleNavigateTicket}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* ── Header ── */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-md">
              <MessageSquareWarning className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Customer Complaints</h1>
              <p className="text-sm text-gray-500">
                Track, manage, and resolve customer complaints
              </p>
            </div>
          </div>
          <Button
            size="sm"
            className="bg-teal-600 hover:bg-teal-700"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Complaint
          </Button>
        </div>

        {/* ── Stats Bar ── */}
        {stats && (
          <Card className="border-gray-200 shadow-sm mb-6">
            <CardContent className="p-0">
              <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-gray-100">
                <StatMini
                  icon={AlertTriangle}
                  label="New"
                  value={stats.new || 0}
                  color="bg-amber-100 text-amber-600"
                />
                <StatMini
                  icon={SearchIcon}
                  label="Investigating"
                  value={stats.investigating || 0}
                  color="bg-blue-100 text-blue-600"
                />
                <StatMini
                  icon={ShieldAlert}
                  label="Action Required"
                  value={stats.actionRequired || 0}
                  color="bg-red-100 text-red-600"
                />
                <StatMini
                  icon={CheckCircle2}
                  label="Resolved"
                  value={stats.resolved || 0}
                  color="bg-emerald-100 text-emerald-600"
                />
                <StatMini
                  icon={Clock}
                  label="This Week"
                  value={stats.recentWeek || 0}
                  color="bg-teal-100 text-teal-600"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Table ── */}
        <SewerTable
          data={tableData}
          columns={COLUMNS}
          filters={FILTER_OPTIONS}
          search={search}
          onSearch={setSearch}
          loading={isLoading}
          renderCell={renderComplaintCell}
          showCheckbox={false}
          showActions={false}
          showCsvActions={false}
          onView={(row) => setSelectedComplaintId(row._id)}
          emptyMessage="No complaints found"
          emptySubtext="Customer complaints will appear here when created"
          columnDefaults={COLUMN_DEFAULTS}
          rowsPerPageOptions={[10, 20, 50]}
          ButtonPlacement={
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          }
        />

        {/* ── Create Modal ── */}
        <CreateComplaintModal
          open={showCreate}
          onOpenChange={setShowCreate}
          onCreated={() => refetch()}
        />
      </div>
    </div>
  );
}
