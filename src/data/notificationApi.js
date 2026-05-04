"use client";

import { api } from "@/lib/helper";

/**
 * Notification API functions
 */
export const notificationApi = {
  /**
   * Get all notifications for a user
   */
  async getNotifications(userId, options = {}) {
    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.unreadOnly) params.append('unreadOnly', options.unreadOnly.toString());
    if (options.type) params.append('type', options.type);

    const queryString = params.toString();
    const url = `/api/notifications/user/${userId}${queryString ? `?${queryString}` : ''}`;
    
    const response = await api(url, 'GET');
    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }
    return response.data;
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId) {
    const response = await api(`/api/notifications/user/${userId}/unread-count`, 'GET');
    if (!response.ok) {
      throw new Error('Failed to fetch unread count');
    }
    return response.data.data.unreadCount;
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId, userId) {
    const response = await api(`/api/notifications/${notificationId}/read`, 'PATCH', {
      user_id: userId,
    });
    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId) {
    const response = await api(`/api/notifications/user/${userId}/read-all`, 'PATCH');
    if (!response.ok) {
      throw new Error('Failed to mark all notifications as read');
    }
    return response.data.data.modifiedCount;
  },

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId, userId) {
    const response = await api(`/api/notifications/${notificationId}`, 'DELETE', {
      user_id: userId,
    });
    if (!response.ok) {
      throw new Error('Failed to delete notification');
    }
  },

  /**
   * Delete all notifications
   */
  async deleteAllNotifications(userId) {
    const response = await api(`/api/notifications/user/${userId}/clear-all`, 'DELETE');
    if (!response.ok) {
      throw new Error('Failed to delete all notifications');
    }
    return response.data.data.deletedCount;
  },

  /**
   * Toggle conversation mute (chat-* notifications get suppressed for muted convs).
   */
  async toggleConversationMute(userId, conversationId) {
    const response = await api(
      `/api/notifications/user/${userId}/mute-conversation`,
      'POST',
      { conversationId }
    );
    if (!response.ok) throw new Error('Failed to toggle mute');
    return response.data.data;
  },

  /**
   * Set/clear snooze. Pass null to clear.
   */
  async setSnooze(userId, snoozedUntil) {
    const response = await api(
      `/api/notifications/user/${userId}/snooze`,
      'PUT',
      { snoozedUntil: snoozedUntil ? new Date(snoozedUntil).toISOString() : null }
    );
    if (!response.ok) throw new Error('Failed to set snooze');
    return response.data.data;
  },

  /**
   * Roll-up grouped by project for the panel grouped view.
   */
  async getGrouped(userId, limit = 10) {
    const response = await api(
      `/api/notifications/user/${userId}/grouped?limit=${limit}`,
      'GET'
    );
    if (!response.ok) throw new Error('Failed to fetch grouped notifications');
    return response.data.data.groups || [];
  },
};

export default notificationApi;