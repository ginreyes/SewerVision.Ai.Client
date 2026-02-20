'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Monitor,
  MapPin,
  Battery,
  Wifi,
  Activity,
  Zap,
  HardDrive,
  AlertTriangle,
  Wrench,
  CheckCircle,
  Power,
  Loader2,
  Camera,
  Tablet,
  Settings,
  Calendar,
  Package,
  Link2,
  XCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Clock,
  Cpu,
  Tag,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { api } from '@/lib/helper';
import { devicesApi } from '@/data/devicesApi';
import { useUser } from '@/components/providers/UserContext';
import { useAlert } from '@/components/providers/AlertProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const getDeviceIcon = (type) => {
  switch ((type || '').toLowerCase()) {
    case 'camera':
    case 'cctv':
      return Camera;
    case 'tablet':
      return Tablet;
    default:
      return Monitor;
  }
};

const getStatusStyle = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'online':
    case 'ready':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'recording':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'maintenance':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

const getReportedStyle = (reportedStatus) => {
  switch (reportedStatus) {
    case 'needs_repair':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'needs_maintenance':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'ok':
      return 'bg-green-100 text-green-700 border-green-200';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

export default function OperatorDeviceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const deviceId = params?.deviceId;
  const { userId } = useUser() || {};
  const { showAlert } = useAlert();
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportingId, setReportingId] = useState(false);
  const [powerModalOpen, setPowerModalOpen] = useState(false);
  const [powerAction, setPowerAction] = useState(null);
  const [sendingPower, setSendingPower] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionReachable, setConnectionReachable] = useState(undefined);
  const [howToConnectOpen, setHowToConnectOpen] = useState(false);

  const fetchDevice = async () => {
    if (!deviceId || !userId) return;
    try {
      setLoading(true);
      const listRes = await api(`/api/devices/get-all-devices?operatorId=${userId}`, 'GET');
      const list = Array.isArray(listRes.data) ? listRes.data : listRes.data?.data ?? [];
      const allowed = list.some((d) => (d._id || d.id) === deviceId);
      if (!allowed) {
        setDevice(null);
        return;
      }
      const res = await devicesApi.getDeviceById(deviceId);
      const data = res?.data ?? res;
      if (data && (data._id || data.id)) setDevice(data);
      else setDevice(null);
    } catch (e) {
      console.error('Fetch device:', e);
      setDevice(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!deviceId || !userId) {
      setLoading(false);
      return;
    }
    fetchDevice();
  }, [deviceId, userId]);

  const handleReportStatus = async (reportedStatus) => {
    if (!deviceId || !userId) return;
    setReportingId(true);
    try {
      const res = await api(`/api/devices/${deviceId}/report-status`, 'PUT', {
        reportedStatus,
        reportedBy: userId,
      });
      if (res.ok) {
        const updated = res.data?.data ?? res.data;
        setDevice((d) => (d ? { ...d, reportedStatus: updated?.reportedStatus ?? reportedStatus } : d));
        showAlert('Device report updated', 'success');
      } else {
        showAlert(res.data?.message || 'Failed to report status', 'error');
      }
    } catch (e) {
      showAlert(e?.message || 'Failed to report status', 'error');
    } finally {
      setReportingId(false);
    }
  };

  const handlePowerCommand = async (action) => {
    setPowerAction(action);
    setSendingPower(true);
    try {
      await devicesApi.sendPowerCommand(deviceId, { action });
      showAlert(`${action} command sent to device.`, 'success');
      setPowerModalOpen(false);
    } catch (err) {
      showAlert(err?.message || 'Failed to send power command.', 'error');
    } finally {
      setSendingPower(false);
      setPowerAction(null);
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionReachable(undefined);
    try {
      const res = await devicesApi.testConnection(deviceId);
      setConnectionReachable(res.reachable === true);
      showAlert(res.reachable ? 'Device is reachable.' : 'Device did not respond.', res.reachable ? 'success' : 'warning');
    } catch (err) {
      setConnectionReachable(false);
      showAlert(err?.message || 'Connection test failed', 'error');
    } finally {
      setTestingConnection(false);
    }
  };

  if (!deviceId) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <p className="text-gray-500">No device specified.</p>
        <Button variant="link" className="mt-2" onClick={() => router.push('/operator/equipement')}>
          Back to My Equipment
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[40vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-500">Loading device...</p>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/operator/equipement" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to My Equipment
          </Link>
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Device not found</h3>
            <p className="text-sm text-gray-500">This device may not be assigned to you.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const Icon = getDeviceIcon(device.type);
  // Prefer device-sent (live) battery so "true" data from device is shown
  const batteryVal =
    device.liveBattery != null
      ? device.liveBattery
      : device.specifications?.battery != null
        ? typeof device.specifications.battery === 'number'
          ? device.specifications.battery
          : parseInt(String(device.specifications.battery).replace('%', ''), 10) || 0
        : null;
  const displaySerial = device.reportedSerialNumber ?? device.serialNumber;
  const displayModel = device.reportedModel ?? device.model;
  const displayManufacturer = device.reportedManufacturer ?? device.manufacturer;
  const displayMac = device.reportedMacAddress ?? device.macAddress;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/operator/equipement" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to My Equipment
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={() => fetchDevice()} disabled={loading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Power className="w-4 h-4" />
              Power Options
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setPowerModalOpen(true)}>
              <Zap className="w-4 h-4 mr-2" />
              Restart device
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPowerModalOpen(true)}>
              <Activity className="w-4 h-4 mr-2" />
              Standby
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPowerModalOpen(true)}>
              <Power className="w-4 h-4 mr-2" />
              Shutdown
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Header card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <Icon className="w-10 h-10" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900">{device.name || 'Unnamed Device'}</h1>
              <p className="text-sm text-gray-500 capitalize">{device.type}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge className={getStatusStyle(device.status)} variant="outline">
                  {device.status || 'Offline'}
                </Badge>
                {device.reportedStatus && (
                  <Badge className={getReportedStyle(device.reportedStatus)} variant="outline">
                    {device.reportedStatus === 'needs_repair'
                      ? 'Needs repair'
                      : device.reportedStatus === 'needs_maintenance'
                        ? 'Needs maintenance'
                        : 'OK'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Specs & location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                Location
              </span>
              <span className="text-sm font-medium text-gray-900">{device.location || '—'}</span>
            </div>
            <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-500" />
                Serial
              </span>
              <span className="text-sm font-mono font-medium text-gray-900">
                {displaySerial || '—'}
                {device.reportedSerialNumber && (
                  <span className="ml-1 text-xs text-green-600 font-normal">(from device)</span>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-gray-500" />
                Model
              </span>
              <span className="text-sm font-medium text-gray-900">
                {displayModel || '—'}
                {device.reportedModel && (
                  <span className="ml-1 text-xs text-green-600 font-normal">(from device)</span>
                )}
              </span>
            </div>
            {(displayManufacturer || device.manufacturer) && (
              <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Manufacturer</span>
                <span className="text-sm font-medium text-gray-900">
                  {displayManufacturer || '—'}
                  {device.reportedManufacturer && (
                    <span className="ml-1 text-xs text-green-600 font-normal">(from device)</span>
                  )}
                </span>
              </div>
            )}
            {device.ipAddress && (
              <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-gray-500" />
                  IP address
                </span>
                <span className="text-sm font-mono font-medium text-gray-900">{device.ipAddress}</span>
              </div>
            )}
            {(displayMac || device.macAddress) && (
              <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">MAC address</span>
                <span className="text-sm font-mono font-medium text-gray-900">
                  {displayMac || '—'}
                  {device.reportedMacAddress && (
                    <span className="ml-1 text-xs text-green-600 font-normal">(from device)</span>
                  )}
                </span>
              </div>
            )}
            {device.firmwareVersion && (
              <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-gray-500" />
                  Firmware
                </span>
                <span className="text-sm font-medium text-gray-900">{device.firmwareVersion}</span>
              </div>
            )}
            <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                Last seen
              </span>
              <span className="text-sm font-medium text-gray-900">{device.lastSeen || 'Never'}</span>
            </div>
            {(device.project?._id ?? device.project) && (
              <div className="flex items-center justify-between py-2 px-3 bg-blue-50 rounded-lg border border-blue-100">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Used in project
                </span>
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  onClick={() => router.push(`/operator/project?selectedProject=${device.project?._id ?? device.project}`)}
                >
                  {device.project?.name || 'View project'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Specs & status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <Battery className="w-4 h-4 text-gray-500" />
                Battery
              </span>
              <span className="text-sm font-medium text-gray-900">
                {batteryVal != null ? `${batteryVal}%` : device.specifications?.battery ?? '—'}
                {device.liveBattery != null && (
                  <span className="ml-1 text-xs text-green-600 font-normal">(from device)</span>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <Activity className="w-4 h-4 text-gray-500" />
                Resolution
              </span>
              <span className="text-sm font-medium text-gray-900">
                {device.specifications?.resolution || '—'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-gray-500" />
                Storage
              </span>
              <span className="text-sm font-medium text-gray-900">
                {device.specifications?.storage || '—'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional device data: connectivity, certifications, notes, tags, dates */}
      {(device.specifications?.connectivity?.length > 0 ||
        device.certifications ||
        device.notes ||
        (device.tags?.length > 0) ||
        device.dateAdded ||
        device.lastMaintenanceDate) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Additional info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {device.specifications?.connectivity?.length > 0 && (
              <div className="flex items-start justify-between gap-2 py-2 px-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600 flex items-center gap-2 shrink-0">
                  <Wifi className="w-4 h-4 text-gray-500" />
                  Connectivity
                </span>
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {device.specifications.connectivity.join(', ') || '—'}
                </span>
              </div>
            )}
            {device.certifications && (device.certifications.pacp || device.certifications.lacp || device.certifications.other) && (
              <div className="flex items-center gap-2 py-2 px-3 bg-gray-50 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-gray-500 shrink-0" />
                <span className="text-sm text-gray-600">Certifications:</span>
                <span className="text-sm font-medium text-gray-900">
                  {[device.certifications.pacp && 'PACP', device.certifications.lacp && 'LACP', device.certifications.other].filter(Boolean).join(', ') || '—'}
                </span>
              </div>
            )}
            {device.notes && (
              <div className="flex items-start gap-2 py-2 px-3 bg-gray-50 rounded-lg">
                <FileText className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm text-gray-600 block">Notes</span>
                  <span className="text-sm text-gray-900">{device.notes}</span>
                </div>
              </div>
            )}
            {device.tags?.length > 0 && (
              <div className="flex items-center gap-2 py-2 px-3 bg-gray-50 rounded-lg flex-wrap">
                <Tag className="w-4 h-4 text-gray-500 shrink-0" />
                <span className="text-sm text-gray-600">Tags:</span>
                {device.tags.map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                ))}
              </div>
            )}
            {(device.dateAdded || device.lastMaintenanceDate) && (
              <div className="flex flex-wrap gap-4 py-2 px-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                {device.dateAdded && (
                  <span>
                    <Clock className="w-4 h-4 inline mr-1 text-gray-500" />
                    Added: {new Date(device.dateAdded).toLocaleDateString()}
                  </span>
                )}
                {device.lastMaintenanceDate && (
                  <span>
                    <Wrench className="w-4 h-4 inline mr-1 text-gray-500" />
                    Last maintenance: {new Date(device.lastMaintenanceDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Data from device — when the device sends data (ingest or Send my status) */}
      {(device.liveUpdatedAt || device.liveBattery != null || device.liveSignal || device.liveStatus) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Data from device
            </CardTitle>
            <p className="text-xs text-gray-500 font-normal">
              Shows when this device last sent data (via the connection link, QR, or &quot;Send my status&quot;) and the values received.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {device.liveUpdatedAt && (
              <div className="flex items-center justify-between py-2 px-3 bg-green-50 rounded-lg border border-green-100">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Last data received
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(device.liveUpdatedAt).toLocaleString()}
                </span>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {device.liveBattery != null && (
                <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <span className="text-xs text-gray-600">Battery</span>
                  <span className="text-sm font-medium">{device.liveBattery}%</span>
                </div>
              )}
              {device.liveSignal && (
                <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <span className="text-xs text-gray-600">Signal</span>
                  <span className="text-sm font-medium capitalize">{device.liveSignal}</span>
                </div>
              )}
              {device.liveStatus && (
                <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <span className="text-xs text-gray-600">Status</span>
                  <span className="text-sm font-medium capitalize">{device.liveStatus}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connection — IP, test, how to connect */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Link2 className="w-4 h-4" />
            Connection
          </CardTitle>
          <p className="text-xs text-gray-500 font-normal">
            Device IP and connection test. Use Power Options above once the device is reachable.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">IP address</span>
              <span className="text-sm font-mono font-medium text-gray-900">
                {device.ipAddress || 'Not set — configure in Admin device settings'}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
              disabled={testingConnection}
            >
              {testingConnection ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Wifi className="w-4 h-4 mr-2" />
                  Test connection
                </>
              )}
            </Button>
            {connectionReachable === true && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                Reachable
              </Badge>
            )}
            {connectionReachable === false && (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                <XCircle className="w-3 h-3 mr-1" />
                Not reachable
              </Badge>
            )}
          </div>
          <div>
            <button
              type="button"
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              onClick={() => setHowToConnectOpen((o) => !o)}
            >
              {howToConnectOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              How to connect this device
            </button>
            {howToConnectOpen && (
              <ol className="mt-3 pl-5 space-y-2 text-sm text-gray-600 list-decimal">
                <li>Power on the device and ensure it is on the same network as this app.</li>
                <li>Ask an admin to set the device IP in Admin → Devices → device settings (Network/General).</li>
                <li>Use &quot;Test connection&quot; above. When it shows Reachable, Power Options will work.</li>
              </ol>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report device */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Report device
          </CardTitle>
          <p className="text-xs text-gray-500 font-normal">
            Mark this device as OK, needs maintenance, or needs repair.
          </p>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={device.reportedStatus === 'ok' ? 'default' : 'outline'}
            onClick={() => handleReportStatus('ok')}
            disabled={reportingId}
          >
            {reportingId ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3 mr-1" />}
            OK
          </Button>
          <Button
            size="sm"
            variant={device.reportedStatus === 'needs_maintenance' ? 'default' : 'outline'}
            className={device.reportedStatus === 'needs_maintenance' ? 'bg-amber-600 hover:bg-amber-700' : ''}
            onClick={() => handleReportStatus('needs_maintenance')}
            disabled={reportingId}
          >
            <Wrench className="w-3 h-3 mr-1" />
            Needs maintenance
          </Button>
          <Button
            size="sm"
            variant={device.reportedStatus === 'needs_repair' ? 'default' : 'outline'}
            className={device.reportedStatus === 'needs_repair' ? 'bg-red-600 hover:bg-red-700' : ''}
            onClick={() => handleReportStatus('needs_repair')}
            disabled={reportingId}
          >
            <AlertTriangle className="w-3 h-3 mr-1" />
            Needs repair
          </Button>
        </CardContent>
      </Card>

      {/* Power Options modal */}
      <Dialog open={powerModalOpen} onOpenChange={setPowerModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Power options</DialogTitle>
            <DialogDescription>
              Send a power command to <strong>{device.name}</strong>. The device must be online to receive the command.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            <Button
              variant="outline"
              className="justify-start gap-2"
              onClick={() => handlePowerCommand('Restart')}
              disabled={sendingPower}
            >
              {powerAction === 'Restart' && sendingPower ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              Restart device
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-2"
              onClick={() => handlePowerCommand('Standby')}
              disabled={sendingPower}
            >
              {powerAction === 'Standby' && sendingPower ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Activity className="w-4 h-4" />
              )}
              Standby
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => handlePowerCommand('Shutdown')}
              disabled={sendingPower}
            >
              {powerAction === 'Shutdown' && sendingPower ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Power className="w-4 h-4" />
              )}
              Shutdown
            </Button>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setPowerModalOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
