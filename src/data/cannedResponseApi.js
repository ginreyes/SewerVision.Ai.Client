import { api } from "@/lib/helper";

const cannedResponseApi = {
  getAll: async (userId) => {
    const res = await api(`/api/canned-responses${userId ? `?userId=${userId}` : ""}`, "GET");
    if (!res?.ok) throw new Error(res?.message || "Failed to fetch templates");
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
