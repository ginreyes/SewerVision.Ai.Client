"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Monitor, Tablet, Camera, Wifi, CheckCircle, XCircle } from "lucide-react";
import { api } from "@/lib/helper";
import { useAlert } from "@/components/providers/AlertProvider";

const QCDevicesPage = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useAlert();

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const result = await api("/api/devices/get-all-devices", "GET");
      if (result.ok && result.data?.data) {
        setDevices(result.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching devices:", error);
      showAlert("Failed to load devices", "error");
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'camera':
      case 'cctv':
        return <Camera className="w-6 h-6" />;
      case 'tablet':
        return <Tablet className="w-6 h-6" />;
      case 'monitor':
      case 'console':
        return <Monitor className="w-6 h-6" />;
      default:
        return <Monitor className="w-6 h-6" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'online':
        return 'bg-green-100 text-green-800';
      case 'inactive':
      case 'offline':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Devices</h1>
        <p className="text-gray-600">View inspection devices and equipment</p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-gray-500">Loading devices...</div>
          </CardContent>
        </Card>
      ) : devices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No devices found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map((device) => (
            <Card key={device._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-rose-600">
                      {getDeviceIcon(device.type)}
                    </div>
                    <CardTitle className="text-lg">
                      {device.name || device.deviceName || "Unnamed Device"}
                    </CardTitle>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(device.status)}`}>
                    {device.status || "Unknown"}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">{device.type || "N/A"}</span>
                  </div>
                  {device.serialNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Serial:</span>
                      <span className="font-medium">{device.serialNumber}</span>
                    </div>
                  )}
                  {device.location && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">{device.location}</span>
                    </div>
                  )}
                  {device.lastMaintenance && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Maintenance:</span>
                      <span className="font-medium">
                        {new Date(device.lastMaintenance).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default QCDevicesPage;

