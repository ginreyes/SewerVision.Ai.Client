'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Plus, Loader2, RefreshCw, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AddDeviceModal,
  ViewFootage,
  DeviceSettingsModal,
  DeviceCard,
  DeviceToolbar,
  DeviceStatsGrid,
  DeviceDeleteDialog,
} from '@/components/admin/device';
import { useDevices } from '@/hooks/useQueryHooks';
import { useAlert } from '@/components/providers/AlertProvider';
import { getCookie } from '@/lib/helper';
import { devicesApi } from '@/data/devicesApi';
import { SavedViewsDropdown, useSavedViewSync } from '@/components/shared/SavedViews';
import ExportButton from '@/components/shared/ExportButton';
import { BulkActionBar } from '@/components/shared/bulk';
import { useBulkMutation } from '@/data/bulkApi';

const Devices = () => {
  const { showAlert } = useAlert();
  const { data: devicesList = [], isLoading, isError, refetch, isFetching } = useDevices();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('field');
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentView, setCurrentView] = useState('devices');
  const [selectedFootageDevice, setSelectedFootageDevice] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedSettingsDevice, setSelectedSettingsDevice] = useState(null);
  const [deviceToDelete, setDeviceToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const role = typeof window !== 'undefined' ? getCookie('role') : '';
  const canManageDevices =
    role?.toLowerCase() === 'admin' || role?.toLowerCase() === 'user';

  const bulk = useBulkMutation('device');

  const enrichedDevices = useMemo(() => {
    const list = Array.isArray(devicesList) ? devicesList : [];
    return list.map((d) => ({
      ...d,
      id: d._id,
      hasFootage: false,
    }));
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
    const q = searchQuery.trim().toLowerCase();
    return currentList.filter((d) => {
      const matchSearch =
        !q ||
        (d.name || '').toLowerCase().includes(q) ||
        (d.type || '').toLowerCase().includes(q) ||
        (d.serialNumber || '').toLowerCase().includes(q);
      const matchStatus = filterStatus === 'all' || (d.status || '') === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [currentList, searchQuery, filterStatus]);

  // ─── Saved Views sync ────────────────────────────────────────────
  const captureFilters = useCallback(
    () => ({
      searchQuery,
      filterStatus,
      activeTab,
    }),
    [searchQuery, filterStatus, activeTab]
  );

  const applyFilters = useCallback((filters) => {
    if (filters.searchQuery !== undefined) setSearchQuery(filters.searchQuery || '');
    if (filters.filterStatus !== undefined) setFilterStatus(filters.filterStatus || 'all');
    if (filters.activeTab !== undefined) setActiveTab(filters.activeTab || 'field');
  }, []);

  const { activeViewId, applyView, clearView, snapshot } = useSavedViewSync({
    applyFilters,
    captureFilters,
  });

  // ─── Selection ───────────────────────────────────────────────────
  const toggleDeviceSelect = (device, checked) => {
    setSelectedIds((prev) =>
      checked ? Array.from(new Set([...prev, device._id])) : prev.filter((id) => id !== device._id)
    );
  };
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const clearSelection = () => setSelectedIds([]);

  // ─── Handlers ────────────────────────────────────────────────────
  const handleViewFootage = (device) => {
    if (device.hasFootage) {
      setSelectedFootageDevice(device);
      setCurrentView('footage');
    } else {
      showAlert('No footage available for this device', 'info');
    }
  };

  const handleOpenSettings = (device) => {
    setSelectedSettingsDevice(device);
    setShowSettingsModal(true);
  };

  const handleAddSuccess = () => {
    refetch();
    showAlert('Device added successfully', 'success');
  };

  const handleDeleteConfirm = async () => {
    if (!deviceToDelete?._id) return;
    setDeleting(true);
    try {
      await devicesApi.deleteDevice(deviceToDelete._id);
      showAlert('Device deleted', 'success');
      refetch();
      setSelectedIds((prev) => prev.filter((id) => id !== deviceToDelete._id));
      setDeviceToDelete(null);
    } catch (err) {
      showAlert(err?.message || 'Failed to delete device', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkAction = async (op) => {
    if (!selectedIds.length) return;

    if (op === 'export') {
      // handled client-side by the ExportButton beside the bar — noop here
      return;
    }

    if (op === 'delete') {
      const ok =
        typeof window !== 'undefined'
          ? window.confirm(`Delete ${selectedIds.length} device(s)? This cannot be undone.`)
          : true;
      if (!ok) return;
    }

    let payload = {};
    if (op === 'status') {
      const newStatus = typeof window !== 'undefined'
        ? window.prompt('Set status to (online / offline / processing / uploading / recording):', 'offline')
        : null;
      if (!newStatus) return;
      payload = { status: newStatus.trim().toLowerCase() };
    }

    bulk.mutate(
      { ids: selectedIds, op, payload },
      {
        onSuccess: (res) => {
          const count = res?.succeeded?.length ?? selectedIds.length;
          showAlert(`Bulk ${op} applied to ${count} device(s)`, 'success');
          clearSelection();
          refetch();
        },
        onError: (err) => showAlert(err?.message || 'Bulk action failed', 'error'),
      }
    );
  };

  // ─── Export shape ────────────────────────────────────────────────
  const exportColumns = [
    { key: 'name', label: 'Name' },
    { key: 'type', label: 'Type' },
    { key: 'serialNumber', label: 'Serial' },
    { key: 'category', label: 'Category' },
    { key: 'status', label: 'Status' },
    { key: 'location', label: 'Location' },
    { key: 'teamLeaderLabel', label: 'Team Leader' },
    { key: 'lastSeen', label: 'Last Seen' },
  ];
  const exportRows = useMemo(
    () =>
      filteredDevices.map((d) => ({
        name: d.name || '',
        type: d.type || '',
        serialNumber: d.serialNumber || '',
        category: d.category || '',
        status: d.status || 'offline',
        location: d.location || '',
        teamLeaderLabel:
          d.teamLeader && typeof d.teamLeader === 'object'
            ? [d.teamLeader.first_name, d.teamLeader.last_name].filter(Boolean).join(' ') ||
              d.teamLeader.username ||
              ''
            : '',
        lastSeen: d.lastSeen || '',
      })),
    [filteredDevices]
  );

  if (currentView === 'footage' && selectedFootageDevice) {
    return (
      <ViewFootage
        deviceId={selectedFootageDevice.id}
        footageId={selectedFootageDevice.footageId || 'default'}
        deviceName={selectedFootageDevice.name}
        onBack={() => {
          setCurrentView('devices');
          setSelectedFootageDevice(null);
        }}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-500/15 flex items-center justify-center flex-shrink-0">
                <Monitor className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Devices</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Manage field and cloud devices. Assign team leaders to delegate to QC and operators.
                  {!canManageDevices && (
                    <span className="block mt-1 text-amber-600 dark:text-amber-400">
                      Only admin and team leaders can delete devices.
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <SavedViewsDropdown
                entityType="device"
                activeViewId={activeViewId}
                onApply={applyView}
                onClear={clearView}
                snapshotFilters={snapshot}
                accentColor="rose"
              />
              <Button
                onClick={() => refetch()}
                disabled={isFetching}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                {isFetching ? 'Refreshing…' : 'Refresh'}
              </Button>
              <ExportButton
                data={exportRows}
                columns={exportColumns}
                filename="devices"
                label="Export"
              />
              <Button onClick={() => setShowAddModal(true)} className="shrink-0" variant="rose">
                <Plus className="w-4 h-4 mr-2" />
                Add Device
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AddDeviceModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddDevice={() => {}}
        onSuccess={handleAddSuccess}
      />

      <DeviceSettingsModal
        isOpen={showSettingsModal}
        onClose={() => {
          setShowSettingsModal(false);
          setSelectedSettingsDevice(null);
        }}
        device={selectedSettingsDevice}
        onSaved={() => refetch()}
      />

      <DeviceDeleteDialog
        device={deviceToDelete}
        open={!!deviceToDelete}
        onOpenChange={(open) => !open && setDeviceToDelete(null)}
        onConfirm={handleDeleteConfirm}
        deleting={deleting}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        <DeviceStatsGrid devices={enrichedDevices} />

        <DeviceToolbar
          search={searchQuery}
          onSearchChange={setSearchQuery}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          filterStatus={filterStatus}
          onStatusChange={setFilterStatus}
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
            <span className="ml-3 text-gray-500 dark:text-gray-400">Loading devices...</span>
          </div>
        ) : isError ? (
          <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-4 text-center text-red-700 dark:text-red-300">
            Failed to load devices.
            <Button variant="outline" size="sm" className="ml-2" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : filteredDevices.length === 0 ? (
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-10 text-center text-gray-500 dark:text-gray-400">
            No devices found. Add a device or adjust your filters to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredDevices.map((device) => (
              <DeviceCard
                key={device._id}
                device={device}
                selected={selectedSet.has(device._id)}
                selectable={canManageDevices}
                onToggleSelect={toggleDeviceSelect}
                onOpenSettings={handleOpenSettings}
                onViewFootage={handleViewFootage}
                onDelete={setDeviceToDelete}
                canDelete={canManageDevices}
              />
            ))}
          </div>
        )}
      </div>

      <BulkActionBar
        entity="device"
        selectedCount={selectedIds.length}
        onAction={handleBulkAction}
        onClear={clearSelection}
        isPending={bulk.isPending}
        accent="rose"
      />
    </div>
  );
};

export default Devices;
