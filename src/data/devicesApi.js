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

  async uploadDeviceImage(deviceId, file) {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api(`/api/devices/${deviceId}/upload-image`, 'POST', formData);
    if (!response.ok) {
      throw new Error(response.data?.message || 'Failed to upload device image');
    }
    return response.data;
  },
};
