"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser } from './UserContext';
import notificationApi from '@/data/notificationApi ';

const NotificationContext = createContext(undefined);

export const NotificationProvider = ({ 
  children,
  pollInterval = 30000 
}) => {
  const { userId } = useUser();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchNotifications = useCallback(async (reset = false) => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const page = reset ? 1 : currentPage;
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
  }, [userId, currentPage]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    setCurrentPage(prev => prev + 1);
  }, [hasMore, isLoading]);

  useEffect(() => {
    if (currentPage > 1) {
      fetchNotifications(false);
    }
  }, [currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const deleteNotification = useCallback(async (notificationId) => {
    if (!userId) return;
    
    try {
      const notification = notifications.find(n => n._id === notificationId);
      await notificationApi.deleteNotification(notificationId, userId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [userId, notifications]);

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

  // Poll for new notifications
  useEffect(() => {
    if (!userId || pollInterval <= 0) return;

    const interval = setInterval(() => {
      refreshUnreadCount();
    }, pollInterval);

    return () => clearInterval(interval);
  }, [userId, pollInterval, refreshUnreadCount]);

  const value = {
    notifications,
    unreadCount,
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
  };

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