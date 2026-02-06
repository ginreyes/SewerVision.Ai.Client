'use client';

import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Monitor,
  Camera,
  Tablet,
  HardDrive,
  Activity,
  MapPin,
  Calendar,
  Zap,
  CheckCircle,
  XCircle,
  Settings,
  Wifi,
  Battery,
  Package,
  Shield,
  Info,
  User
} from 'lucide-react';

const DeviceDetailModal = ({ isOpen, onClose, device }) => {
  if (!device) return null;

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

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

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'online':
        return {
          color: 'bg-green-100 text-green-700 border-green-200',
          icon: CheckCircle,
          iconColor: 'text-green-500'
        };
      case 'inactive':
      case 'offline':
        return {
          color: 'bg-red-100 text-red-700 border-red-200',
          icon: XCircle,
          iconColor: 'text-red-500'
        };
      case 'maintenance':
        return {
          color: 'bg-amber-100 text-amber-700 border-amber-200',
          icon: Settings,
          iconColor: 'text-amber-500'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-700 border-gray-200',
          icon: Info,
          iconColor: 'text-gray-500'
        };
    }
  };

  const DeviceIcon = getDeviceIcon(device.type);
  const statusConfig = getStatusConfig(device.status);
  const StatusIcon = statusConfig.icon;

  const InfoRow = ({ icon: Icon, label, value, iconColor = "text-gray-500" }) => (
    <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-3">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <span className="text-sm font-semibold text-gray-900">{value || 'N/A'}</span>
    </div>
  );

  const SectionTitle = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-5 h-5 text-rose-500" />
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Device Details</DialogTitle>
        </DialogHeader>

        {/* Device Header with Image */}
        <div className="relative">
          {/* Device Image */}
          <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl overflow-hidden mb-6">
            {device.image || device.imageFileId ? (
              <img 
                src={`${API_URL}/api/devices/${device._id}/image`}
                alt={device.name || "Device"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className={`${device.image || device.imageFileId ? 'hidden' : 'flex'} absolute inset-0 items-center justify-center bg-gradient-to-br from-rose-50 to-purple-50`}
            >
              <div className="p-8 bg-white rounded-3xl shadow-lg">
                <DeviceIcon className="w-16 h-16 text-rose-500" />
              </div>
            </div>
            
            {/* Status Badge Overlay */}
            <div className="absolute top-4 right-4">
              <Badge className={`px-4 py-2 text-sm font-semibold shadow-lg backdrop-blur-sm border ${statusConfig.color} flex items-center gap-2`}>
                <StatusIcon className={`w-4 h-4 ${statusConfig.iconColor}`} />
                {device.status || "Unknown"}
              </Badge>
            </div>
          </div>

          {/* Device Title */}
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl shadow-md">
              <DeviceIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {device.name || device.deviceName || "Unnamed Device"}
              </h2>
              <p className="text-sm text-gray-500">
                {device.model || device.type} • {device.manufacturer || 'Unknown Manufacturer'}
              </p>
            </div>
          </div>
        </div>

        {/* Device Information Sections */}
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardContent className="pt-6">
              <SectionTitle icon={Info} title="Basic Information" />
              <div className="space-y-2">
                <InfoRow 
                  icon={Activity} 
                  label="Device Type" 
                  value={device.type}
                  iconColor="text-rose-500"
                />
                <InfoRow 
                  icon={Package} 
                  label="Category" 
                  value={device.category ? device.category.charAt(0).toUpperCase() + device.category.slice(1) : 'N/A'}
                  iconColor="text-purple-500"
                />
                <InfoRow 
                  icon={MapPin} 
                  label="Location" 
                  value={device.location}
                  iconColor="text-blue-500"
                />
                {device.operator && (
                  <InfoRow 
                    icon={User} 
                    label="Operator" 
                    value={device.operator.name || `${device.operator.first_name || ''} ${device.operator.last_name || ''}`.trim() || 'N/A'}
                    iconColor="text-indigo-500"
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Technical Specifications */}
          <Card>
            <CardContent className="pt-6">
              <SectionTitle icon={Settings} title="Technical Specifications" />
              <div className="space-y-2">
                <InfoRow 
                  icon={Zap} 
                  label="Serial Number" 
                  value={device.serialNumber}
                  iconColor="text-amber-500"
                />
                <InfoRow 
                  icon={Package} 
                  label="Model" 
                  value={device.model}
                  iconColor="text-orange-500"
                />
                <InfoRow 
                  icon={HardDrive} 
                  label="Manufacturer" 
                  value={device.manufacturer}
                  iconColor="text-purple-500"
                />
                {device.macAddress && (
                  <InfoRow 
                    icon={Wifi} 
                    label="MAC Address" 
                    value={device.macAddress}
                    iconColor="text-cyan-500"
                  />
                )}
                {device.ipAddress && (
                  <InfoRow 
                    icon={Wifi} 
                    label="IP Address" 
                    value={device.ipAddress}
                    iconColor="text-blue-500"
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Specifications (if available) */}
          {device.specifications && Object.keys(device.specifications).length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <SectionTitle icon={Monitor} title="Device Specifications" />
                <div className="space-y-2">
                  {device.specifications.resolution && (
                    <InfoRow 
                      icon={Monitor} 
                      label="Resolution" 
                      value={device.specifications.resolution}
                      iconColor="text-indigo-500"
                    />
                  )}
                  {device.specifications.storage && (
                    <InfoRow 
                      icon={HardDrive} 
                      label="Storage" 
                      value={device.specifications.storage}
                      iconColor="text-purple-500"
                    />
                  )}
                  {device.specifications.battery && (
                    <InfoRow 
                      icon={Battery} 
                      label="Battery Life" 
                      value={device.specifications.battery}
                      iconColor="text-green-500"
                    />
                  )}
                  {device.specifications.connectivity && device.specifications.connectivity.length > 0 && (
                    <div className="py-3 px-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <Wifi className="w-4 h-4 text-cyan-500" />
                        <span className="text-sm font-medium text-gray-700">Connectivity</span>
                      </div>
                      <div className="flex flex-wrap gap-2 ml-7">
                        {device.specifications.connectivity.map((conn, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {conn.toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Certifications (if available) */}
          {device.certifications && (device.certifications.pacp || device.certifications.lacp || device.certifications.other) && (
            <Card>
              <CardContent className="pt-6">
                <SectionTitle icon={Shield} title="Certifications" />
                <div className="flex flex-wrap gap-2">
                  {device.certifications.pacp && (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      PACP Certified
                    </Badge>
                  )}
                  {device.certifications.lacp && (
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      LACP Certified
                    </Badge>
                  )}
                  {device.certifications.other && (
                    <Badge variant="outline">
                      {device.certifications.other}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Maintenance & Status */}
          <Card>
            <CardContent className="pt-6">
              <SectionTitle icon={Calendar} title="Maintenance & Status" />
              <div className="space-y-2">
                {device.lastMaintenance && (
                  <InfoRow 
                    icon={Calendar} 
                    label="Last Maintenance" 
                    value={new Date(device.lastMaintenance).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                    iconColor="text-green-500"
                  />
                )}
                {device.dateAdded && (
                  <InfoRow 
                    icon={Calendar} 
                    label="Date Added" 
                    value={new Date(device.dateAdded).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                    iconColor="text-blue-500"
                  />
                )}
                {device.lastSeen && (
                  <InfoRow 
                    icon={Activity} 
                    label="Last Seen" 
                    value={device.lastSeen}
                    iconColor="text-orange-500"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeviceDetailModal;
