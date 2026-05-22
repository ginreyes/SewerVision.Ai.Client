"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser } from './UserContext';
import { useSocket } from './SocketProvider';
import notificationApi from '@/data/notificationApi';

const NotificationContext = createContext(undefined);

export const NotificationProvider = ({
  children,
  pollInterval = 120000  // Reduced from 30s to 120s — Socket.IO handles real-time
}) => {
  const { userId } = useUser();
  const socket = useSocket();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // `page` is passed explicitly so identity stays stable across pagination —
  // depending on `currentPage` here would re-create the callback every time
  // loadMore() bumps the page, which cascades into every consumer effect that
  // includes fetchNotifications in its deps.
  const fetchNotifications = useCallback(async (reset = false, pageOverride) => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const page = reset ? 1 : (pageOverride ?? 1);
      const response = await notificationApi.getNotifications(userId, {
        page,
        limit: 20,
      });

      const newNotifications = response.data.notifications;

      if (reset) {
        setNotifications(newNotifications);
        setCurrentPage(1);
      } else {
        setNotifications(prev => [...prev, ...newNotifications]);
      }

      setUnreadCount(response.data.unreadCount);
      setHasMore(response.data.pagination.hasMore);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    setCurrentPage(prev => prev + 1);
  }, [hasMore, isLoading]);

  useEffect(() => {
    if (currentPage > 1) {
      fetchNotifications(false, currentPage);
    }
  }, [currentPage, fetchNotifications]);

  const refreshUnreadCount = useCallback(async () => {
    if (!userId) return;
    
    try {
      const count = await notificationApi.getUnreadCount(userId);
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to refresh unread count:', err);
    }
  }, [userId]);

  const markAsRead = useCallback(async (notificationId) => {
    if (!userId) return;
    
    try {
      await notificationApi.markAsRead(notificationId, userId);
      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId ? { ...n, read: true, readAt: new Date().toISOString() } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [userId]);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;
    
    try {
      await notificationApi.markAllAsRead(userId);
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [userId]);

  // Reads `notifications` via the functional setter so the callback identity
  // stays stable — otherwise every incoming socket notification (which mutates
  // the array) would rebuild deleteNotification and re-render every consumer.
  const deleteNotification = useCallback(async (notificationId) => {
    if (!userId) return;

    try {
      await notificationApi.deleteNotification(notificationId, userId);
      setNotifications(prev => {
        const target = prev.find(n => n._id === notificationId);
        if (target && !target.read) {
          setUnreadCount(c => Math.max(0, c - 1));
        }
        return prev.filter(n => n._id !== notificationId);
      });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [userId]);

  const deleteAllNotifications = useCallback(async () => {
    if (!userId) return;
    
    try {
      await notificationApi.deleteAllNotifications(userId);
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [userId]);

  // Initial fetch
  useEffect(() => {
    if (userId) {
      fetchNotifications(true);
    }
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Poll for new notifications (fallback — Socket.IO is primary)
  useEffect(() => {
    if (!userId || pollInterval <= 0) return;
    const interval = setInterval(() => refreshUnreadCount(), pollInterval);
    return () => clearInterval(interval);
  }, [userId, pollInterval, refreshUnreadCount]);

  // Real-time Socket.IO listener
  useEffect(() => {
    if (!socket?.on || !userId) return;

    const handleNotification = (data) => {
      // Prepend new notification to list
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // High-priority pop-out: the AlertProvider sits below this provider in
      // the tree, so we publish via a CustomEvent rather than reaching into
      // a hook we can't call here. HighPriorityToastBridge (rendered inside
      // AlertProvider) consumes this and calls showAlert().
      if (data?.priority === 'high' && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('notification:high', { detail: data }));
      }
    };

    socket.on('notification', handleNotification);
    return () => socket.off?.('notification', handleNotification);
  }, [socket, userId]);

  // Rollup-aware count for the navbar bell. A rollup notification (e.g.
  // "5 new messages in {project}") should occupy one slot, not five. We
  // collapse unread rows into distinct buckets: each unread non-rollup
  // counts once, and each unread rollup row counts once (regardless of
  // its rollupCount). Falls back to the raw server count when the
  // notifications list hasn't loaded yet so the bell is never stuck
  // showing 0 on first paint.
  const distinctUnreadCount = React.useMemo(() => {
    if (!Array.isArray(notifications) || notifications.length === 0) {
      return unreadCount;
    }
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return 0;
    return unread.length;
  }, [notifications, unreadCount]);

  // Memoize the context value so consumers (NotificationCenter, the bell badge,
  // every page that calls useNotifications()) don't re-render on every parent
  // render — only when one of the actual fields changes.
  const value = React.useMemo(() => ({
    notifications,
    unreadCount,
    distinctUnreadCount,
    isLoading,
    error,
    hasMore,
    currentPage,
    fetchNotifications,
    loadMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    refreshUnreadCount,
  }), [
    notifications,
    unreadCount,
    distinctUnreadCount,
    isLoading,
    error,
    hasMore,
    currentPage,
    fetchNotifications,
    loadMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    refreshUnreadCount,
  ]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationProvider;