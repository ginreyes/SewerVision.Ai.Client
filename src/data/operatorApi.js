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
        const query = status !== 'all' ? `?status=${status}` : '';
        const response = await api(`/api/projects/get-all-projects${query}&assignedOperator=${operatorId}`, 'GET');

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
    }
};

export default operatorApi;
