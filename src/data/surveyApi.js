"use client";

import { api } from "@/lib/helper";

export const surveyApi = {
  async submitResponse(data) {
    const response = await api('/api/surveys/submit', 'POST', data);
    if (!response.ok) throw new Error(response.data?.message || 'Failed to submit survey');
    return response.data?.data;
  },
  async getAllResponses({ rating, page = 1, limit = 50 } = {}) {
    const params = new URLSearchParams();
    if (rating) params.append('rating', String(rating));
    params.append('page', String(page));
    params.append('limit', String(limit));
    const response = await api(`/api/surveys/responses?${params}`, 'GET');
    if (!response.ok) throw new Error(response.data?.error || 'Failed to fetch responses');
    return response.data;
  },
  async getStats() {
    const response = await api('/api/surveys/stats', 'GET');
    if (!response.ok) throw new Error(response.data?.error || 'Failed to fetch stats');
    return response.data?.data;
  },
  async getByCustomer(customerId) {
    const response = await api(`/api/surveys/customer/${customerId}`, 'GET');
    if (!response.ok) throw new Error(response.data?.error || 'Failed to fetch customer surveys');
    return response.data?.data || [];
  },
  // ─── Survey Invite System ────────────────────────────
  async sendSurveys({ ticketIds, sentBy }) {
    const response = await api('/api/surveys/send', 'POST', { ticketIds, sentBy });
    if (!response.ok) throw new Error(response.data?.message || 'Failed to send surveys');
    return response.data?.data;
  },
  async getInviteByToken(token) {
    const response = await api(`/api/surveys/invite/${token}`, 'GET');
    if (!response.ok) throw new Error(response.data?.message || 'Survey not found');
    return response.data?.data;
  },
  async respondToSurvey(token, { rating, comment }) {
    const response = await api(`/api/surveys/respond/${token}`, 'POST', { rating, comment });
    if (!response.ok) throw new Error(response.data?.message || 'Failed to submit survey');
    return response.data?.data;
  },
  async getPendingSurveys(customerId) {
    const response = await api(`/api/surveys/pending/${customerId}`, 'GET');
    if (!response.ok) throw new Error(response.data?.error || 'Failed to fetch pending surveys');
    return response.data?.data || [];
  },
  async getAllInvites({ status, sentBy, page = 1, limit = 50 } = {}) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (sentBy) params.append('sentBy', sentBy);
    params.append('page', String(page));
    params.append('limit', String(limit));
    const response = await api(`/api/surveys/invites?${params}`, 'GET');
    if (!response.ok) throw new Error(response.data?.error || 'Failed to fetch invites');
    return response.data;
  },
};

export default surveyApi;
