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
};

export default supportApi;
