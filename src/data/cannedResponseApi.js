import { api } from "@/lib/helper";

const cannedResponseApi = {
  /**
   * @param {string} userId
   * @param {{ type?: 'customer'|'qc', category?: string }} opts
   */
  getAll: async (userId, opts = {}) => {
    const params = new URLSearchParams();
    if (userId) params.set("userId", userId);
    if (opts.type) params.set("type", opts.type);
    if (opts.category) params.set("category", opts.category);
    const qs = params.toString();
    const res = await api(`/api/canned-responses${qs ? `?${qs}` : ""}`, "GET");
    if (!res?.ok) throw new Error(res?.message || "Failed to fetch templates");
    return res.data?.data ?? res.data;
  },

  /**
   * Auto-suggest QC templates ranked for a given detection.
   */
  suggest: async (userId, { detectionType, severity } = {}) => {
    const params = new URLSearchParams();
    if (userId) params.set("userId", userId);
    if (detectionType) params.set("detectionType", detectionType);
    if (severity) params.set("severity", severity);
    const res = await api(`/api/canned-responses/suggest?${params.toString()}`, "GET");
    if (!res?.ok) throw new Error(res?.message || "Failed to fetch suggestions");
    return res.data?.data ?? res.data;
  },

  getById: async (id) => {
    const res = await api(`/api/canned-responses/${id}`, "GET");
    if (!res?.ok) throw new Error(res?.message || "Failed to fetch template");
    return res.data?.data ?? res.data;
  },

  create: async (data) => {
    const res = await api("/api/canned-responses", "POST", data);
    if (!res?.ok) throw new Error(res?.message || "Failed to create template");
    return res.data?.data ?? res.data;
  },

  update: async (id, data) => {
    const res = await api(`/api/canned-responses/${id}`, "PUT", data);
    if (!res?.ok) throw new Error(res?.message || "Failed to update template");
    return res.data?.data ?? res.data;
  },

  delete: async (id) => {
    const res = await api(`/api/canned-responses/${id}`, "DELETE");
    if (!res?.ok) throw new Error(res?.message || "Failed to delete template");
    return res.data;
  },

  incrementUsage: async (id) => {
    const res = await api(`/api/canned-responses/${id}/increment-usage`, "PATCH");
    if (!res?.ok) throw new Error(res?.message || "Failed to increment usage");
    return res.data;
  },
};

export default cannedResponseApi;
