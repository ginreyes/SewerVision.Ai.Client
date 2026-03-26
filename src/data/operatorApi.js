"use client";

import { api } from "@/lib/helper";

/**
 * Operator API functions
 * Handles data fetching for operator-specific features
 */
export const operatorApi = {
    /**
     * Get operator dashboard statistics
     */
    async getDashboardStats(operatorId) {
        const response = await api(`/api/dashboard/operator/${operatorId}`, 'GET');

        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to fetch operator dashboard statistics');
        }

        return response.data.data;
    },

    /**
     * Get operator reports
     */
    async getReports(operatorId) {
        const response = await api(`/api/reports/get-operator-reports/${operatorId}`, 'GET');

        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to fetch operator reports');
        }

        return response.data.data;
    },

    /**
     * Get operations overview
     */
    async getOverview() {
        const response = await api('/api/operators/overview', 'GET');

        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to fetch operations overview');
        }

        return response.data.data;
    },

    /**
     * Start device recording
     */
    async startRecording(deviceId) {
        const response = await api(`/api/operators/devices/${deviceId}/start-recording`, 'POST');

        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to start recording');
        }

        return response.data;
    },

    /**
     * Stop device recording
     */
    async stopRecording(deviceId) {
        const response = await api(`/api/operators/devices/${deviceId}/stop-recording`, 'POST');

        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to stop recording');
        }

        return response.data;
    },

    /**
     * Get operator tasks/assignments (projects assigned to operator)
     */
    async getTasks(operatorId, status = 'all') {
        // Build query params for backend:
        // - We always filter by the current operator
        // - We keep status filtering on the frontend (TasksPage) because
        //   the backend uses project-level statuses (field-capture, ai-processing, etc.)
        const params = new URLSearchParams();

        if (operatorId) {
            params.append('assignedOperatorId', operatorId);
        }

        // Optional: request a larger page size so operators see more tasks
        // without having to worry about pagination in the tasks view.
        params.append('limit', '100');

        const queryString = params.toString();

        const response = await api(
            `/api/projects/get-all-projects${queryString ? `?${queryString}` : ''}`,
            'GET'
        );

        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to fetch operator tasks');
        }

        // Convert projects to task format
        const projects = response.data.data || [];
        return projects.map(project => ({
            id: project._id,
            title: project.name,
            description: project.description || `Inspection at ${project.location}`,
            status: project.status === 'completed' ? 'completed' :
                project.status === 'ai-processing' ? 'in-progress' :
                    project.status === 'field-capture' ? 'in-progress' : 'pending',
            priority: project.priority || 'medium',
            assignee: 'You',
            location: project.location,
            device: project.device || 'CCTV Unit',
            startTime: project.startDate || project.createdAt,
            estimatedDuration: project.estimatedDuration || '2 hours',
            progress: project.progress || 0,
            type: 'inspection',
            aiProcessing: project.aiProgress === 100 ? 'completed' :
                project.aiProgress > 0 ? 'processing' : 'pending',
            footage: project.footage || '0 GB',
            projectId: project._id
        }));
    },

    /**
     * Get notes for operator
     */
    async getNotes(operatorId, filters = {}) {
        const params = new URLSearchParams();
        if (filters.category) params.append('category', filters.category);
        if (filters.isArchived !== undefined) params.append('isArchived', filters.isArchived);
        if (filters.isPinned !== undefined) params.append('isPinned', filters.isPinned);
        if (filters.search) params.append('search', filters.search);

        const queryString = params.toString();
        const response = await api(`/api/notes/${operatorId}${queryString ? `?${queryString}` : ''}`, 'GET');

        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to fetch notes');
        }

        return response.data.data;
    },

    /**
     * Create a note
     */
    async createNote(noteData) {
        const response = await api('/api/notes', 'POST', noteData);

        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to create note');
        }

        return response.data.data;
    },

    /**
     * Update a note
     */
    async updateNote(noteId, noteData) {
        const response = await api(`/api/notes/${noteId}`, 'PATCH', noteData);

        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to update note');
        }

        return response.data.data;
    },

    /**
     * Delete a note
     */
    async deleteNote(noteId, userId) {
        const params = userId ? `?userId=${userId}` : '';
        const response = await api(`/api/notes/${noteId}${params}`, 'DELETE');

        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to delete note');
        }

        return response.data;
    },

    // ── Dashboard extras ──

    async getTodayEvents(userId) {
        const response = await api(`/api/operator/calendar/events/today?userId=${userId}`, 'GET');
        if (!response.ok) throw new Error(response.data?.error || 'Failed to fetch today events');
        return response.data.data ?? response.data;
    },

    async getAssignedProjects(userId, limit = 10) {
        const response = await api(`/api/projects/get-all-projects?assignedOperatorId=${userId}&limit=${limit}`, 'GET');
        if (!response.ok) throw new Error(response.data?.error || 'Failed to fetch assigned projects');
        return response.data.data ?? response.data;
    },

    // ── Calendar ──

    async getCalendarEvents(userId) {
        const [operatorRes, globalRes] = await Promise.all([
            api(`/api/operator/calendar/events?userId=${userId}`, 'GET'),
            api('/api/calendar/get-event', 'GET'),
        ]);
        const operatorEvents = operatorRes.ok ? (operatorRes.data.data ?? operatorRes.data) : [];
        const globalEvents = globalRes.ok ? (globalRes.data.data ?? globalRes.data) : [];
        return { operatorEvents, globalEvents };
    },

    async getCalendarStatistics(userId) {
        const response = await api(`/api/operator/calendar/statistics?userId=${userId}`, 'GET');
        if (!response.ok) throw new Error(response.data?.error || 'Failed to fetch calendar statistics');
        return response.data.data ?? response.data;
    },

    async createCalendarEvent(payload) {
        const response = await api('/api/operator/calendar/events', 'POST', payload);
        if (!response.ok) throw new Error(response.data?.error || 'Failed to create event');
        return response.data.data ?? response.data;
    },

    async updateCalendarEventStatus(eventId, status) {
        const response = await api(`/api/operator/calendar/events/${eventId}/status`, 'PATCH', { status });
        if (!response.ok) throw new Error(response.data?.error || 'Failed to update event status');
        return response.data.data ?? response.data;
    },

    async deleteCalendarEvent(eventId) {
        const response = await api(`/api/operator/calendar/events/${eventId}`, 'DELETE');
        if (!response.ok) throw new Error(response.data?.error || 'Failed to delete event');
        return response.data;
    },

    // ── Projects ──

    async getProjects(userId, { page = 1, limit = 20, search = '', status = '' } = {}) {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', limit);
        if (userId) params.append('assignedOperatorId', userId);
        if (search) params.append('search', search);
        if (status && status !== 'all') params.append('status', status);
        const response = await api(`/api/projects/get-all-projects?${params.toString()}`, 'GET');
        if (!response.ok) throw new Error(response.data?.error || 'Failed to fetch projects');
        return response.data;
    },

    async getProject(projectId) {
        const response = await api(`/api/projects/get-project/${projectId}`, 'GET');
        if (!response.ok) throw new Error(response.data?.error || 'Failed to fetch project');
        return response.data.data ?? response.data;
    },

    // ── Equipment / Devices ──

    async getDevices(operatorId) {
        const response = await api(`/api/devices/get-all-devices?operatorId=${operatorId}`, 'GET');
        if (!response.ok) throw new Error(response.data?.error || 'Failed to fetch devices');
        return response.data.data ?? response.data;
    },

    async reportDeviceStatus(deviceId, data) {
        const response = await api(`/api/devices/${deviceId}/report-status`, 'PUT', data);
        if (!response.ok) throw new Error(response.data?.error || 'Failed to report device status');
        return response.data.data ?? response.data;
    },

    // ── Operations ──

    async getUploads(limit = 10) {
        const response = await api(`/api/uploads/get-all-uploads?limit=${limit}`, 'GET');
        if (!response.ok) throw new Error(response.data?.error || 'Failed to fetch uploads');
        return response.data?.data?.uploads ?? [];
    },

    async startOperationsRecording(deviceId) {
        const response = await api(`/api/operations/devices/${deviceId}/start-recording`, 'POST');
        if (!response.ok) throw new Error(response.data?.error || 'Failed to start recording');
        return response.data;
    },

    async stopOperationsRecording(deviceId) {
        const response = await api(`/api/operations/devices/${deviceId}/stop-recording`, 'POST');
        if (!response.ok) throw new Error(response.data?.error || 'Failed to stop recording');
        return response.data;
    },

    // ── Reports ──

    async getUserByUsername(username) {
        const response = await api(`/api/users/role/${username}`, 'GET');
        if (!response.ok) throw new Error(response.data?.error || 'Failed to fetch user');
        return response.data.data ?? response.data;
    },

    async getAllProjectsForReports() {
        const response = await api('/api/projects/get-all-project', 'GET');
        if (!response.ok) throw new Error(response.data?.error || 'Failed to fetch projects');
        return response.data.data ?? response.data;
    },

    async createReport(reportData) {
        const response = await api('/api/reports/create-report', 'POST', reportData);
        if (!response.ok) throw new Error(response.data?.error || 'Failed to create report');
        return response.data.data ?? response.data;
    },

    // ── Logs ──

    async getInspectionLogs(username, limit = 100) {
        const response = await api(`/api/uploads/get-all-uploads?uploadedBy=${username}&limit=${limit}`, 'GET');
        if (!response.ok) throw new Error(response.data?.error || 'Failed to fetch logs');
        return response.data?.data?.uploads ?? [];
    },

    // ── Settings / Profile ──

    async updateProfile(username, data) {
        const response = await api(`/api/users/profile/${username}`, 'PATCH', data);
        if (!response.ok) throw new Error(response.data?.error || 'Failed to update profile');
        return response.data.data ?? response.data;
    },

    async changePassword(data) {
        const response = await api('/api/auth/change-password', 'POST', data);
        if (!response.ok) throw new Error(response.data?.error || 'Failed to change password');
        return response.data;
    },

    async saveSettings(settings) {
        const response = await api('/api/settings/section/operator', 'PATCH', { operator: settings });
        if (!response.ok) throw new Error(response.data?.error || 'Failed to save settings');
        return response.data;
    },

    // ── Notifications ──

    async getNotificationPreferences(userId) {
        const response = await api(`/api/notifications/preferences/${userId}`, 'GET');
        if (!response.ok) throw new Error(response.data?.error || 'Failed to fetch preferences');
        return response.data.data ?? response.data;
    },

    async updateNotificationPreferences(userId, preferences) {
        const response = await api(`/api/notifications/preferences/${userId}`, 'PUT', preferences);
        if (!response.ok) throw new Error(response.data?.error || 'Failed to update preferences');
        return response.data;
    },

    // ─── Checklists ─────────────────────────────
    async getChecklists(operatorId, { status, search, page = 1, limit = 20 } = {}) {
        const params = new URLSearchParams({ assignedTo: operatorId, page: String(page), limit: String(limit) });
        if (status && status !== 'all') params.append('status', status);
        if (search) params.append('search', search);
        const response = await api(`/api/checklists?${params}`, 'GET');
        if (!response.ok) throw new Error(response.data?.message || 'Failed to fetch checklists');
        return response.data?.data || [];
    },
    async createChecklist(data) {
        const response = await api('/api/checklists', 'POST', data);
        if (!response.ok) throw new Error(response.data?.message || 'Failed to create checklist');
        return response.data?.data;
    },
    async updateChecklist(id, data) {
        const response = await api(`/api/checklists/${id}`, 'PUT', data);
        if (!response.ok) throw new Error(response.data?.message || 'Failed to update checklist');
        return response.data?.data;
    },
    async toggleChecklistItem(checklistId, itemIndex) {
        const response = await api(`/api/checklists/${checklistId}/items/${itemIndex}`, 'PATCH');
        if (!response.ok) throw new Error(response.data?.message || 'Failed to toggle item');
        return response.data?.data;
    },
    async deleteChecklist(id) {
        const response = await api(`/api/checklists/${id}`, 'DELETE');
        if (!response.ok) throw new Error(response.data?.message || 'Failed to delete checklist');
        return response.data;
    },

    // ─── Route Sites ────────────────────────────
    async getRouteSites(operatorId, { scheduledDate, status } = {}) {
        const params = new URLSearchParams({ assignedTo: operatorId });
        if (scheduledDate) params.append('scheduledDate', scheduledDate);
        if (status && status !== 'all') params.append('status', status);
        const response = await api(`/api/route-sites?${params}`, 'GET');
        if (!response.ok) throw new Error(response.data?.message || 'Failed to fetch route sites');
        return response.data?.data || [];
    },
    async updateRouteSite(id, data) {
        const response = await api(`/api/route-sites/${id}`, 'PUT', data);
        if (!response.ok) throw new Error(response.data?.message || 'Failed to update site');
        return response.data?.data;
    },
    async completeRouteSite(id) {
        const response = await api(`/api/route-sites/${id}/complete`, 'PATCH');
        if (!response.ok) throw new Error(response.data?.message || 'Failed to complete site');
        return response.data?.data;
    },

    // ─── Incidents ──────────────────────────────
    async getIncidents(operatorId, { status, severity, search, page = 1, limit = 20 } = {}) {
        const params = new URLSearchParams({ reportedBy: operatorId, page: String(page), limit: String(limit) });
        if (status && status !== 'all') params.append('status', status);
        if (severity) params.append('severity', severity);
        if (search) params.append('search', search);
        const response = await api(`/api/incidents?${params}`, 'GET');
        if (!response.ok) throw new Error(response.data?.message || 'Failed to fetch incidents');
        return response.data?.data || [];
    },
    async createIncident(data) {
        const response = await api('/api/incidents', 'POST', data);
        if (!response.ok) throw new Error(response.data?.message || 'Failed to create incident');
        return response.data?.data;
    },
    async updateIncident(id, data) {
        const response = await api(`/api/incidents/${id}`, 'PUT', data);
        if (!response.ok) throw new Error(response.data?.message || 'Failed to update incident');
        return response.data?.data;
    },

    // ─── Time Entries ───────────────────────────
    async getTimeEntries(operatorId, { dateFrom, dateTo, type } = {}) {
        const params = new URLSearchParams({ operator: operatorId });
        if (dateFrom) params.append('dateFrom', dateFrom);
        if (dateTo) params.append('dateTo', dateTo);
        if (type && type !== 'all') params.append('type', type);
        const response = await api(`/api/time-entries?${params}`, 'GET');
        if (!response.ok) throw new Error(response.data?.message || 'Failed to fetch time entries');
        return response.data?.data || [];
    },
    async createTimeEntry(data) {
        const response = await api('/api/time-entries', 'POST', data);
        if (!response.ok) throw new Error(response.data?.message || 'Failed to create time entry');
        return response.data?.data;
    },
    async deleteTimeEntry(id) {
        const response = await api(`/api/time-entries/${id}`, 'DELETE');
        if (!response.ok) throw new Error(response.data?.message || 'Failed to delete entry');
        return response.data;
    },
    async getTimeSummary(operatorId, weekOf) {
        const params = new URLSearchParams({ operator: operatorId });
        if (weekOf) params.append('weekOf', weekOf);
        const response = await api(`/api/time-entries/summary?${params}`, 'GET');
        if (!response.ok) throw new Error(response.data?.message || 'Failed to fetch summary');
        return response.data?.data;
    },

    // ─── Offline Cache ──────────────────────────
    async getCachedItems(operatorId) {
        const response = await api(`/api/offline-cache?operator=${operatorId}`, 'GET');
        if (!response.ok) throw new Error(response.data?.message || 'Failed to fetch cached items');
        return response.data?.data || [];
    },
    async toggleCache(cacheId) {
        const response = await api(`/api/offline-cache/${cacheId}/toggle`, 'PATCH');
        if (!response.ok) throw new Error(response.data?.message || 'Failed to toggle cache');
        return response.data?.data;
    },
    async getPendingSyncs(operatorId) {
        const response = await api(`/api/offline-cache/pending?operator=${operatorId}`, 'GET');
        if (!response.ok) throw new Error(response.data?.message || 'Failed to fetch pending syncs');
        return response.data?.data || [];
    },
    async syncAll(operatorId) {
        const response = await api('/api/offline-cache/sync', 'POST', { operator: operatorId });
        if (!response.ok) throw new Error(response.data?.message || 'Failed to sync');
        return response.data;
    },
    async getOfflineStats(operatorId) {
        const response = await api(`/api/offline-cache/stats?operator=${operatorId}`, 'GET');
        if (!response.ok) throw new Error(response.data?.message || 'Failed to fetch stats');
        return response.data?.data;
    },
};

export default operatorApi;
