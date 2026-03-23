"use client";

import React, { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Ticket, RefreshCw, Plus, LayoutGrid, List, Loader2, Trash2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SewerTable from "@/components/ui/SewerTable";
import { useSupportAllTickets, usePendingDeletionRequests } from "@/hooks/useQueryHooks";
import { useUser } from "@/components/providers/UserContext";
import { getUserName } from "@/components/customer-rep/constants";
import EmptySewerComponent from "@/components/shared/EmptySewerComponent";
import DeletionReviewModal from "@/components/customer-rep/tickets/DeletionReviewModal";

// Extracted components
import TicketDetail from "@/components/customer-rep/tickets/TicketDetail";
import CreateTicketModal from "@/components/customer-rep/tickets/CreateTicketModal";
import TicketCard from "@/components/customer-rep/tickets/TicketCard";
import renderTicketCell from "@/components/customer-rep/tickets/renderTicketCell";
import { FILTER_OPTIONS, COLUMNS, COLUMN_DEFAULTS } from "@/components/customer-rep/tickets/constants";
import { Input } from "@/components/ui/input";

export default function CustomerRepTickets() {
  const searchParams = useSearchParams();
  const { userData } = useUser();
  const [search, setSearch] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState(searchParams.get("id") || null);
  const [showCreate, setShowCreate] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"
  const [reviewingTicket, setReviewingTicket] = useState(null);

  const isTeamLeader = Array.isArray(userData?.managedMembers) && userData.managedMembers.length > 0;

  const { data: ticketsData, isLoading, refetch } = useSupportAllTickets({}, { refetchInterval: 30000 });
  const { data: deletionRequests = [], refetch: refetchDeletions } = usePendingDeletionRequests({ enabled: isTeamLeader });


  const tickets = useMemo(() => {
    const raw = ticketsData?.data ?? ticketsData;
    return Array.isArray(raw) ? raw : [];
  }, [ticketsData]);

  const tableData = useMemo(() => {
    return tickets.map((t) => ({
      _id: t._id,
      subject: t.subject || "No subject",
      customer: getUserName(t.customerId),
      category: t.category || "other",
      priority: t.priority || "medium",
      status: t.status || "open",
      responses: t.responses?.length || 0,
      assignedTo: t.assignedTo ? getUserName(t.assignedTo) : "Unassigned",
      createdAt: t.created_at || t.createdAt,
      deletionRequest: t.deletionRequest,
    }));
  }, [tickets]);


  // Filter for grid view
  const filteredCards = useMemo(() => {
    if (!search.trim()) return tableData;
    const q = search.toLowerCase();
    return tableData.filter(
      (t) =>
        t.subject?.toLowerCase().includes(q) ||
        t.customer?.toLowerCase().includes(q) ||
        t.assignedTo?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q)
    );
  }, [tableData, search]);

  if (selectedTicketId) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <TicketDetail ticketId={selectedTicketId} onBack={() => setSelectedTicketId(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-md">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Support Tickets</h1>
              <p className="text-sm text-gray-500">Manage and respond to customer tickets</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "grid" ? "bg-white shadow-sm text-teal-600" : "text-gray-500 hover:text-gray-700"
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "table" ? "bg-white shadow-sm text-teal-600" : "text-gray-500 hover:text-gray-700"
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <Button
              size="sm"
              className="bg-teal-600 hover:bg-teal-700"
              onClick={() => setShowCreate(true)}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Create Ticket
            </Button>
          </div>
        </div>

        {/* Pending Deletion Requests — Team Leaders Only */}
        {isTeamLeader && deletionRequests.length > 0 && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Trash2 className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-semibold text-amber-800">
                Pending Deletion Requests
              </h2>
              <Badge className="bg-amber-200 text-amber-800 text-xs">{deletionRequests.length}</Badge>
            </div>
            <div className="space-y-2">
              {deletionRequests.map((t) => (
                <div key={t._id} className="flex items-center justify-between gap-3 bg-white rounded-lg border border-amber-100 px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{t.subject}</p>
                    <p className="text-xs text-gray-500 truncate">
                      Requested by {getUserName(t.deletionRequest?.requestedBy)}
                      {t.deletionRequest?.reason ? ` · ${t.deletionRequest.reason}` : ""}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 border-amber-300 text-amber-700 hover:bg-amber-50 h-7 text-xs"
                    onClick={() => setReviewingTicket(t)}
                  >
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Review
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grid View */}
        {viewMode === "grid" && (
          <div>
            {/* Search + Refresh bar */}
            <div className="flex items-center gap-3 mb-4">
              <Input
                type="text"
                placeholder="Search tickets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 max-w-sm h-9 px-3 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
              />
              <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
              </div>
            ) : filteredCards.length === 0 ? (
              <div className="rounded-xl border border-gray-200 shadow-sm py-16 bg-gray-50">
                <EmptySewerComponent
                  variant="no-data"
                  title="No tickets found"
                  subtitle="Customer tickets will appear here when submitted"
                  size="md"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCards.map((ticket) => (
                  <TicketCard
                    key={ticket._id}
                    ticket={ticket}
                    onClick={(t) => setSelectedTicketId(t._id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Table View */}
        {viewMode === "table" && (
          <SewerTable
            data={tableData}
            columns={COLUMNS}
            filters={FILTER_OPTIONS}
            search={search}
            onSearch={setSearch}
            loading={isLoading}
            renderCell={renderTicketCell}
            showCheckbox={false}
            showActions={false}
            showCsvActions={false}
            onView={(row) => setSelectedTicketId(row._id)}
            emptyMessage="No tickets found"
            emptySubtext="Customer tickets will appear here when submitted"
            columnDefaults={COLUMN_DEFAULTS}
            rowsPerPageOptions={[10, 20, 50]}
            ButtonPlacement={
              <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            }
          />
        )}

        {/* Deletion Review Modal (from the pending panel) */}
        {reviewingTicket && (
          <DeletionReviewModal
            open={!!reviewingTicket}
            onOpenChange={(v) => { if (!v) setReviewingTicket(null); }}
            ticket={reviewingTicket}
            onApproved={() => { setReviewingTicket(null); refetch(); refetchDeletions(); }}
          />
        )}

        {/* Create Ticket Modal */}
        <CreateTicketModal
          open={showCreate}
          onOpenChange={setShowCreate}
          onCreated={() => refetch()}
        />
      </div>
    </div>
  );
}
