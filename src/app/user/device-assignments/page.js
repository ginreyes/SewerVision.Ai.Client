'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Monitor,
  User,
  Users,
  UserCheck,
  Search,
  Wifi,
  WifiOff,
  Wrench,
  ChevronRight,
  Save,
  X,
  Cpu,
  MapPin,
  Hash,
  Activity,
  Loader2,
  CheckSquare,
  Square,
} from 'lucide-react';
import { useAlert } from '@/components/providers/AlertProvider';
import { useUser } from '@/components/providers/UserContext';
import { useUserDevices, useUserTeamMembers, useUpdateDeviceAssignment } from '@/hooks/useQueryHooks';
import { DEVICE_STATUS_CONFIG } from '@/components/user/constants';
import PersonBadge from '@/components/user/device-assignments/PersonBadge';
import AssignmentSelector from '@/components/user/device-assignments/AssignmentSelector';
import BulkDeviceStatusModal from '@/components/user/device-assignments/BulkDeviceStatusModal';
import { BulkActionBar, BulkResultToast } from '@/components/shared/bulk';
import { useBulkMutation } from '@/data/bulkApi';
import { exportToExcel } from '@/lib/csvExport';

// Team-lead role can hit status/unassign/export — `delete` is admin-only
// (also enforced server-side in bulkDeviceAction).
const TEAM_LEAD_DEVICE_OPS = new Set(['status', 'unassign', 'export']);

const STATUS_ICONS = { online: Wifi, offline: WifiOff, maintenance: Wrench, decommissioned: WifiOff };

const getStatusConfig = (status) => {
  const cfg = DEVICE_STATUS_CONFIG[status] || DEVICE_STATUS_CONFIG.offline;
  return { ...cfg, icon: STATUS_ICONS[status] || STATUS_ICONS.offline };
};

export default function UserDeviceAssignmentsPage() {
  const { showAlert } = useAlert();
  const { userId, userData } = useUser() || {};

  const [expandedDeviceId, setExpandedDeviceId] = useState(null);
  const [selectedOperatorId, setSelectedOperatorId] = useState('');
  const [selectedQcId, setSelectedQcId] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // ── Bulk-mode state ──
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkModal, setBulkModal] = useState(null); // 'status' | null
  const [bulkResult, setBulkResult] = useState(null);

  // ── Data fetching via TanStack Query ──
  const { data: devices = [], isLoading: loading, refetch } = useUserDevices(userId, userData?.role);
  const { data: allUsers = [], isLoading: loadingUsers } = useUserTeamMembers();
  const updateAssignmentMutation = useUpdateDeviceAssignment();
  const savingAssignment = updateAssignmentMutation.isPending;
  const bulk = useBulkMutation('device');

  const operators = useMemo(() => {
    let ops = allUsers.filter((u) => u.role === 'operator');
    if (userData?.role === 'user' && Array.isArray(userData.managedMembers) && userData.managedMembers.length > 0) {
      const managedIds = new Set(userData.managedMembers.map((id) => String(id)));
      ops = ops.filter((u) => u._id && managedIds.has(String(u._id)));
    }
    return ops;
  }, [allUsers, userData?.role, userData?.managedMembers]);

  const qcTechnicians = useMemo(() => {
    let qcs = allUsers.filter((u) => u.role === 'qc-technician');
    if (userData?.role === 'user' && Array.isArray(userData.managedMembers) && userData.managedMembers.length > 0) {
      const managedIds = new Set(userData.managedMembers.map((id) => String(id)));
      qcs = qcs.filter((u) => u._id && managedIds.has(String(u._id)));
    }
    return qcs;
  }, [allUsers, userData?.role, userData?.managedMembers]);

  /* ──────────── derived / filtered ──────────── */

  const filteredDevices = useMemo(() => {
    let result = devices;
    if (statusFilter !== 'all') {
      result = result.filter((d) => d.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          (d.name || d.deviceName || '').toLowerCase().includes(q) ||
          (d.serialNumber || '').toLowerCase().includes(q) ||
          (d.location || '').toLowerCase().includes(q) ||
          (d.manufacturer || '').toLowerCase().includes(q),
      );
    }
    return result;
  }, [devices, statusFilter, searchQuery]);

  const statusCounts = useMemo(() => {
    const counts = { all: devices.length, online: 0, offline: 0, maintenance: 0, decommissioned: 0 };
    devices.forEach((d) => {
      if (counts[d.status] !== undefined) counts[d.status]++;
    });
    return counts;
  }, [devices]);

  const openDevice = (device) => {
    if (selectMode) {
      toggleSelect(device._id);
      return;
    }
    if (expandedDeviceId === device._id) {
      setExpandedDeviceId(null);
      return;
    }
    setExpandedDeviceId(device._id);
    const opId =
      device.operator?._id ?? (typeof device.operator === 'string' ? device.operator : '');
    const qcId =
      device.qcTechnician?._id ??
      (typeof device.qcTechnician === 'string' ? device.qcTechnician : '');
    setSelectedOperatorId(opId || '');
    setSelectedQcId(qcId || '');
  };

  const handleSaveAssignments = () => {
    const device = devices.find((d) => d._id === expandedDeviceId);
    if (!device) return;
    updateAssignmentMutation.mutate(
      {
        deviceId: device._id,
        assignments: {
          operator: selectedOperatorId || null,
          qcTechnician: selectedQcId || null,
        },
      },
      {
        onSuccess: () => {
          setExpandedDeviceId(null);
          showAlert('Device assignments updated', 'success');
        },
        onError: (err) => {
          showAlert(err?.message || 'Failed to update assignments', 'error');
        },
      }
    );
  };

  /* ──────────── bulk selection ──────────── */

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const clearSelection = useCallback(() => setSelectedIds([]), []);

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const enterSelectMode = () => {
    setExpandedDeviceId(null);
    setSelectMode(true);
  };
  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds([]);
  };

  // Esc clears selection then exits select-mode (matches admin/project pattern).
  useEffect(() => {
    if (!selectMode) return;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (selectedIds.length > 0) clearSelection();
      else exitSelectMode();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectMode, selectedIds.length, clearSelection]);

  const runBulk = (op, payload) => {
    bulk.mutate(
      { ids: selectedIds, op, payload },
      {
        onSuccess: (result) => {
          setBulkResult(result);
          setBulkModal(null);
          setSelectedIds([]);
          refetch();
        },
        onError: (err) => showAlert(err?.message || 'Bulk operation failed', 'error'),
      }
    );
  };

  const handleBulkExport = () => {
    const selected = devices.filter((d) => selectedSet.has(d._id));
    if (selected.length === 0) return;
    exportToExcel(
      selected,
      [
        { key: 'name', label: 'Name', format: (v, r) => v || r.deviceName || '' },
        { key: 'serialNumber', label: 'Serial' },
        { key: 'manufacturer', label: 'Manufacturer' },
        { key: 'model', label: 'Model' },
        { key: 'status', label: 'Status' },
        { key: 'location', label: 'Location' },
        {
          key: 'operator',
          label: 'Operator',
          format: (v) => (v ? [v.first_name, v.last_name].filter(Boolean).join(' ').trim() || v.username || '' : ''),
        },
        {
          key: 'qcTechnician',
          label: 'QC Technician',
          format: (v) => (v ? [v.first_name, v.last_name].filter(Boolean).join(' ').trim() || v.username || '' : ''),
        },
      ],
      'team-devices'
    );
    showAlert(`Exported ${selected.length} device${selected.length === 1 ? '' : 's'}`, 'success');
  };

  const handleBulkAction = (op, action) => {
    if (action?.clientOnly && op === 'export') {
      handleBulkExport();
      return;
    }
    if (op === 'status') {
      setBulkModal('status');
      return;
    }
    runBulk(op);
  };

  /* ──────────── render ──────────── */

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 pb-32">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Device Assignments
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Assign operators and QC technicians to your fleet
            </p>
          </div>
        </div>

        {/* status pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {['all', 'online', 'offline', 'maintenance'].map((key) => {
            const isActive = statusFilter === key;
            const cfg = key === 'all' ? null : getStatusConfig(key);
            return (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`
                  inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                  transition-all duration-200 border
                  ${
                    isActive
                      ? key === 'all'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : `${cfg.badge} border-current shadow-sm`
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700'
                  }
                `}
              >
                {cfg && (
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.color}`} />
                )}
                <span className="capitalize">{key}</span>
                <span className={`${isActive ? 'opacity-70' : 'opacity-50'}`}>
                  {statusCounts[key]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Search + Select toggle ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search devices by name, serial, location, or manufacturer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-white border-slate-200 text-sm shadow-sm focus-visible:ring-indigo-500"
          />
        </div>
        <Button
          variant={selectMode ? 'default' : 'outline'}
          onClick={selectMode ? exitSelectMode : enterSelectMode}
          className="h-11 gap-2 text-sm"
        >
          {selectMode ? (
            <>
              <Square className="w-4 h-4" />
              Exit selection
            </>
          ) : (
            <>
              <CheckSquare className="w-4 h-4" />
              Select devices
            </>
          )}
        </Button>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-sm font-medium">Loading devices...</span>
        </div>
      ) : filteredDevices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <Monitor className="w-10 h-10 opacity-40" />
          <span className="text-sm font-medium">
            {devices.length === 0
              ? 'No devices found'
              : 'No devices match your filters'}
          </span>
          {(searchQuery || statusFilter !== 'all') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredDevices.map((d) => {
            const isExpanded = !selectMode && expandedDeviceId === d._id;
            const isSelected = selectMode && selectedSet.has(d._id);
            const statusCfg = getStatusConfig(d.status);
            const StatusIcon = statusCfg.icon;

            return (
              <div
                key={d._id}
                onClick={() => openDevice(d)}
                className={`
                  group relative rounded-2xl border bg-white cursor-pointer
                  transition-all duration-300 ease-out
                  ${
                    isSelected
                      ? 'border-indigo-300 shadow-lg shadow-indigo-100/50 ring-2 ring-indigo-300'
                      : isExpanded
                        ? 'border-indigo-200 shadow-lg shadow-indigo-100/50 ring-1 ring-indigo-100'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-md shadow-sm'
                  }
                `}
              >
                {selectMode && (
                  <div className="absolute top-3 right-3 z-10">
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'bg-white border-slate-300'
                      }`}
                      aria-checked={isSelected}
                      role="checkbox"
                      aria-label={isSelected ? 'Deselect device' : 'Select device'}
                    >
                      {isSelected && <CheckSquare className="w-3 h-3" />}
                    </div>
                  </div>
                )}
                {/* Status indicator strip */}
                <div
                  className={`absolute top-0 left-6 right-6 h-0.5 rounded-b-full ${statusCfg.color} opacity-60`}
                />

                <div className="p-5 space-y-4">
                  {/* ── Top row ── */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative flex-shrink-0">
                        <div
                          className={`
                            w-10 h-10 rounded-xl flex items-center justify-center
                            ${isExpanded ? 'bg-indigo-50' : 'bg-slate-50 group-hover:bg-slate-100'}
                            transition-colors duration-200
                          `}
                        >
                          <Monitor
                            className={`w-5 h-5 ${isExpanded ? 'text-indigo-600' : 'text-slate-500'} transition-colors`}
                          />
                        </div>
                        {/* Live dot */}
                        <div className="absolute -top-0.5 -right-0.5">
                          <span className={`flex h-2.5 w-2.5`}>
                            {d.status === 'online' && (
                              <span
                                className={`animate-ping absolute inline-flex h-full w-full rounded-full ${statusCfg.ping} opacity-75`}
                              />
                            )}
                            <span
                              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${statusCfg.color} ring-2 ring-white`}
                            />
                          </span>
                        </div>
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate text-[15px] leading-tight">
                          {d.name || d.deviceName || 'Unnamed Device'}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          {d.manufacturer && (
                            <span className="text-xs text-slate-500">{d.manufacturer}</span>
                          )}
                          {d.manufacturer && d.model && (
                            <span className="text-slate-300">·</span>
                          )}
                          {d.model && (
                            <span className="text-xs text-slate-400">{d.model}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${statusCfg.badge}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {statusCfg.label}
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 text-slate-300 transition-transform duration-300 ${isExpanded ? 'rotate-90' : 'group-hover:translate-x-0.5'}`}
                      />
                    </div>
                  </div>

                  {/* ── Meta row ── */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    {d.serialNumber && (
                      <span className="inline-flex items-center gap-1">
                        <Hash className="w-3 h-3 opacity-50" />
                        {d.serialNumber}
                      </span>
                    )}
                    {d.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 opacity-50" />
                        {d.location}
                      </span>
                    )}
                    {d.category && (
                      <span className="inline-flex items-center gap-1">
                        <Activity className="w-3 h-3 opacity-50" />
                        <span className="capitalize">{d.category}</span>
                      </span>
                    )}
                  </div>

                  {/* ── Team badges ── */}
                  <div className="flex flex-wrap gap-2">
                    {d.teamLeader && (
                      <PersonBadge
                        user={d.teamLeader}
                        role="Lead"
                        colorClass="bg-violet-50/80 text-violet-700"
                      />
                    )}
                    {d.operator && (
                      <PersonBadge
                        user={d.operator}
                        role="Operator"
                        colorClass="bg-sky-50/80 text-sky-700"
                      />
                    )}
                    {d.qcTechnician && (
                      <PersonBadge
                        user={d.qcTechnician}
                        role="QC"
                        colorClass="bg-emerald-50/80 text-emerald-700"
                      />
                    )}
                    {!d.teamLeader && !d.operator && !d.qcTechnician && (
                      <span className="text-xs text-slate-400 italic py-1">No team assigned</span>
                    )}
                  </div>

                  {/* ── Expanded assignment panel ── */}
                  {isExpanded && (
                    <div
                      className="pt-4 mt-1 border-t border-slate-100 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <p className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-indigo-500" />
                        Assign team members
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <AssignmentSelector
                          label="Operator"
                          icon={User}
                          value={selectedOperatorId}
                          onChange={setSelectedOperatorId}
                          options={operators}
                          placeholder="Select operator..."
                        />
                        <AssignmentSelector
                          label="QC Technician"
                          icon={UserCheck}
                          value={selectedQcId}
                          onChange={setSelectedQcId}
                          options={qcTechnicians}
                          placeholder="Select QC tech..."
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-500 hover:text-slate-700"
                          onClick={() => setExpandedDeviceId(null)}
                        >
                          <X className="w-3.5 h-3.5 mr-1.5" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          disabled={savingAssignment || loadingUsers}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                          onClick={handleSaveAssignments}
                        >
                          {savingAssignment ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-3.5 h-3.5 mr-1.5" />
                              Save
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectMode && (
        <BulkActionBar
          entity="device"
          selectedCount={selectedIds.length}
          onAction={handleBulkAction}
          onClear={clearSelection}
          isPending={bulk.isPending}
          accent="indigo"
          allowedOps={TEAM_LEAD_DEVICE_OPS}
        />
      )}
      {bulkResult && (
        <BulkResultToast result={bulkResult} onDismiss={() => setBulkResult(null)} />
      )}

      <BulkDeviceStatusModal
        open={bulkModal === 'status'}
        onClose={() => setBulkModal(null)}
        selectedCount={selectedIds.length}
        isPending={bulk.isPending}
        onConfirm={(payload) => runBulk('status', payload)}
      />
    </div>
  );
}