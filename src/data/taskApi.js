"use client";

import { api } from "@/lib/helper";

/**
 * Task API functions
 * Handles tasks management
 */
export const taskApi = {
    /**
     * Get all tasks
     */
    async getTasks(filters = {}) {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.priority) params.append('priority', filters.priority);
        if (filters.search) params.append('search', filters.search);

        const queryString = params.toString();
        const response = await api(`/api/tasks${queryString ? `?${queryString}` : ''}`, 'GET');

        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to fetch tasks');
        }

        return response.data.data;
    },

    /**
     * Create a task
     */
    async createTask(taskData) {
        // Ensure user ID is attached (usually handled by auth context in frontend and sent in body or headers)
        // Here we rely on helper to attach headers, but we might need to send createdBy in body if backend expects it
        const response = await api('/api/tasks', 'POST', taskData);

        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to create task');
        }

        return response.data.data;
    },

    /**
     * Update a task
     */
    async updateTask(taskId, taskData) {
        const response = await api(`/api/tasks/${taskId}`, 'PUT', taskData);

        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to update task');
        }

        return response.data.data;
    },

    /**
     * Delete a task
     */
    async deleteTask(taskId) {
        const response = await api(`/api/tasks/${taskId}`, 'DELETE');

        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to delete task');
        }

        return response.data.data;
    },

    /**
     * Get task stats
     */
    async getStats() {
        const response = await api('/api/tasks/stats', 'GET');

        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to fetch task stats');
        }

        return response.data.data;
    }
};

export default taskApi;
