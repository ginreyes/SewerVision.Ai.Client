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

    // ─── Live Tracker ───────────────────────────────────────

    /**
     * Get live tracker projects for a customer
     */
    async getTrackerProjects(customerId) {
        const response = await api(`/api/live-tracker/customer/${customerId}`, 'GET');
        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to fetch tracker projects');
        }
        return response.data?.data || [];
    },

    // ─── Document Vault ─────────────────────────────────────

    /**
     * Get all documents for a customer
     */
    async getDocuments(customerId, { type, search, page = 1, limit = 50 } = {}) {
        const params = new URLSearchParams();
        if (type && type !== 'all') params.append('type', type);
        if (search) params.append('search', search);
        params.append('page', String(page));
        params.append('limit', String(limit));

        const response = await api(`/api/customer-documents/customer/${customerId}?${params}`, 'GET');
        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to fetch documents');
        }
        return response.data;
    },

    /**
     * Track a document download
     */
    async trackDocumentDownload(documentId) {
        const response = await api(`/api/customer-documents/download/${documentId}`, 'PUT');
        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to track download');
        }
        return response.data;
    },

    // ─── Appointments ───────────────────────────────────────

    /**
     * Get all appointments for a customer
     */
    async getAppointments(customerId, { status, page = 1, limit = 20 } = {}) {
        const params = new URLSearchParams();
        if (status && status !== 'all') params.append('status', status);
        params.append('page', String(page));
        params.append('limit', String(limit));

        const response = await api(`/api/appointments/customer/${customerId}?${params}`, 'GET');
        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to fetch appointments');
        }
        return response.data;
    },

    /**
     * Get available time slots for a date
     */
    async getAvailableSlots(date) {
        const response = await api(`/api/appointments/available-slots?date=${date}`, 'GET');
        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to fetch available slots');
        }
        return response.data?.data || [];
    },

    /**
     * Create a new appointment
     */
    async createAppointment(data) {
        const response = await api('/api/appointments/create', 'POST', data);
        if (!response.ok) {
            throw new Error(response.data?.message || 'Failed to create appointment');
        }
        return response.data?.data;
    },

    /**
     * Update an appointment
     */
    async updateAppointment(id, data) {
        const response = await api(`/api/appointments/update/${id}`, 'PUT', data);
        if (!response.ok) {
            throw new Error(response.data?.message || 'Failed to update appointment');
        }
        return response.data?.data;
    },

    /**
     * Delete an appointment
     */
    async deleteAppointment(id) {
        const response = await api(`/api/appointments/delete/${id}`, 'DELETE');
        if (!response.ok) {
            throw new Error(response.data?.message || 'Failed to delete appointment');
        }
        return response.data;
    },

    // ─── Report Annotations ─────────────────────────────────

    /**
     * Get annotations for a report
     */
    async getReportAnnotations(reportId) {
        const response = await api(`/api/report-annotations/report/${reportId}`, 'GET');
        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to fetch annotations');
        }
        return response.data?.data || [];
    },

    /**
     * Get all annotations for a customer
     */
    async getCustomerAnnotations(customerId) {
        const response = await api(`/api/report-annotations/customer/${customerId}`, 'GET');
        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to fetch annotations');
        }
        return response.data;
    },

    /**
     * Create an annotation
     */
    async createAnnotation(data) {
        const response = await api('/api/report-annotations/create', 'POST', data);
        if (!response.ok) {
            throw new Error(response.data?.message || 'Failed to create annotation');
        }
        return response.data?.data;
    },

    // ─── Dashboard Widgets ──────────────────────────────────

    /**
     * Get widget preferences for a user
     */
    async getWidgetPreferences(userId) {
        const response = await api(`/api/dashboard-widgets/preferences/${userId}`, 'GET');
        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to fetch widget preferences');
        }
        return response.data?.data;
    },

    /**
     * Update widget preferences
     */
    async updateWidgetPreferences(userId, widgets) {
        const response = await api(`/api/dashboard-widgets/preferences/${userId}`, 'PUT', { widgets });
        if (!response.ok) {
            throw new Error(response.data?.message || 'Failed to update widget preferences');
        }
        return response.data?.data;
    },

    /**
     * Get widget data (live content)
     */
    async getWidgetData(userId) {
        const response = await api(`/api/dashboard-widgets/data/${userId}`, 'GET');
        if (!response.ok) {
            throw new Error(response.data?.error || 'Failed to fetch widget data');
        }
        return response.data?.data;
    },
};

export default customerApi;
