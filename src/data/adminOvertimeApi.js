"use client";

import { api } from "@/lib/helper";

/**
 * Admin Overtime Request API — approval queue + analytics.
 * Uses the same /api/overtime-requests endpoints as the user side, without
 * the requestedBy filter so admins see all requests.
 */
export const adminOvertimeApi = {
    async getAllRequests({ status, dateFrom, dateTo, page = 1, limit = 50 } = {}) {
        const params = new URLSearchParams({ page, limit });
        if (status && status !== 'all') params.set('status', status);
        if (dateFrom) params.set('dateFrom', dateFrom);
        if (dateTo) params.set('dateTo', dateTo);
        const response = await api(`/api/overtime-requests?${params}`, 'GET');
        if (!response.ok) throw new Error(response.data?.message || 'Failed to fetch overtime requests');
        return response.data?.data || [];
    },
    async getGlobalSummary() {
        const response = await api('/api/overtime-requests/summary', 'GET');
        if (!response.ok) throw new Error(response.data?.message || 'Failed to fetch overtime summary');
        return response.data?.data || { pending: 0, approved: 0, rejected: 0, totalApprovedHours: 0, totalPendingHours: 0 };
    },
    async approveRequest(id, { reviewedBy, reviewNote } = {}) {
        const response = await api(`/api/overtime-requests/${id}/approve`, 'PATCH', { reviewedBy, reviewNote });
        if (!response.ok) throw new Error(response.data?.message || 'Failed to approve overtime request');
        return response.data?.data;
    },
    async rejectRequest(id, { reviewedBy, reviewNote } = {}) {
        const response = await api(`/api/overtime-requests/${id}/reject`, 'PATCH', { reviewedBy, reviewNote });
        if (!response.ok) throw new Error(response.data?.message || 'Failed to reject overtime request');
        return response.data?.data;
    },
};

export default adminOvertimeApi;
