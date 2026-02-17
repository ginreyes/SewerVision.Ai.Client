'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { api } from '@/lib/helper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
} from 'lucide-react';
import { useAlert } from '@/components/providers/AlertProvider';
import { useUser } from '@/components/providers/UserContext';

const STATUS_CONFIG = {
  online: {
    color: 'bg-emerald-500',
    ping: 'bg-emerald-400',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: Wifi,
    label: 'Online',
  },
  offline: {
    color: 'bg-slate-400',
    ping: 'bg-slate-300',
    badge: 'bg-slate-50 text-slate-600 border-slate-200',
    icon: WifiOff,
    label: 'Offline',
  },
  maintenance: {
    color: 'bg-amber-500',
    ping: 'bg-amber-400',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Wrench,
    label: 'Maintenance',
  },
  decommissioned: {
    color: 'bg-red-400',
    ping: 'bg-red-300',
    badge: 'bg-red-50 text-red-600 border-red-200',
    icon: WifiOff,
    label: 'Decommissioned',
  },
};

const getStatusConfig = (status) => STATUS_CONFIG[status] || STATUS_CONFIG.offline;

export default function UserDeviceAssignmentsPage() {
  const { showAlert } = useAlert();
  const { userId, userData } = useUser() || {};

  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [operators, setOperators] = useState([]);
  const [qcTechnicians, setQcTechnicians] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [expandedDeviceId, setExpandedDeviceId] = useState(null);
  const [selectedOperatorId, setSelectedOperatorId] = useState('');
  const [selectedQcId, setSelectedQcId] = useState('');
  const [savingAssignment, setSavingAssignment] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  /* ──────────── data fetching ──────────── */

  const fetchDevices = useCallback(async () => {
    try {
      setLoading(true);
      const basePath = '/api/devices/get-all-devices';
      const path =
        userData?.role === 'user' && userId
          ? `${basePath}?teamLeaderId=${userId}`
          : basePath;
      const { ok, data } = await api(path, 'GET');
      const list = data?.data ?? (Array.isArray(data) ? data : []);
      setDevices(ok && Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load devices:', err);
      showAlert('Failed to load devices', 'error');
    } finally {
      setLoading(false);
    }
  }, [showAlert, userData?.role, userId]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const { ok, data } = await api('/api/users/get-all-user', 'GET');
      if (!ok || !Array.isArray(data?.users)) return;

      let operatorUsers = data.users.filter((u) => u.role === 'operator');
      let qcUsers = data.users.filter((u) => u.role === 'qc-technician');

      if (
        userData?.role === 'user' &&
        Array.isArray(userData.managedMembers) &&
        userData.managedMembers.length > 0
      ) {
        const managedIds = new Set(userData.managedMembers.map((id) => String(id)));
        operatorUsers = operatorUsers.filter((u) => u._id && managedIds.has(String(u._id)));
        qcUsers = qcUsers.filter((u) => u._id && managedIds.has(String(u._id)));
      }

      setOperators(operatorUsers);
      setQcTechnicians(qcUsers);
    } catch (err) {
      console.error('Failed to load users:', err);
      showAlert('Failed to load team members', 'error');
    } finally {
      setLoadingUsers(false);
    }
  }, [showAlert, userData?.role, userData?.managedMembers]);

  useEffect(() => {
    fetchDevices();
    fetchUsers();
  }, [fetchDevices, fetchUsers]);

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

  /* ──────────── helpers ──────────── */

  const getUserDisplay = (user) => {
    if (!user) return { name: 'Unassigned', initials: '?', avatar: '' };
    const name =
      [user.first_name, user.last_name].filter(Boolean).join(' ').trim() ||
      user.username ||
      'Unassigned';
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    return { name, initials, avatar: user.avatar || '' };
  };

  const openDevice = (device) => {
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

  const handleSaveAssignments = async () => {
    const device = devices.find((d) => d._id === expandedDeviceId);
    if (!device) return;
    try {
      setSavingAssignment(true);
      const body = {
        operator: selectedOperatorId || null,
        qcTechnician: selectedQcId || null,
      };
      const res = await api(`/api/devices/update-device/${device._id}`, 'PUT', body);
      if (!res.ok) {
        const msg =
          res.data?.message || res.data?.error?.message || 'Failed to update assignments';
        throw new Error(typeof msg === 'string' ? msg : 'Failed to update assignments');
      }
      const updated = res.data?.data ?? res.data;
      setDevices((prev) => prev.map((d) => (d._id === updated._id ? updated : d)));
      setExpandedDeviceId(null);
      showAlert('Device assignments updated', 'success');
    } catch (err) {
      console.error('Failed to update assignments:', err);
      showAlert(err?.message || 'Failed to update assignments', 'error');
    } finally {
      setSavingAssignment(false);
    }
  };

  /* ──────────── sub-components ──────────── */

  const PersonBadge = ({ user, role, colorClass, iconElement }) => {
    const { name, initials, avatar } = getUserDisplay(user);
    return (
      <div className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg ${colorClass} transition-colors`}>
        <Avatar className="w-5 h-5">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback className="text-[10px] font-medium">{initials}</AvatarFallback>
        </Avatar>
        <span className="text-xs font-medium opacity-70">{role}</span>
        <span className="text-xs font-semibold">{name}</span>
      </div>
    );
  };

  const AssignmentSelector = ({ label, icon: Icon, value, onChange, options, placeholder }) => {
    const selectedUser = options.find((o) => o._id === value);
    const { name, initials, avatar } = getUserDisplay(selectedUser);

    return (
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <Icon className="w-3.5 h-3.5" />
          {label}
        </label>
        <div className="flex items-center gap-2.5">
          <Avatar className="w-8 h-8 ring-2 ring-white shadow-sm">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="text-xs font-semibold bg-slate-100 text-slate-600">
              {initials}
            </AvatarFallback>
          </Avatar>
          <Select value={value || '__none__'} onValueChange={(v) => onChange(v === '__none__' ? '' : v)}>
            <SelectTrigger className="h-9 text-sm flex-1 bg-white border-slate-200 hover:border-slate-300 transition-colors shadow-sm">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">
                <span className="text-slate-400">Unassigned</span>
              </SelectItem>
              {options.map((user) => (
                <SelectItem key={user._id} value={user._id}>
                  {[user.first_name, user.last_name].filter(Boolean).join(' ') ||
                    user.username ||
                    'Unknown'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  /* ──────────── render ──────────── */

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
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

      {/* ── Search ── */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search devices by name, serial, location, or manufacturer..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11 bg-white border-slate-200 text-sm shadow-sm focus-visible:ring-indigo-500"
        />
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
            const isExpanded = expandedDeviceId === d._id;
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
                    isExpanded
                      ? 'border-indigo-200 shadow-lg shadow-indigo-100/50 ring-1 ring-indigo-100'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-md shadow-sm'
                  }
                `}
              >
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
    </div>
  );
}