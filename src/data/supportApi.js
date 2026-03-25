import { api } from "@/lib/helper";

const supportApi = {
  /** Get all tickets (admin / customer-rep) */
  getAllTickets: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await api(`/api/support/all${query ? `?${query}` : ""}`, "GET");
    if (!res?.ok) throw new Error(res?.message || "Failed to fetch tickets");
    return res.data;
  },

  /** Get global stats (all roles) */
  getGlobalStats: async () => {
    const res = await api("/api/support/global-stats", "GET");
    if (!res?.ok) throw new Error(res?.message || "Failed to fetch stats");
    return res.data?.data ?? res.data;
  },

  /** Get tickets for a specific customer */
  getCustomerTickets: async (userId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await api(`/api/support/${userId}${query ? `?${query}` : ""}`, "GET");
    if (!res?.ok) throw new Error(res?.message || "Failed to fetch tickets");
    return res.data;
  },

  /** Get stats for a specific customer */
  getCustomerStats: async (userId) => {
    const res = await api(`/api/support/stats/${userId}`, "GET");
    if (!res?.ok) throw new Error(res?.message || "Failed to fetch stats");
    return res.data?.data ?? res.data;
  },

  /** Get a specific ticket */
  getTicketById: async (ticketId) => {
    const res = await api(`/api/support/ticket/${ticketId}`, "GET");
    if (!res?.ok) throw new Error(res?.message || "Failed to fetch ticket");
    return res.data?.data ?? res.data;
  },

  /** Create a new support ticket */
  createTicket: async (data) => {
    const res = await api("/api/support/create", "POST", data);
    if (!res?.ok) throw new Error(res?.message || "Failed to create ticket");
    return res.data?.data ?? res.data;
  },

  /** Update ticket status/priority/assignment */
  updateTicket: async (ticketId, data) => {
    const res = await api(`/api/support/ticket/${ticketId}/status`, "PUT", data);
    if (!res?.ok) throw new Error(res?.message || "Failed to update ticket");
    return res.data?.data ?? res.data;
  },

  /** Add a response to a ticket */
  addResponse: async (ticketId, data) => {
    const res = await api(`/api/support/ticket/${ticketId}/response`, "POST", data);
    if (!res?.ok) throw new Error(res?.message || "Failed to add response");
    return res.data?.data ?? res.data;
  },

  /** Upload a ticket reply attachment, returns { url, filename, originalname, mimetype, size } */
  uploadTicketAttachment: async (ticketId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api(`/api/support/ticket/${ticketId}/upload-attachment`, "POST", formData);
    if (!res?.ok) throw new Error(res?.message || "Failed to upload file");
    return res.data?.data ?? res.data;
  },

  /** Delete a ticket */
  deleteTicket: async (ticketId) => {
    const res = await api(`/api/support/ticket/${ticketId}`, "DELETE");
    if (!res?.ok) throw new Error(res?.message || "Failed to delete ticket");
    return res.data;
  },

  /** Get tickets assigned to a rep */
  getAssignedTickets: async (repId) => {
    const res = await api(`/api/support/assigned/${repId}`, "GET");
    if (!res?.ok) throw new Error(res?.message || "Failed to fetch assigned tickets");
    return res.data?.data ?? res.data;
  },

  /** Get support team members */
  getTeam: async () => {
    const res = await api("/api/support/team", "GET");
    if (!res?.ok) throw new Error(res?.message || "Failed to fetch team");
    return res.data?.data ?? res.data;
  },

  /** Get managed team members for a specific customer-rep */
  getManagedTeam: async (repId) => {
    const res = await api(`/api/support/team/managed/${repId}`, "GET");
    if (!res?.ok) throw new Error(res?.message || "Failed to fetch managed team");
    return res.data?.data ?? res.data;
  },

  /** Add internal note to a ticket */
  addInternalNote: async (ticketId, data) => {
    const res = await api(`/api/support/ticket/${ticketId}/note`, "POST", data);
    if (!res?.ok) throw new Error(res?.message || "Failed to add note");
    return res.data?.data ?? res.data;
  },

  /** Get distinct tags for autocomplete */
  getTags: async () => {
    const res = await api("/api/support/tags", "GET");
    if (!res?.ok) throw new Error(res?.message || "Failed to fetch tags");
    return res.data?.data ?? res.data;
  },

  /** Get customer ticket history */
  getCustomerHistory: async (customerId) => {
    const res = await api(`/api/support/customer/${customerId}/history`, "GET");
    if (!res?.ok) throw new Error(res?.message || "Failed to fetch history");
    return res.data?.data ?? res.data;
  },

  /** Request deletion of a ticket */
  requestDeletion: async (ticketId, data) => {
    const res = await api(`/api/support/ticket/${ticketId}/delete-request`, "POST", data);
    if (!res?.ok) throw new Error(res?.message || "Failed to request deletion");
    return res.data?.data ?? res.data;
  },

  /** Team leader reviews a deletion request */
  reviewDeletion: async (ticketId, data) => {
    const res = await api(`/api/support/ticket/${ticketId}/delete-review`, "POST", data);
    if (!res?.ok) throw new Error(res?.message || "Failed to review deletion");
    return res.data?.data ?? res.data;
  },

  /** Get all pending deletion requests (team leaders) */
  getPendingDeletionRequests: async () => {
    const res = await api("/api/support/deletion-requests", "GET");
    if (!res?.ok) throw new Error(res?.message || "Failed to fetch deletion requests");
    return res.data?.data ?? res.data;
  },
  // ─── Canned Workflows ────────────────────────────────
  async getAllWorkflows(createdBy) {
    const params = createdBy ? `?createdBy=${createdBy}` : '';
    const res = await api(`/api/canned-workflows/all${params}`, 'GET');
    if (!res?.ok) throw new Error(res?.data?.error || 'Failed to fetch workflows');
    return res.data?.data || [];
  },
  async createWorkflow(data) {
    const res = await api('/api/canned-workflows/create', 'POST', data);
    if (!res?.ok) throw new Error(res?.data?.message || 'Failed to create workflow');
    return res.data?.data;
  },
  async updateWorkflow(id, data) {
    const res = await api(`/api/canned-workflows/${id}`, 'PUT', data);
    if (!res?.ok) throw new Error(res?.data?.message || 'Failed to update workflow');
    return res.data?.data;
  },
  async deleteWorkflow(id) {
    const res = await api(`/api/canned-workflows/${id}`, 'DELETE');
    if (!res?.ok) throw new Error(res?.data?.message || 'Failed to delete workflow');
    return res.data;
  },
  async toggleWorkflowActive(id) {
    const res = await api(`/api/canned-workflows/${id}/toggle`, 'PUT');
    if (!res?.ok) throw new Error(res?.data?.message || 'Failed to toggle workflow');
    return res.data?.data;
  },
  async duplicateWorkflow(id) {
    const res = await api(`/api/canned-workflows/${id}/duplicate`, 'POST');
    if (!res?.ok) throw new Error(res?.data?.message || 'Failed to duplicate workflow');
    return res.data?.data;
  },
  // ─── Escalation Rules ────────────────────────────────
  async getAllEscalationRules(createdBy) {
    const params = createdBy ? `?createdBy=${createdBy}` : '';
    const res = await api(`/api/escalation-rules/all${params}`, 'GET');
    if (!res?.ok) throw new Error(res?.data?.error || 'Failed to fetch escalation rules');
    return res.data?.data || [];
  },
  async createEscalationRule(data) {
    const res = await api('/api/escalation-rules/create', 'POST', data);
    if (!res?.ok) throw new Error(res?.data?.message || 'Failed to create rule');
    return res.data?.data;
  },
  async updateEscalationRule(id, data) {
    const res = await api(`/api/escalation-rules/${id}`, 'PUT', data);
    if (!res?.ok) throw new Error(res?.data?.message || 'Failed to update rule');
    return res.data?.data;
  },
  async deleteEscalationRule(id) {
    const res = await api(`/api/escalation-rules/${id}`, 'DELETE');
    if (!res?.ok) throw new Error(res?.data?.message || 'Failed to delete rule');
    return res.data;
  },
  async toggleEscalationRule(id) {
    const res = await api(`/api/escalation-rules/${id}/toggle`, 'PUT');
    if (!res?.ok) throw new Error(res?.data?.message || 'Failed to toggle rule');
    return res.data?.data;
  },
};

export default supportApi;
