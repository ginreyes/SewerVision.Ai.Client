'use client';

import { api } from '@/lib/helper';

/**
 * Devices API – admin device management, team leader assignment
 */
export const devicesApi = {
  async getDevices(params = {}) {
    const q = new URLSearchParams();
    if (params.teamLeaderId) q.set('teamLeaderId', params.teamLeaderId);
    if (params.operatorId) q.set('operatorId', params.operatorId);
    if (params.qcTechnicianId) q.set('qcTechnicianId', params.qcTechnicianId);
    if (params.unassigned === true || params.unassigned === 'true') q.set('unassigned', 'true');
    const query = q.toString() ? `?${q.toString()}` : '';
    const response = await api(`/api/devices/get-all-devices${query}`, 'GET');
    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to fetch devices');
    }
    const data = response.data;
    return Array.isArray(data) ? data : (data?.data ?? []);
  },

  async getDeviceById(id) {
    const response = await api(`/api/devices/${id}`, 'GET');
    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to fetch device');
    }
    return response.data;
  },

  async createDevice(payload) {
    const response = await api('/api/devices/create-device', 'POST', payload);
    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to create device');
    }
    return response.data;
  },

  async updateDevice(id, payload) {
    const response = await api(`/api/devices/update-device/${id}`, 'PUT', payload);
    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to update device');
    }
    return response.data;
  },

  async deleteDevice(id) {
    const response = await api(`/api/devices/delete-device/${id}`, 'DELETE');
    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to delete device');
    }
    return response.data;
  },

  async assignToTeamLeader(deviceId, teamLeaderId) {
    const response = await api(
      `/api/devices/assign/${deviceId}/to-team-leader/${teamLeaderId}`,
      'PATCH'
    );
    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to assign device to team leader');
    }
    return response.data?.data ?? response.data;
  },

  /** Bulk assign devices to team leader, operator, and/or QC */
  async bulkAssign(payload) {
    const response = await api('/api/devices/bulk-assign', 'PATCH', payload);
    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to bulk assign devices');
    }
    return response.data?.data ?? response.data;
  },

  async uploadDeviceImage(deviceId, file) {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api(`/api/devices/${deviceId}/upload-image`, 'POST', formData);
    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to upload device image');
    }
    return response.data;
  },

  /** Operator/QC: report device as needs repair / needs maintenance / ok */
  async reportStatus(deviceId, { reportedStatus, reportedBy }) {
    const response = await api(`/api/devices/${deviceId}/report-status`, 'PUT', {
      reportedStatus,
      reportedBy,
    });
    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to report device status');
    }
    const data = response.data;
    return data?.data ?? data;
  },

  /** Send power command to device: restart | standby | shutdown */
  async sendPowerCommand(deviceId, { action }) {
    const normalized = String(action).toLowerCase();
    if (!['restart', 'standby', 'shutdown'].includes(normalized)) {
      throw new Error('action must be one of: restart, standby, shutdown');
    }
    const response = await api(`/api/devices/${deviceId}/power`, 'POST', { action: normalized });
    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to send power command');
    }
    return response.data;
  },

  /** Test if device is reachable (ping). Returns { success, reachable }. */
  async testConnection(deviceId) {
    const response = await api(`/api/devices/${deviceId}/test-connection`, 'GET');
    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to test connection');
    }
    return response.data;
  },

  /** Report live device data (battery %, signal, status) from the device itself (e.g. phone). */
  async reportLiveStatus(deviceId, { battery, signal, status }) {
    const response = await api(`/api/devices/${deviceId}/live-status`, 'POST', {
      battery,
      signal,
      status,
    });
    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to report live status');
    }
    return response.data;
  },

  /** Generate a device secret so the device can send data without user login (admin). Returns { data: { deviceSecret } }. */
  async generateDeviceSecret(deviceId) {
    const response = await api(`/api/devices/${deviceId}/generate-secret`, 'POST');
    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to generate device secret');
    }
    return response.data;
  },
};
