"use client";

import React, { useState, useMemo, useCallback, memo } from "react";
import {
  Headphones, RefreshCw, AlertCircle, Clock, CheckCircle,
  XCircle, ShieldCheck, Eye, MessageSquare,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import SewerTable from "@/components/ui/SewerTable";
import { useSupportAllTickets, useSupportGlobalStats } from "@/hooks/useQueryHooks";
import { SupportStats, CategoryBreakdown, STATUS_COLORS, PRIORITY_COLORS, FILTER_OPTIONS, TABLE_COLUMNS } from "@/components/admin/support";

const TicketCellRenderer = memo(({ item, col, onView }) => {
  if (col.key === "subject") {
    return (
      <button onClick={() => onView(item._id)} className="text-left group">
        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-rose-600 transition-colors">{item.subject}</p>
        {item.responseCount > 0 && (
          <span className="text-[10px] text-gray-400 flex items-center gap-0.5 mt-0.5">
            <MessageSquare className="w-3 h-3" />{item.responseCount} response{item.responseCount !== 1 ? "s" : ""}
          </span>
        )}
      </button>
    );
  }
  if (col.key === "customer") {
    return <span className="text-sm text-gray-700">{item.customer}</span>;
  }
  if (col.key === "assignedTo") {
    return item.assignedTo ? (
      <span className="text-sm text-gray-700">{item.assignedTo}</span>
    ) : (
      <span className="text-xs text-gray-400 italic">Unassigned</span>
    );
  }
  if (col.key === "category") {
    return <Badge variant="outline" className="text-xs capitalize">{item.category}</Badge>;
  }
  if (col.key === "priority") {
    return (
      <span className={`text-xs font-semibold uppercase ${PRIORITY_COLORS[item.priority] || ""}`}>
        {item.priority}
      </span>
    );
  }
  if (col.key === "status") {
    return (
      <Badge className={`text-xs capitalize ${STATUS_COLORS[item.status] || ""}`}>
        {item.status === "in-progress" && <Clock className="w-3 h-3 mr-1 inline" />}
        {item.status === "resolved" && <CheckCircle className="w-3 h-3 mr-1 inline" />}
        {item.status === "open" && <AlertCircle className="w-3 h-3 mr-1 inline" />}
        {item.status === "closed" && <XCircle className="w-3 h-3 mr-1 inline" />}
        {item.status}
      </Badge>
    );
  }
  if (col.key === "createdAt") {
    if (!item.createdAt) return <span className="text-sm text-gray-400">-</span>;
    const d = new Date(item.createdAt);
    const now = new Date();
    const diffH = Math.floor((now.getTime() - d.getTime()) / 3600000);
    return (
      <div>
        <p className="text-sm text-gray-900">{d.toLocaleDateString()}</p>
        <p className="text-[11px] text-gray-400">
          {diffH < 1 ? "Just now" : diffH < 24 ? `${diffH}h ago` : `${Math.floor(diffH / 24)}d ago`}
        </p>
      </div>
    );
  }
  return null;
});
TicketCellRenderer.displayName = "TicketCellRenderer";

export default function AdminSupportPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const { data: ticketsData, isLoading, refetch, isFetching } = useSupportAllTickets({}, { refetchInterval: 30000 });
  const { data: globalStats } = useSupportGlobalStats({ refetchInterval: 30000 });

  const tickets = useMemo(() => {
    const raw = ticketsData?.data ?? ticketsData;
    return Array.isArray(raw) ? raw : [];
  }, [ticketsData]);

  const tableData = useMemo(() => {
    return tickets.map((t) => ({
      _id: t._id,
      subject: t.subject || "No subject",
      customer: t.customerId?.first_name
        ? `${t.customerId.first_name} ${t.customerId.last_name || ""}`.trim()
        : t.customerId?.email || "Unknown",
      assignedTo: t.assignedTo?.first_name
        ? `${t.assignedTo.first_name} ${t.assignedTo.last_name || ""}`.trim()
        : null,
      category: t.category || "other",
      priority: t.priority || "medium",
      status: t.status || "open",
      createdAt: t.created_at || t.createdAt,
      responseCount: t.responses?.length || 0,
    }));
  }, [tickets]);

  const handleViewTicket = useCallback((ticketId) => {
    // Navigate to ticket detail or open in customer-rep context
    router.push(`/admin/support?ticket=${ticketId}`);
  }, [router]);

  const renderCell = useCallback((item, col) => {
    return <TicketCellRenderer item={item} col={col} onView={handleViewTicket} />;
  }, [handleViewTicket]);

  return (
    <div className="max-w-7xl mx-auto bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-600 to-red-700 flex items-center justify-center shadow-md">
                <Headphones className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Customer Support Overview</h1>
                <p className="text-sm text-gray-500">
                  {globalStats?.total || 0} total tickets · {globalStats?.todayNew || 0} new today
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
                <ShieldCheck className="w-3 h-3 mr-1" />
                Admin View
              </Badge>
              <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
                <RefreshCw className={`w-4 h-4 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-5">
        {/* Stats Row */}
        <SupportStats globalStats={globalStats} tickets={tickets} />

        {/* Category & Priority Breakdown */}
        <CategoryBreakdown
          byCategory={globalStats?.byCategory}
          byPriority={globalStats?.byPriority}
        />

        {/* Ticket Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <SewerTable
            data={tableData}
            columns={TABLE_COLUMNS}
            filters={FILTER_OPTIONS}
            search={search}
            onSearch={setSearch}
            loading={isLoading}
            renderCell={renderCell}
            showCheckbox={false}
            showActions={false}
            showCsvActions={false}
            emptyMessage="No support tickets"
            emptySubtext="Customer tickets will appear here when submitted"
            columnDefaults={{
              subject: 220,
              customer: 140,
              assignedTo: 130,
              category: 100,
              priority: 90,
              status: 120,
              createdAt: 110,
            }}
            rowsPerPageOptions={[10, 20, 50]}
          />
        </div>
      </div>
    </div>
  );
}
