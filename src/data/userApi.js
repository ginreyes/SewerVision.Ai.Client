"use client";

import { api } from "@/lib/helper";

/**
 * User (Team Lead) API functions
 * Handles data fetching for user/team-lead-specific features
 */
export const userApi = {
    // ─── Dashboard ───

    async getDashboardData(userId) {
        const [eventsRes, projectsRes, reportsRes, teamRes] = await Promise.all([
            api('/api/calendar/get-event', 'GET'),
            api(`/api/projects/get-all-projects?managerId=${userId}&limit=50`, 'GET'),
            api(`/api/reports/get-all-report?managerId=${userId}`, 'GET'),
            api(`/api/projects/get-team-members?managerId=${userId}`, 'GET'),
        ]);

        const events = Array.isArray(eventsRes?.data) ? eventsRes.data : eventsRes?.data?.data ?? [];
        const projectsList = projectsRes?.data?.data ?? projectsRes?.data ?? [];
        const projects = Array.isArray(projectsList) ? projectsList : [];
        const teamData = teamRes?.data ?? teamRes;
        const teamList = Array.isArray(teamData?.data) ? teamData.data : [];
        const teamCounts = teamData?.teamCounts ?? { operators: 0, qc: 0 };
        const reportsData = reportsRes?.data ?? [];
        const reportsList = Array.isArray(reportsData) ? reportsData : reportsData?.data ?? [];

        return { events, projects, teamList, teamCounts, reportsCount: reportsList.length };
    },

    async getTeamMemberDashboard(memberId, role) {
        const isOperator = role === 'operator';
        const url = isOperator
            ? `/api/dashboard/operator/${memberId}`
            : `/api/qc-technicians/dashboard-stats/${memberId}`;
        const res = await api(url, 'GET');
        const raw = res?.data ?? res;
        return raw?.data !== undefined ? raw.data : raw;
    },

    // ─── Projects ───

    async getAllProjects(userId, { page = 1, limit = 20, search = '', status = '' } = {}) {
        const params = new URLSearchParams({ page, limit });
        if (userId) params.set('managerId', userId);
        if (search) params.set('search', search);
        if (status && status !== 'all') params.set('status', status);

        const response = await api(`/api/projects/get-all-projects?${params}`, 'GET');
        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to fetch projects');
        }
        return response.data;
    },

    async getProject(projectId) {
        const response = await api(`/api/projects/get-project/${projectId}`, 'GET');
        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to fetch project');
        }
        return response.data?.data ?? response.data;
    },

    async requestDeleteProject(projectId) {
        const response = await api(`/api/projects/request-delete/${projectId}`, 'POST');
        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to request project deletion');
        }
        return response.data;
    },

    async approveDeleteProject(projectId) {
        const response = await api(`/api/projects/approve-delete/${projectId}`, 'POST');
        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to approve project deletion');
        }
        return response.data;
    },

    async rejectDeleteProject(projectId) {
        const response = await api(`/api/projects/reject-delete/${projectId}`, 'POST');
        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to reject project deletion');
        }
        return response.data;
    },

    async deleteProject(projectId) {
        const response = await api(`/api/projects/delete-project/${projectId}`, 'DELETE');
        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to delete project');
        }
        return response.data;
    },

    // ─── Observations ───

    async createObservation(projectId, userId, observationData) {
        const response = await api(
            `/api/observations/create-observations/${projectId}/${userId}`,
            'POST',
            observationData
        );
        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to create observation');
        }
        return response.data;
    },

    async createSnapshot(projectId, userId, snapshotData) {
        const response = await api(
            `/api/snapshots/create-snapshot/${projectId}/${userId}`,
            'POST',
            snapshotData
        );
        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to create snapshot');
        }
        return response.data;
    },

    // ─── Team ───

    async getTeamMembers(options = {}) {
        const limit = options.limit || 200;
        const response = await api(`/api/users/get-all-user?limit=${limit}`, 'GET');
        if (!response.ok || !Array.isArray(response.data?.users)) {
            throw new Error(response.data?.error || 'Failed to fetch team members');
        }
        return response.data.users;
    },

    async getTeamMemberDetails(userId) {
        const response = await api(`/api/users/get-user-details/${userId}`, 'GET');
        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to fetch user details');
        }
        return response.data?.data ?? response.data;
    },

    // ─── Devices ───

    async getDevices(userId, role) {
        const basePath = '/api/devices/get-all-devices';
        const path = role === 'user' && userId
            ? `${basePath}?teamLeaderId=${userId}`
            : basePath;
        const response = await api(path, 'GET');
        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to fetch devices');
        }
        const list = response.data?.data ?? (Array.isArray(response.data) ? response.data : []);
        return Array.isArray(list) ? list : [];
    },

    async updateDeviceAssignment(deviceId, assignments) {
        const response = await api(`/api/devices/update-device/${deviceId}`, 'PUT', assignments);
        if (!response.ok) {
            const msg = response.data?.message || response.data?.error?.message || 'Failed to update assignments';
            throw new Error(typeof msg === 'string' ? msg : 'Failed to update assignments');
        }
        return response.data?.data ?? response.data;
    },

    // ─── Calendar ───

    async getEvents() {
        const response = await api('/api/calendar/get-event', 'GET');
        const raw = response?.data;
        const list = raw?.data ?? raw;
        return Array.isArray(list) ? list : Array.isArray(raw) ? raw : [];
    },

    async createEvent(eventData) {
        const response = await api('/api/calendar/create-event', 'POST', eventData);
        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to create event');
        }
        return response.data;
    },

    async updateEvent(eventId, eventData) {
        const response = await api(`/api/calendar/update-event/${eventId}`, 'PUT', eventData);
        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to update event');
        }
        return response.data;
    },

    async deleteEvent(eventId) {
        const response = await api(`/api/calendar/delete-event/${eventId}`, 'DELETE');
        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to delete event');
        }
        return response.data;
    },

    // ─── Settings ───

    async updateProfile(username, profileData) {
        const response = await api(`/api/users/profile/${username}`, 'PATCH', profileData);
        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to update profile');
        }
        return response.data;
    },

    async uploadAvatar(userId, formData) {
        const response = await api(`/api/users/upload-avatar/${userId}`, 'POST', formData);
        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to upload avatar');
        }
        return response.data;
    },

    async changePassword(passwordData) {
        const response = await api('/api/auth/change-password', 'POST', passwordData);
        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to change password');
        }
        return response.data;
    },

    async saveSettings(settings) {
        const response = await api('/api/settings/section/user', 'PATCH', settings);
        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to save settings');
        }
        return response.data;
    },

    // ─── Notifications ───

    async getNotificationPreferences(userId) {
        const response = await api(`/api/notifications/preferences/${userId}`, 'GET');
        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to fetch notification preferences');
        }
        return response.data?.data ?? response.data;
    },

    async updateNotificationPreferences(userId, preferences) {
        const response = await api(`/api/notifications/preferences/${userId}`, 'PUT', preferences);
        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to update notification preferences');
        }
        return response.data;
    },
};

export default userApi;
