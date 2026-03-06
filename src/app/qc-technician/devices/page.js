"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Monitor, Tablet, Camera, CheckCircle, XCircle, 
  Search, Activity, AlertCircle, Calendar, Loader2,
  Zap, Settings, MapPin, HardDrive, Wrench, AlertTriangle
} from "lucide-react";
import { api } from "@/lib/helper";
import { devicesApi } from "@/data/devicesApi";
import { useAlert } from "@/components/providers/AlertProvider";
import { useUser } from "@/components/providers/UserContext";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import DeviceDetailModal from "./DeviceDetailModal";

// Compact Stat Card (matching dashboard style)
const StatCard = ({ icon: Icon, value, label, color = 'blue' }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-emerald-600',
    orange: 'from-orange-500 to-amber-600',
    red: 'from-red-500 to-rose-600',
    purple: 'from-purple-500 to-indigo-600',
    rose: 'from-rose-500 to-pink-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClasses[color] || colorClasses.blue}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
};

const QCDevicesPage = () => {
  const { showAlert } = useAlert();
  const { userId } = useUser() || {};
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportingId, setReportingId] = useState(null);

  useEffect(() => {
    fetchDevices();
  }, [userId]);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      if (!userId) {
        setDevices([]);
        return;
      }
      const list = await devicesApi.getDevices({ qcTechnicianId: userId });
      setDevices(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Error fetching devices:", error);
      showAlert("Failed to load devices", "error");
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'camera':
      case 'cctv':
        return Camera;
      case 'tablet':
        return Tablet;
      case 'monitor':
      case 'console':
        return Monitor;
      default:
        return HardDrive;
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'online':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'inactive':
      case 'offline':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'maintenance':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         device.deviceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         device.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         device.location?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || device.status?.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: devices.length,
    active: devices.filter(d => ['active', 'online'].includes(d.status?.toLowerCase())).length,
    offline: devices.filter(d => ['inactive', 'offline'].includes(d.status?.toLowerCase())).length,
    maintenance: devices.filter(d => d.status?.toLowerCase() === 'maintenance').length,
  };

  const handleDeviceClick = (device) => {
    setSelectedDevice(device);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDevice(null);
  };

  const handleReportStatus = async (deviceId, reportedStatus) => {
    if (!userId) return;
    setReportingId(deviceId);
    try {
      const res = await api(`/api/devices/${deviceId}/report-status`, "PUT", {
        reportedStatus,
        reportedBy: userId,
      });
      if (res.ok) {
        const updated = res.data?.data ?? res.data;
        setDevices((prev) =>
          prev.map((d) =>
            d._id === deviceId
              ? { ...d, reportedStatus: updated?.reportedStatus ?? reportedStatus }
              : d
          )
        );
        showAlert("Device report updated", "success");
      } else {
        showAlert(res.data?.message || "Failed to report status", "error");
      }
    } catch (e) {
      showAlert(e?.message || "Failed to report status", "error");
    } finally {
      setReportingId(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-rose-100 rounded-lg">
            <Monitor className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Device Management</h1>
            <p className="text-sm text-gray-500">Inspection devices and equipment</p>
          </div>
        </div>
      </div>

      {/* Stats Grid - Compact like dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Monitor} value={stats.total} label="Total Devices" color="blue" />
        <StatCard icon={CheckCircle} value={stats.active} label="Active" color="green" />
        <StatCard icon={XCircle} value={stats.offline} label="Offline" color="red" />
        <StatCard icon={Settings} value={stats.maintenance} label="Maintenance" color="orange" />
      </div>

      {/* Search and Filter - Clean card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search devices..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Devices List */}
      {loading ? (
        <Card>
          <CardContent className="py-12 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-rose-500 mb-3" />
            <p className="text-sm text-gray-500">Loading devices...</p>
          </CardContent>
        </Card>
      ) : filteredDevices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No devices found</h3>
            <p className="text-sm text-gray-500">
              {searchQuery || filterStatus !== "all" 
                ? "Try adjusting your search or filter" 
                : "No devices registered yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDevices.map((device) => {
            const DeviceIcon = getDeviceIcon(device.type);
            const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

            return (
              <Card 
                key={device._id} 
                className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-gray-200 cursor-pointer"
                onClick={() => handleDeviceClick(device)}
              >
                {/* Device Image Section */}
                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden">
                  {device.image || device.imageFileId ? (
                    <img 
                      src={`${API_URL}/api/devices/${device._id}/image`}
                      alt={device.name || "Device"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className={`${device.image || device.imageFileId ? 'hidden' : 'flex'} absolute inset-0 items-center justify-center bg-gradient-to-br from-rose-50 to-purple-50`}
                    style={{ display: device.image || device.imageFileId ? 'none' : 'flex' }}
                  >
                    <div className="p-6 bg-white rounded-2xl shadow-lg">
                      <DeviceIcon className="w-12 h-12 text-rose-500" />
                    </div>
                  </div>
                  
                  {/* Status Badge Overlay */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm border ${getStatusBadge(device.status)}`}>
                      {device.status || "Unknown"}
                    </span>
                  </div>
                </div>

                {/* Device Info Section */}
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg shadow-md">
                        <DeviceIcon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-bold text-gray-900 truncate group-hover:text-rose-600 transition-colors">
                          {device.name || device.deviceName || "Unnamed Device"}
                        </CardTitle>
                        <p className="text-xs text-gray-500 mt-0.5">{device.model || device.type}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-2.5 pt-0">
                  {/* Type */}
                  <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="text-xs text-gray-600 flex items-center gap-2 font-medium">
                      <Activity className="w-3.5 h-3.5 text-rose-500" />
                      Type
                    </span>
                    <span className="text-xs font-semibold text-gray-900">{device.type || "N/A"}</span>
                  </div>
                  
                  {/* Serial Number */}
                  {device.serialNumber && (
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="text-xs text-gray-600 flex items-center gap-2 font-medium">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        Serial
                      </span>
                      <span className="text-xs font-mono font-semibold text-gray-900">{device.serialNumber}</span>
                    </div>
                  )}
                  
                  {/* Location */}
                  {device.location && (
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="text-xs text-gray-600 flex items-center gap-2 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-blue-500" />
                        Location
                      </span>
                      <span className="text-xs font-semibold text-gray-900 truncate ml-2">{device.location}</span>
                    </div>
                  )}
                  
                  {/* Manufacturer */}
                  {device.manufacturer && (
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="text-xs text-gray-600 flex items-center gap-2 font-medium">
                        <HardDrive className="w-3.5 h-3.5 text-purple-500" />
                        Manufacturer
                      </span>
                      <span className="text-xs font-semibold text-gray-900 truncate ml-2">{device.manufacturer}</span>
                    </div>
                  )}

                  {/* Report device: needs repair / needs maintenance */}
                  <div className="py-2 px-3 border border-slate-100 rounded-lg bg-slate-50/50 space-y-2">
                    <p className="text-xs font-medium text-gray-600 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Report device
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      {device.reportedStatus && (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                            device.reportedStatus === "needs_repair"
                              ? "bg-red-100 text-red-700 border border-red-200"
                              : device.reportedStatus === "needs_maintenance"
                              ? "bg-amber-100 text-amber-700 border border-amber-200"
                              : "bg-green-100 text-green-700 border border-green-200"
                          }`}
                        >
                          {(device.reportedStatus === "needs_repair" || device.reportedStatus === "needs_maintenance") && (
                            <Wrench className="w-3 h-3" />
                          )}
                          {device.reportedStatus === "needs_repair"
                            ? "Needs repair"
                            : device.reportedStatus === "needs_maintenance"
                            ? "Needs maintenance"
                            : "OK"}
                        </span>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            disabled={reportingId === device._id}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {reportingId === device._id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              "Report…"
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenuItem onClick={() => handleReportStatus(device._id, "ok")}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            OK
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleReportStatus(device._id, "needs_maintenance")}>
                            <Wrench className="w-4 h-4 mr-2" />
                            Needs maintenance
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleReportStatus(device._id, "needs_repair")}>
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Needs repair
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  {/* Last Maintenance */}
                  {device.lastMaintenance && (
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="text-xs text-gray-600 flex items-center gap-2 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-green-500" />
                        Maintenance
                      </span>
                      <span className="text-xs font-semibold text-gray-900">
                        {new Date(device.lastMaintenance).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Device Detail Modal */}
      <DeviceDetailModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        device={selectedDevice}
      />
    </div>
  );
};

export default QCDevicesPage;

