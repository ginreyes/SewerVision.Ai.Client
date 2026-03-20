"use client";

import React, { useState, useMemo } from "react";
import {
  Headphones,
  RefreshCw,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAlert } from "@/components/providers/AlertProvider";
import SewerTable from "@/components/ui/SewerTable";
import { useSupportAllTickets, useSupportGlobalStats } from "@/hooks/useQueryHooks";

const STATUS_COLORS = {
  open: "bg-amber-100 text-amber-700 border-amber-200",
  "in-progress": "bg-blue-100 text-blue-700 border-blue-200",
  resolved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  closed: "bg-gray-100 text-gray-600 border-gray-200",
};

const PRIORITY_COLORS = {
  low: "text-green-600",
  medium: "text-amber-600",
  high: "text-red-600",
};

const StatCard = ({ title, value, icon: Icon, color, description }) => (
  <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-4">
      <CardTitle className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{title}</CardTitle>
      <div className="p-2 bg-gray-50 rounded-lg">
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </CardHeader>
    <CardContent className="pb-4">
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      {description && <p className="text-xs text-gray-500 mt-1.5">{description}</p>}
    </CardContent>
  </Card>
);

export default function AdminSupportPage() {
  const [search, setSearch] = useState("");

  const { data: ticketsData, isLoading, refetch } = useSupportAllTickets({}, { refetchInterval: 30000 });
  const { data: globalStats } = useSupportGlobalStats({ refetchInterval: 30000 });

  const tickets = useMemo(() => {
    const raw = ticketsData?.data ?? ticketsData;
    return Array.isArray(raw) ? raw : [];
  }, [ticketsData]);

  const stats = useMemo(() => ({
    open: globalStats?.byStatus?.open || 0,
    inProgress: globalStats?.byStatus?.["in-progress"] || 0,
    resolved: globalStats?.byStatus?.resolved || 0,
    closed: globalStats?.byStatus?.closed || 0,
  }), [globalStats]);

  const columns = [
    { key: "subject", name: "Subject" },
    { key: "customer", name: "Customer" },
    { key: "category", name: "Category" },
    { key: "priority", name: "Priority" },
    { key: "status", name: "Status" },
    { key: "createdAt", name: "Created" },
  ];

  const tableData = useMemo(() => {
    return tickets.map((t) => ({
      _id: t._id,
      subject: t.subject || "No subject",
      customer: t.customerId?.first_name
        ? `${t.customerId.first_name} ${t.customerId.last_name || ""}`
        : t.customerId?.email || "Unknown",
      category: t.category || "other",
      priority: t.priority || "medium",
      status: t.status || "open",
      createdAt: t.created_at || t.createdAt,
    }));
  }, [tickets]);

  const renderCell = (item, col) => {
    if (col.key === "subject") {
      return <p className="text-sm font-medium text-gray-900 truncate">{item.subject}</p>;
    }
    if (col.key === "customer") {
      return <span className="text-sm text-gray-700">{item.customer}</span>;
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
          {item.status}
        </Badge>
      );
    }
    if (col.key === "createdAt") {
      if (!item.createdAt) return <span className="text-sm text-gray-400">—</span>;
      const d = new Date(item.createdAt);
      return (
        <div>
          <p className="text-sm text-gray-900">{d.toLocaleDateString()}</p>
          <p className="text-[11px] text-gray-400">{d.toLocaleTimeString()}</p>
        </div>
      );
    }
    return null;
  };

  const filterOptions = [
    {
      key: "status",
      label: "Status",
      options: [
        { label: "All", value: "all" },
        { label: "Open", value: "open" },
        { label: "In Progress", value: "in-progress" },
        { label: "Resolved", value: "resolved" },
        { label: "Closed", value: "closed" },
      ],
    },
    {
      key: "priority",
      label: "Priority",
      options: [
        { label: "All", value: "all" },
        { label: "High", value: "high" },
        { label: "Medium", value: "medium" },
        { label: "Low", value: "low" },
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center">
                <Headphones className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Customer Support</h1>
                <p className="text-sm text-gray-500">Manage all customer support tickets and complaints</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                <ShieldCheck className="w-3 h-3 mr-1" />
                Admin Access
              </Badge>
              <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard title="Open" value={stats.open} icon={AlertCircle} color="text-amber-600" description="Awaiting response" />
          <StatCard title="In Progress" value={stats.inProgress} icon={Clock} color="text-blue-600" description="Being handled" />
          <StatCard title="Resolved" value={stats.resolved} icon={CheckCircle} color="text-emerald-600" description="Successfully closed" />
          <StatCard title="Closed" value={stats.closed} icon={XCircle} color="text-gray-500" description="Archived tickets" />
        </div>

        {/* Ticket Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <SewerTable
            data={tableData}
            columns={columns}
            filters={filterOptions}
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
              customer: 160,
              category: 110,
              priority: 100,
              status: 120,
              createdAt: 130,
            }}
            rowsPerPageOptions={[10, 20, 50]}
          />
        </div>
      </div>
    </div>
  );
}
