import { api } from "@/lib/helper";

/**
 * REST wrappers for the team-internal project chat endpoints
 * (backend: src/routes/projectConversation.ts).
 */
const projectChatApi = {
  listMine: async () => {
    const res = await api(`/api/project-conversations`, "GET");
    if (!res?.ok) throw new Error(res?.message || "Failed to list conversations");
    return res.data?.data ?? [];
  },

  listForProject: async (projectId) => {
    const res = await api(`/api/project-conversations/project/${projectId}`, "GET");
    if (!res?.ok) throw new Error(res?.message || "Failed to list project conversations");
    return res.data?.data ?? [];
  },

  getMessages: async (conversationId, { page = 1, limit = 50 } = {}) => {
    const res = await api(
      `/api/project-conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
      "GET"
    );
    if (!res?.ok) throw new Error(res?.message || "Failed to fetch messages");
    return {
      messages: res.data?.data ?? [],
      pagination: res.data?.pagination ?? { page, limit, total: 0, hasMore: false },
    };
  },

  sendMessage: async (conversationId, { text, attachments } = {}) => {
    const res = await api(
      `/api/project-conversations/${conversationId}/messages`,
      "POST",
      { text, attachments }
    );
    if (!res?.ok) throw new Error(res?.message || "Failed to send message");
    return res.data?.data ?? res.data;
  },

  editMessage: async (messageId, text) => {
    const res = await api(`/api/project-conversations/messages/${messageId}`, "PUT", { text });
    if (!res?.ok) throw new Error(res?.message || "Failed to edit message");
    return res.data?.data ?? res.data;
  },

  deleteMessage: async (messageId) => {
    const res = await api(`/api/project-conversations/messages/${messageId}`, "DELETE");
    if (!res?.ok) throw new Error(res?.message || "Failed to delete message");
    return res.data;
  },

  reactToMessage: async (messageId, emoji) => {
    const res = await api(
      `/api/project-conversations/messages/${messageId}/react`,
      "POST",
      { emoji }
    );
    if (!res?.ok) throw new Error(res?.message || "Failed to react");
    return res.data?.data ?? res.data;
  },

  uploadAttachment: async (file) => {
    // Direct fetch — `api()` is JSON-only. Mirrors how customer chat uploads.
    const { getCookie } = await import("@/lib/helper");
    const token = getCookie("token");
    const fd = new FormData();
    fd.append("file", file);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
    const res = await fetch(`${backendUrl}/api/project-conversations/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
      body: fd,
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`Upload failed (HTTP ${res.status}) ${txt.slice(0, 200)}`);
    }
    const json = await res.json();
    return json?.data;
  },

  markAsRead: async (conversationId) => {
    const res = await api(`/api/project-conversations/${conversationId}/read`, "PATCH");
    if (!res?.ok) throw new Error(res?.message || "Failed to mark read");
    return res.data?.data ?? res.data;
  },

  openDm: async (projectId, otherUserId) => {
    const res = await api(`/api/project-conversations/dm`, "POST", {
      projectId,
      otherUserId,
    });
    if (!res?.ok) throw new Error(res?.message || "Failed to open DM");
    return res.data?.data ?? res.data;
  },

  getUnreadTotal: async () => {
    const res = await api(`/api/project-conversations/unread-total`, "GET");
    if (!res?.ok) throw new Error(res?.message || "Failed to fetch unread total");
    return res.data?.data?.unreadTotal ?? 0;
  },
};

export default projectChatApi;
