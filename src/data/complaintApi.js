import { api } from "@/lib/helper";

const complaintApi = {
  /** Get all complaints (admin / customer-rep) */
  getAllComplaints: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await api(`/api/complaints/all${query ? `?${query}` : ""}`, "GET");
    if (!res?.ok) throw new Error(res?.message || "Failed to fetch complaints");
    return res.data;
  },

  /** Get complaint stats */
  getStats: async () => {
    const res = await api("/api/complaints/stats", "GET");
    if (!res?.ok) throw new Error(res?.message || "Failed to fetch stats");
    return res.data?.data ?? res.data;
  },

  /** Get a single complaint */
  getById: async (complaintId) => {
    const res = await api(`/api/complaints/${complaintId}`, "GET");
    if (!res?.ok) throw new Error(res?.message || "Failed to fetch complaint");
    return res.data?.data ?? res.data;
  },

  /** Create a new complaint */
  create: async (data) => {
    const res = await api("/api/complaints/create", "POST", data);
    if (!res?.ok) throw new Error(res?.message || "Failed to create complaint");
    return res.data?.data ?? res.data;
  },

  /** Update a complaint */
  update: async (complaintId, data) => {
    const res = await api(`/api/complaints/${complaintId}`, "PUT", data);
    if (!res?.ok) throw new Error(res?.message || "Failed to update complaint");
    return res.data?.data ?? res.data;
  },

  /** Delete a complaint */
  delete: async (complaintId) => {
    const res = await api(`/api/complaints/${complaintId}`, "DELETE");
    if (!res?.ok) throw new Error(res?.message || "Failed to delete complaint");
    return res.data;
  },

  /** Add a note to a complaint */
  addNote: async (complaintId, data) => {
    const res = await api(`/api/complaints/${complaintId}/note`, "POST", data);
    if (!res?.ok) throw new Error(res?.message || "Failed to add note");
    return res.data?.data ?? res.data;
  },

  /** Create a ticket from a complaint */
  createTicket: async (complaintId, data) => {
    const res = await api(`/api/complaints/${complaintId}/create-ticket`, "POST", data);
    if (!res?.ok) throw new Error(res?.message || "Failed to create ticket");
    return res.data?.data ?? res.data;
  },

  /** Get complaints assigned to a rep */
  getAssigned: async (repId) => {
    const res = await api(`/api/complaints/assigned/${repId}`, "GET");
    if (!res?.ok) throw new Error(res?.message || "Failed to fetch assigned complaints");
    return res.data?.data ?? res.data;
  },

  // ── Customer-specific ──

  /** Get complaints for a specific customer */
  getCustomerComplaints: async (customerId) => {
    const res = await api(`/api/complaints/customer/${customerId}`, "GET");
    if (!res?.ok) throw new Error(res?.message || "Failed to fetch complaints");
    return res.data?.data ?? res.data;
  },

  /** Customer submits a new complaint */
  createCustomerComplaint: async (data) => {
    const res = await api("/api/complaints/customer/create", "POST", data);
    if (!res?.ok) throw new Error(res?.message || "Failed to submit complaint");
    return res.data?.data ?? res.data;
  },

  /** Upload a single complaint attachment, returns { url, filename, mimetype, size } */
  uploadAttachment: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api("/api/complaints/upload-attachment", "POST", formData);
    if (!res?.ok) throw new Error(res?.message || "Failed to upload file");
    return res.data?.data ?? res.data;
  },
};

export default complaintApi;
