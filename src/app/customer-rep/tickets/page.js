"use client";

import React, { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Ticket, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import SewerTable from "@/components/ui/SewerTable";
import { useSupportAllTickets } from "@/hooks/useQueryHooks";
import { getUserName } from "@/components/customer-rep/constants";

// Extracted components
import TicketDetail from "@/components/customer-rep/tickets/TicketDetail";
import renderTicketCell from "@/components/customer-rep/tickets/renderTicketCell";
import { FILTER_OPTIONS, COLUMNS, COLUMN_DEFAULTS } from "@/components/customer-rep/tickets/constants";

export default function CustomerRepTickets() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState(searchParams.get("id") || null);

  const { data: ticketsData, isLoading, refetch } = useSupportAllTickets({}, { refetchInterval: 30000 });

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
      createdAt: t.created_at || t.createdAt,
    }));
  }, [tickets]);

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
        </div>

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
      </div>
    </div>
  );
}
