'use client';

import React, { useState, useMemo } from 'react';
import {
  Camera,
  Smartphone,
  Tablet,
  Plus,
  Search,
  Cloud,
  Settings,
  MapPin,
  Monitor,
  Truck,
  Loader2,
  User,
  Play,
  FileText,
  Brain,
  CheckCircle,
  Clock,
  Upload,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AddDeviceModal from './components/AddDeviceModal';
import ViewFootage from './components/ViewFotage';
import DeviceSettingsModal from './components/DeviceSettingModal';
import { useDevices } from '@/hooks/useQueryHooks';
import { useAlert } from '@/components/providers/AlertProvider';
import { getCookie } from '@/lib/helper';
import { devicesApi } from '@/data/devicesApi';

const getDeviceIcon = (type) => {
  const icons = {
    camera: Camera,
    tablet: Tablet,
    smartphone: Smartphone,
    console: Monitor,
    'ai-server': Brain,
    storage: Cloud,
    workstation: FileText,
    scanner: Smartphone,
    default: Monitor,
  };
  return icons[(type || '').toLowerCase()] || icons.default;
};

const getStatusColor = (status) => {
  const colors = {
    online: 'text-green-600',
    recording: 'text-red-600',
    processing: 'text-amber-600',
    uploading: 'text-blue-600',
    active: 'text-green-600',
    offline: 'text-gray-500',
    completed: 'text-purple-600',
  };
  return colors[status] || 'text-gray-500';
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'recording':
      return <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />;
    case 'processing':
      return <Clock className="w-4 h-4 text-amber-500 animate-spin" />;
    case 'uploading':
      return <Upload className="w-4 h-4 text-blue-500" />;
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-purple-500" />;
    case 'online':
    case 'active':
      return <div className="w-2 h-2 bg-green-500 rounded-full" />;
    default:
      return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
  }
};

/** Format lastSeen for display: "Never", "2 min ago", "1 hour ago", or date */
function formatLastSeen(lastSeen) {
  if (!lastSeen || lastSeen === 'Never') return 'Never';
  try {
    const d = new Date(lastSeen);
    if (Number.isNaN(d.getTime())) return lastSeen;
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} h ago`;
    if (diffDays < 7) return `${diffDays} d ago`;
    return d.toLocaleDateString();
  } catch {
    return lastSeen;
  }
}

const colorByType = {
  camera: 'bg-gradient-to-br from-blue-500 to-purple-600',
  tablet: 'bg-gradient-to-br from-green-500 to-emerald-600',
  smartphone: 'bg-gradient-to-br from-gray-500 to-gray-700',
  console: 'bg-gradient-to-br from-orange-500 to-red-600',
  'ai-server': 'bg-gradient-to-br from-purple-500 to-pink-600',
  storage: 'bg-gradient-to-br from-blue-500 to-cyan-600',
  workstation: 'bg-gradient-to-br from-indigo-500 to-blue-600',
  default: 'bg-gradient-to-br from-gray-400 to-gray-600',
};

function teamLeaderLabel(device) {
  const tl = device.teamLeader;
  if (!tl) return 'Unassigned';
  if (typeof tl === 'object') {
    return [tl.first_name, tl.last_name].filter(Boolean).join(' ') || tl.username || 'Team Leader';
  }
  return 'Unassigned';
}

const Devices = () => {
  const { showAlert } = useAlert();
  const { data: devicesList = [], isLoading, isError, refetch } = useDevices();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('field');
  const [showModal, setShowModal] = useState(false);
  const [currentView, setCurrentView] = useState('devices');
  const [selectedFootageDevice, setSelectedFootageDevice] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedSettingsDevice, setSelectedSettingsDevice] = useState(null);
  const [deviceToDelete, setDeviceToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const role = (typeof window !== 'undefined' ? getCookie('role') : '') || '';
  const canDeleteDevice = role?.toLowerCase() === 'admin' || role?.toLowerCase() === 'user';

  const enrichedDevices = useMemo(() => {
    const list = Array.isArray(devicesList) ? devicesList : [];
    return list.map((d) => {
      const type = (d.type || '').toLowerCase();
      return {
        ...d,
        id: d._id,
        color: colorByType[type] || colorByType.default,
        icon: getDeviceIcon(type),
        teamLeaderLabel: teamLeaderLabel(d),
        battery: d.category === 'field' ? null : null,
        hasFootage: false,
      };
    });
  }, [devicesList]);

  const fieldDevices = useMemo(
    () => enrichedDevices.filter((d) => d.category === 'field'),
    [enrichedDevices]
  );
  const cloudDevices = useMemo(
    () => enrichedDevices.filter((d) => d.category === 'cloud'),
    [enrichedDevices]
  );

  const currentList = activeTab === 'field' ? fieldDevices : cloudDevices;
  const filteredDevices = useMemo(() => {
    return currentList.filter((d) => {
      const matchSearch =
        (d.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.serialNumber || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = filterStatus === 'all' || (d.status || '') === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [currentList, searchQuery, filterStatus]);

  const handleViewFootage = (device) => {
    if (device.hasFootage) {
      setSelectedFootageDevice(device);
      setCurrentView('footage');
    } else {
      showAlert('No footage available for this device', 'info');
    }
  };

  const handleBackToDevices = () => {
    setCurrentView('devices');
    setSelectedFootageDevice(null);
  };

  const handleOpenSettings = (device) => {
    setSelectedSettingsDevice(device);
    setShowSettingsModal(true);
  };

  const handleAddSuccess = () => {
    refetch();
    showAlert('Device added successfully', 'success');
  };

  const handleDeleteClick = (e, device) => {
    e.stopPropagation();
    setDeviceToDelete(device);
  };

  const handleDeleteConfirm = async () => {
    if (!deviceToDelete?._id) return;
    setDeleting(true);
    try {
      await devicesApi.deleteDevice(deviceToDelete._id);
      showAlert('Device deleted', 'success');
      refetch();
      setDeviceToDelete(null);
    } catch (err) {
      showAlert(err?.message || 'Failed to delete device', 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (currentView === 'footage' && selectedFootageDevice) {
    return (
      <ViewFootage
        deviceId={selectedFootageDevice.id}
        footageId={selectedFootageDevice.footageId || 'default'}
        deviceName={selectedFootageDevice.name}
        onBack={handleBackToDevices}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Devices</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Manage field and cloud devices. Assign team leaders to assign devices to QC and operators.
                {!canDeleteDevice && (
                  <span className="block mt-1 text-amber-600">
                    Only admin and team leaders can delete devices. Operators and QC need admin permission to use a device.
                  </span>
                )}
              </p>
            </div>
            <Button onClick={() => setShowModal(true)} className="shrink-0" variant="rose">
              <Plus className="w-4 h-4 mr-2" />
              Add Device
            </Button>
          </div>
        </div>
      </div>

      <AddDeviceModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAddDevice={() => {}}
        onSuccess={handleAddSuccess}
      />

      <DeviceSettingsModal
        isOpen={showSettingsModal}
        onClose={() => { setShowSettingsModal(false); setSelectedSettingsDevice(null); }}
        device={selectedSettingsDevice}
        onSaved={() => refetch()}
      />

      {/* Delete device confirmation — only for admin/user; informs assigned team leader */}
      <Dialog open={!!deviceToDelete} onOpenChange={(open) => !open && setDeviceToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Delete device
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2">
                <p>
                  This will permanently remove <strong>{deviceToDelete?.name}</strong> from Concertina. All data for this device will be removed. This action cannot be undone.
                </p>
                {deviceToDelete?.teamLeader && (
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                    <p className="font-medium">Assigned team leader</p>
                    <p className="mt-0.5">
                      This device is assigned to{' '}
                      <strong>
                        {typeof deviceToDelete.teamLeader === 'object'
                          ? [deviceToDelete.teamLeader.first_name, deviceToDelete.teamLeader.last_name].filter(Boolean).join(' ') || deviceToDelete.teamLeader.username || 'Team Leader'
                          : 'a team leader'}
                      </strong>
                      . They will no longer have access to this device after it is deleted.
                    </p>
                  </div>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeviceToDelete(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleting}>
              {deleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Delete device
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex rounded-lg border border-gray-200 bg-white overflow-hidden flex-1">
            <Search className="w-4 h-4 text-gray-400 ml-3 self-center" />
            <input
              type="text"
              placeholder="Search by name, type, or serial..."
              className="flex-1 py-2 px-3 text-sm border-0 focus:ring-0 focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <div className="flex rounded-lg border border-gray-200 bg-white p-1">
              <button
                type="button"
                onClick={() => setActiveTab('field')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${activeTab === 'field' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Truck className="w-4 h-4 inline mr-1.5" />
                Field
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('cloud')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${activeTab === 'cloud' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Cloud className="w-4 h-4 inline mr-1.5" />
                Cloud
              </button>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
            >
              <option value="all">All status</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="processing">Processing</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-500">Loading devices...</span>
          </div>
        ) : isError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-700">
            Failed to load devices. <Button variant="outline" size="sm" className="ml-2" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : filteredDevices.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-10 text-center text-gray-500">
            No devices found. Add a device to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredDevices.map((device) => {
              const Icon = device.icon;
              return (
                <div
                  key={device._id}
                  className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handleOpenSettings(device)}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className={`p-2 rounded-lg ${device.color} text-white shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0">
                        {getStatusIcon(device.status)}
                        <span className={`text-xs font-medium truncate ${getStatusColor(device.status)}`}>
                          {(device.status || 'offline').charAt(0).toUpperCase() + (device.status || 'offline').slice(1)}
                        </span>
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 mt-3 truncate">{device.name}</h3>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                        <span className="truncate">{device.location || '—'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                        <span className="truncate">{device.teamLeaderLabel}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>Last seen: {formatLastSeen(device.lastSeen)}</span>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 min-w-0"
                        onClick={(e) => { e.stopPropagation(); handleOpenSettings(device); }}
                      >
                        <Settings className="w-4 h-4 mr-1" />
                        Settings
                      </Button>
                      {device.category === 'field' && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!device.hasFootage}
                          onClick={(e) => { e.stopPropagation(); handleViewFootage(device); }}
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                      {canDeleteDevice && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                          onClick={(e) => handleDeleteClick(e, device)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Devices;
