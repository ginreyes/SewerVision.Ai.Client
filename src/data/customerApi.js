"use client";

import { api } from "@/lib/helper";

/**
 * Customer API functions
 * Handles data fetching for customer-specific features
 */
export const customerApi = {
    /**
     * Get all projects for a customer
     */
    async getAllProjects(userId, { page = 1, limit = 20, status = '' } = {}) {
        const statusParam = status && status !== 'all' ? `&status=${status}` : '';
        const response = await api(
            `/api/customer/get-all-projects/${userId}?page=${page}&limit=${limit}${statusParam}`,
            'GET'
        );

        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to fetch customer projects');
        }

        return response.data.data || [];
    },

    /**
     * Get a single project by ID
     */
    async getProject(projectId, userId) {
        const response = await api(
            `/api/customer/get-project/${projectId}?userId=${userId}`,
            'GET'
        );

        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to fetch project');
        }

        return response.data.data;
    },

    /**
     * Get project observations/defects
     */
    async getProjectObservations(projectId, { limit = 100 } = {}) {
        const response = await api(
            `/api/customer/get-project-observations/${projectId}?limit=${limit}`,
            'GET'
        );

        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to fetch observations');
        }

        return response.data.data || [];
    },

    /**
     * Get project snapshots
     */
    async getProjectSnapshots(projectId, { limit = 100 } = {}) {
        const response = await api(
            `/api/customer/get-project-snapshots/${projectId}?limit=${limit}`,
            'GET'
        );

        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to fetch snapshots');
        }

        return response.data.data || [];
    },

    /**
     * Download project report
     */
    async downloadReport(projectId, userId) {
        const response = await api(
            `/api/customer/download-report/${projectId}?userId=${userId}`,
            'GET'
        );

        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to download report');
        }

        return response.data.data;
    },

    /**
     * Get all reports for a customer
     */
    async getAllReports(userId) {
        const response = await api(`/api/customer/get-all-reports/${userId}`, 'GET');

        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to fetch reports');
        }

        return response.data.data || [];
    },

    /**
     * Get a single report by ID
     */
    async getReport(userId, reportId) {
        const response = await api(`/api/customer/get-report/${userId}/${reportId}`, 'GET');

        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to fetch report');
        }

        return response.data.data;
    },

    /**
     * Get customer notifications
     */
    async getNotifications(userId, { limit = 50 } = {}) {
        const response = await api(
            `/api/customer/notifications/${userId}?limit=${limit}`,
            'GET'
        );

        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to fetch notifications');
        }

        return response.data;
    },

    /**
     * Mark a notification as read
     */
    async markNotificationRead(notificationId, userId) {
        const response = await api(
            `/api/customer/notifications/${notificationId}/read`,
            'PUT',
            { userId }
        );

        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to mark notification as read');
        }

        return response.data;
    },

    /**
     * Mark all notifications as read
     */
    async markAllNotificationsRead(userId) {
        const response = await api(
            `/api/customer/notifications/${userId}/read-all`,
            'PUT'
        );

        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to mark all as read');
        }

        return response.data;
    },

    /**
     * Delete a notification
     */
    async deleteNotification(notificationId, userId) {
        const response = await api(
            `/api/customer/notifications/${notificationId}`,
            'DELETE',
            { userId }
        );

        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to delete notification');
        }

        return response.data;
    },

    /**
     * Get notification preferences
     */
    async getNotificationPreferences(userId) {
        const response = await api(
            `/api/customer/notification-preferences/${userId}`,
            'GET'
        );

        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to fetch preferences');
        }

        return response.data?.data;
    },

    /**
     * Update notification preferences
     */
    async updateNotificationPreferences(userId, preferences) {
        const response = await api(
            `/api/customer/notification-preferences/${userId}`,
            'PUT',
            preferences
        );

        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to update preferences');
        }

        return response.data;
    },

    /**
     * Get AI detections for a project (for snapshot images)
     */
    async getProjectDetections(projectId) {
        const response = await api(
            `/api/qc-technicians/projects/${projectId}/detections`,
            'GET'
        );

        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to fetch detections');
        }

        return response.data?.data || [];
    },

    /**
     * Submit support ticket
     */
    async submitSupportTicket(userId, { subject, category, message }) {
        const response = await api(
            `/api/customer/support-tickets`,
            'POST',
            { userId, subject, category, message }
        );

        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to submit support ticket');
        }

        return response.data;
    },
};

export default customerApi;
