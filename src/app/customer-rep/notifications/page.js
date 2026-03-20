"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Bell,
  BellRing,
  CheckCheck,
  Clock,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUser } from "@/components/providers/UserContext";
import { useNotifications } from "@/components/providers/NotificationProvider";
import { useAlert } from "@/components/providers/AlertProvider";
import { api } from "@/lib/helper";

import NotificationItem from "@/components/customer-rep/notifications/NotificationItem";
import NotificationPreferences from "@/components/customer-rep/notifications/NotificationPreferences";

// ── Stat Card ──
const StatCard = ({ icon: Icon, value, label, color }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all">
    <div className="flex items-center justify-between">
      <div className={`p-2 rounded-lg bg-gradient-to-br ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
    <div className="mt-3">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

export default function CustomerRepNotifications() {
  const { userId } = useUser();
  const { showAlert } = useAlert();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications,
  } = useNotifications();

  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");

  // ── Notification preferences (local state + API) ──
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    push: true,
    ticketAssigned: true,
    ticketUpdated: true,
    newTicket: true,
  });

  // Load preferences
  useEffect(() => {
    if (!userId) return;
    const loadPrefs = async () => {
      try {
        const res = await api(`/api/notifications/preferences/${userId}`, "GET");
        if (res?.ok && res.data) {
          setPreferences((prev) => ({
            ...prev,
            ...res.data,
          }));
        }
      } catch (err) {
        console.error("Error loading preferences:", err);
      }
    };
    loadPrefs();
  }, [userId]);

  // Fetch notifications on mount
  useEffect(() => {
    if (userId) fetchNotifications(true);
  }, [userId, fetchNotifications]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications(true);
    setRefreshing(false);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
    } catch (err) {
      console.error("Error marking as read:", err);
      showAlert("Failed to mark notification as read", "error");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      showAlert("All notifications marked as read", "success");
    } catch (err) {
      console.error("Error marking all as read:", err);
      showAlert("Failed to mark notifications as read", "error");
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      showAlert("Notification deleted", "success");
    } catch (err) {
      console.error("Error deleting notification:", err);
      showAlert("Failed to delete notification", "error");
    }
  };

  const togglePreference = async (key) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };
    setPreferences(newPreferences);
    try {
      await api(`/api/notifications/preferences/${userId}`, "PUT", newPreferences);
      showAlert("Preferences updated", "success");
    } catch (err) {
      console.error("Error updating preferences:", err);
      showAlert("Failed to update preferences", "error");
      // Revert on failure
      setPreferences(preferences);
    }
  };

  const filteredNotifications = useMemo(() => {
    if (filter === "unread") return notifications.filter((n) => !n.read);
    return notifications;
  }, [notifications, filter]);

  const todayCount = useMemo(() => {
    const today = new Date().toDateString();
    return notifications.filter(
      (n) => new Date(n.createdAt).toDateString() === today
    ).length;
  }, [notifications]);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-md">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
                {unreadCount > 0 && (
                  <Badge className="bg-teal-100 text-teal-700 border-teal-200 text-xs">
                    {unreadCount} new
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-500">
                Stay updated on ticket activity and alerts
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleMarkAllAsRead}
              variant="outline"
              size="sm"
              disabled={unreadCount === 0}
              className="gap-2"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </Button>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={Bell}
            value={notifications.length}
            label="Total"
            color="from-teal-500 to-teal-600"
          />
          <StatCard
            icon={BellRing}
            value={unreadCount}
            label="Unread"
            color="from-red-500 to-rose-600"
          />
          <StatCard
            icon={Clock}
            value={todayCount}
            label="Today"
            color="from-amber-500 to-orange-600"
          />
          <StatCard
            icon={CheckCheck}
            value={notifications.length - unreadCount}
            label="Read"
            color="from-green-500 to-emerald-600"
          />
        </div>

        {/* ── Main Content ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notifications List */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Bell className="w-5 h-5 text-teal-600" />
                    Recent Notifications
                  </CardTitle>
                  <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
                    <button
                      onClick={() => setFilter("all")}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        filter === "all"
                          ? "bg-white shadow-sm text-gray-900"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilter("unread")}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        filter === "unread"
                          ? "bg-white shadow-sm text-gray-900"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Unread
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="font-medium text-gray-900 mb-1">
                      {filter === "unread" ? "All caught up!" : "No notifications"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {filter === "unread"
                        ? "You have no unread notifications"
                        : "Notifications will appear here when tickets are updated"}
                    </p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => (
                    <NotificationItem
                      key={notification._id}
                      notification={notification}
                      onMarkRead={handleMarkAsRead}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Settings Panel */}
          <NotificationPreferences
            preferences={preferences}
            onToggle={togglePreference}
          />
        </div>
      </div>
    </div>
  );
}
