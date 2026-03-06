"use client";

import { maintenanceApi } from "@/data/maintenanceApi";

/**
 * Task API functions (Admin task view)
 *
 * This is a thin wrapper around the backend maintenance tasks endpoints so the
 * admin “Task Management” page can treat maintenance tasks as generic tasks.
 */
export const taskApi = {
    /**
     * Get all tasks mapped into the UI task shape
     */
    async getTasks(filters = {}) {
        const maintenanceFilters = {};

        // Map status filter: maintenance tasks support
        // pending | scheduled | in-progress | completed | cancelled
        if (filters.status && filters.status !== 'all' && filters.status !== 'urgent') {
            maintenanceFilters.status = filters.status;
        }

        // Priority filter is compatible (low | medium | high | critical)
        if (filters.priority) {
            maintenanceFilters.priority = filters.priority;
        }

        // Text search
        if (filters.search) {
            maintenanceFilters.search = filters.search;
        }

        const response = await maintenanceApi.getTasks(maintenanceFilters);

        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to fetch tasks');
        }

        const tasks = response.data?.data || [];

        // Map MaintenanceTask -> UI task card shape
        return tasks.map((t) => {
            const createdAt = t.createdAt ? new Date(t.createdAt) : new Date();
            const estimatedCompletion = t.estimatedCompletion
                ? new Date(t.estimatedCompletion)
                : new Date(createdAt.getTime() + 60 * 60 * 1000);

            const isActiveStatus = ['pending', 'scheduled', 'in-progress'].includes(t.status);
            const derivedStatus =
                t.priority === 'critical' && isActiveStatus
                    ? 'urgent'
                    : t.status;

            return {
                // Mongo id is still useful as the canonical id
                id: t._id || t.taskId,
                _id: t._id,

                // UI-specific fields
                title: t.task,
                description: t.description || '',
                status: derivedStatus,
                priority: t.priority || 'medium',
                assignee: t.assignedTo || 'Unassigned',
                location: t.category || 'System',
                device: t.assignedTeam || 'Maintenance',
                startTime: createdAt.toISOString(),
                estimatedDuration: `${Math.max(
                    30,
                    Math.round(
                        (estimatedCompletion.getTime() - createdAt.getTime()) / (60 * 1000)
                    )
                )} min`,
                progress: typeof t.progress === 'number' ? t.progress : 0,

                // Task type for icon styling
                type: 'maintenance',

                // Optional extras used by the card; safe defaults
                aiProcessing: undefined,
                footage: '',
                confidence: undefined,

                // Keep original raw maintenance task in case the UI needs it
                raw: t,
            };
        });
    },

    /**
     * Create a task (backed by MaintenanceTask)
     */
    async createTask(taskData) {
        const now = new Date();
        const startTime = taskData.startTime ? new Date(taskData.startTime) : now;

        // naive 1h duration fallback – UI still uses its own human-readable string
        const estimatedCompletion = new Date(startTime.getTime() + 60 * 60 * 1000);

        const payload = {
            task: taskData.title || taskData.task || 'Maintenance Task',
            description: taskData.description || '',
            priority: taskData.priority || 'medium',
            status: taskData.status || 'pending',
            assignedTo: taskData.assignee || 'Unassigned',
            assignedTeam: taskData.device || undefined,
            estimatedCompletion,
            category: 'general',
            notes: taskData.notes,
            createdBy: taskData.createdBy,
        };

        const response = await maintenanceApi.createTask(payload);

        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to create task');
        }

        const created = response.data?.data;

        // Reuse the same mapping logic as getTasks for consistency
        const createdTasks = await this.getTasks({}); // fetch fresh and let caller update list
        const latest = createdTasks.find((t) => t.raw?._id === created._id) || null;

        return latest || created;
    },

    /**
     * Update a task (MaintenanceTask)
     */
    async updateTask(taskId, taskData) {
        const payload = {};

        if (taskData.title || taskData.task) payload.task = taskData.title || taskData.task;
        if (taskData.description !== undefined) payload.description = taskData.description;
        if (taskData.priority) payload.priority = taskData.priority;
        if (taskData.status) payload.status = taskData.status;
        if (taskData.assignee) payload.assignedTo = taskData.assignee;
        if (taskData.device !== undefined) payload.assignedTeam = taskData.device;
        if (taskData.notes !== undefined) payload.notes = taskData.notes;

        const response = await maintenanceApi.updateTask(taskId, payload);

        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to update task');
        }

        return response.data?.data;
    },

    /**
     * Delete a task (MaintenanceTask)
     */
    async deleteTask(taskId) {
        const response = await maintenanceApi.deleteTask(taskId);

        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to delete task');
        }

        return response.data?.data;
    },

    /**
     * Get task stats
     *
     * We derive the same shape used in the TasksPage header stats:
     * { active, urgent, completedToday, efficiency }
     */
    async getStats() {
        const response = await maintenanceApi.getTasks({});

        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to fetch task stats');
        }

        const tasks = response.data?.data || [];

        const now = new Date();
        const mapped = tasks.map((t) => ({
            status: t.status,
            priority: t.priority,
            startTime: t.createdAt || t.estimatedCompletion || now,
            progress: t.progress || 0,
        }));

        const active = mapped.filter(t =>
            ['pending', 'in-progress', 'scheduled'].includes(t.status)
        ).length;

        const urgent = mapped.filter(
            t => t.priority === 'critical' || t.priority === 'high'
        ).length;

        const completedToday = mapped.filter(t => {
            if (t.status !== 'completed') return false;
            const d = new Date(t.startTime);
            return d.toDateString() === now.toDateString();
        }).length;

        const efficiency =
            mapped.length > 0
                ? Math.round(
                    (mapped.filter(t => t.status === 'completed').length /
                        mapped.length) *
                    100
                )
                : 94;

        return {
            active,
            urgent,
            completedToday,
            efficiency,
        };
    },
};

export default taskApi;
