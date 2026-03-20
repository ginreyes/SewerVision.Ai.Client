import { api } from "@/lib/helper";

const messageApi = {
  getInbox: async (userId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await api(`/api/messages/inbox/${userId}${query ? `?${query}` : ""}`, "GET");
    if (!res?.ok) throw new Error(res?.message || "Failed to fetch inbox");
    return res.data;
  },

  getSent: async (userId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await api(`/api/messages/sent/${userId}${query ? `?${query}` : ""}`, "GET");
    if (!res?.ok) throw new Error(res?.message || "Failed to fetch sent");
    return res.data;
  },

  getThread: async (threadId) => {
    const res = await api(`/api/messages/thread/${threadId}`, "GET");
    if (!res?.ok) throw new Error(res?.message || "Failed to fetch thread");
    return res.data?.data ?? res.data;
  },

  send: async (data) => {
    const res = await api("/api/messages/send", "POST", data);
    if (!res?.ok) throw new Error(res?.message || "Failed to send message");
    return res.data?.data ?? res.data;
  },

  markAsRead: async (messageId) => {
    const res = await api(`/api/messages/${messageId}/read`, "PATCH");
    if (!res?.ok) throw new Error(res?.message || "Failed to mark as read");
    return res.data;
  },

  toggleStar: async (messageId) => {
    const res = await api(`/api/messages/${messageId}/star`, "PATCH");
    if (!res?.ok) throw new Error(res?.message || "Failed to toggle star");
    return res.data?.data ?? res.data;
  },

  archive: async (messageId) => {
    const res = await api(`/api/messages/${messageId}/archive`, "PATCH");
    if (!res?.ok) throw new Error(res?.message || "Failed to archive");
    return res.data;
  },

  delete: async (messageId) => {
    const res = await api(`/api/messages/${messageId}`, "DELETE");
    if (!res?.ok) throw new Error(res?.message || "Failed to delete");
    return res.data;
  },

  getUnreadCount: async (userId) => {
    const res = await api(`/api/messages/unread-count/${userId}`, "GET");
    if (!res?.ok) throw new Error(res?.message || "Failed to get unread count");
    return res.data?.data ?? res.data;
  },

  markAllAsRead: async (userId) => {
    const res = await api(`/api/messages/mark-all-read/${userId}`, "PATCH");
    if (!res?.ok) throw new Error(res?.message || "Failed to mark all as read");
    return res.data;
  },

  getContacts: async (userId) => {
    const res = await api(`/api/messages/contacts/${userId}`, "GET");
    if (!res?.ok) throw new Error(res?.message || "Failed to fetch contacts");
    return res.data?.data ?? res.data;
  },
};

export default messageApi;
