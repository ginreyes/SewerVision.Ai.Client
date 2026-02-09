'use client';

import React, { useEffect, useState } from "react";
import {
  FileText,
  CheckCircle,
  Clock,
  BarChart3,
  Search,
  Calendar as CalendarIcon,
  MapPin,
  User,
} from "lucide-react";
import { api } from "@/lib/helper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAlert } from "@/components/providers/AlertProvider";

const statusConfig = {
  completed: {
    label: "Completed",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  "in-review": {
    label: "In Review",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  pending: {
    label: "Pending",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  draft: {
    label: "Draft",
    className: "bg-gray-100 text-gray-700 border-gray-200",
  },
};

export default function UserReportsPage() {
  const { showAlert } = useAlert();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all"); // operator | qc
  const [search, setSearch] = useState("");

  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inReview: 0,
  });

  useEffect(() => {
    const fetchAllReports = async () => {
      try {
        setLoading(true);
        const { ok, data } = await api("/api/reports/get-all-report", "GET");
        if (!ok || !Array.isArray(data)) {
          setReports([]);
          return;
        }

        const formatted = data.map((r) => ({
          id: r._id,
          inspectionId: r.reportId || `REP-${String(r._id).slice(-6)}`,
          projectName: r.project?.name || "N/A",
          location: r.project?.location || r.location || "Unknown",
          status: r.status || "pending",
          roleSource: r.role === "qc-technician" ? "qc" : "operator",
          operatorName:
            r.operator?.name ||
            (r.operator?.first_name && r.operator?.last_name
              ? `${r.operator.first_name} ${r.operator.last_name}`
              : "N/A"),
          qcName:
            r.qcTechnician?.name ||
            (r.qcTechnician?.first_name && r.qcTechnician?.last_name
              ? `${r.qcTechnician.first_name} ${r.qcTechnician.last_name}`
              : null),
          createdAt: r.createdAt,
        }));

        setReports(formatted);

        const completed = formatted.filter((r) => r.status === "completed")
          .length;
        const inReview = formatted.filter((r) => r.status === "in-review")
          .length;

        setStats({
          total: formatted.length,
          completed,
          inReview,
        });
      } catch (err) {
        console.error("Failed to load reports:", err);
        showAlert("Failed to load reports", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchAllReports();
  }, [showAlert]);

  const filteredReports = reports.filter((r) => {
    const matchesStatus =
      statusFilter === "all" ? true : r.status === statusFilter;
    const matchesSource =
      sourceFilter === "all"
        ? true
        : sourceFilter === "operator"
        ? r.roleSource === "operator"
        : r.roleSource === "qc";
    const term = search.trim().toLowerCase();
    const matchesSearch =
      !term ||
      r.inspectionId.toLowerCase().includes(term) ||
      r.projectName.toLowerCase().includes(term) ||
      r.location.toLowerCase().includes(term);
    return matchesStatus && matchesSource && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Team Reports Overview
            </h1>
            <p className="text-sm text-gray-600 mt-0.5">
              Review Operator and QC reports from a single place.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-5">
            <p className="text-xs text-gray-500">Total Reports</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {stats.total}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-5">
            <p className="text-xs text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {stats.completed}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-5">
            <p className="text-xs text-gray-500">In Review</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {stats.inReview}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-5 space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by project, inspection ID, or location..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in-review">In Review</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full md:w-[190px]">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="operator">Operator</SelectItem>
                <SelectItem value="qc">QC Technician</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              Loading team reports...
            </CardContent>
          </Card>
        ) : filteredReports.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              No reports match your filters.
            </CardContent>
          </Card>
        ) : (
          filteredReports.map((r) => {
            const statusCfg = statusConfig[r.status] || statusConfig.pending;
            return (
              <Card key={r.id} className="border-gray-100 shadow-sm">
                <CardContent className="py-4 px-5 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-rose-500" />
                      <p className="font-semibold text-gray-900 truncate">
                        {r.inspectionId}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 truncate">
                      {r.projectName}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {r.location}
                      </span>
                      {r.createdAt && (
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" />
                          {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      )}
                      {r.operatorName && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {r.operatorName}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-2">
                    <Badge
                      variant="outline"
                      className={statusCfg.className + " border px-2 py-0.5"}
                    >
                      {statusCfg.label}
                    </Badge>
                    <Badge variant="secondary">
                      {r.roleSource === "qc" ? "QC Report" : "Operator Report"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

