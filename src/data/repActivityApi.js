"use client";

import { api } from "@/lib/helper";

/**
 * Rep Activity API — backs the admin team overview and the self-serve
 * per-rep performance page. Powered by a single GET endpoint that varies
 * its response shape based on the presence of `repId`.
 */
export const repActivityApi = {
    async list({ managedBy } = {}) {
        const params = new URLSearchParams();
        if (managedBy) params.set('managedBy', managedBy);
        const qs = params.toString();
        const response = await api(`/api/rep-activity${qs ? `?${qs}` : ''}`, 'GET');
        if (!response.ok) throw new Error(response.data?.message || 'Failed to fetch rep activity');
        return response.data?.data || [];
    },
    async getOne(repId) {
        const response = await api(`/api/rep-activity?repId=${repId}`, 'GET');
        if (!response.ok) throw new Error(response.data?.message || 'Failed to fetch rep activity');
        return response.data?.data;
    },
};

export default repActivityApi;
