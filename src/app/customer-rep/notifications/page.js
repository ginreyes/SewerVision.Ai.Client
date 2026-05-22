"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/components/providers/UserContext";
import { useNotifications } from "@/components/providers/NotificationProvider";
import { useAlert } from "@/components/providers/AlertProvider";
import { api } from "@/lib/helper";

import NotificationCenter from "@/components/shared/NotificationCenter";
import NotificationPreferences from "@/components/customer-rep/notifications/NotificationPreferences";

export default function CustomerRepNotifications() {
  const { userId } = useUser();
  const { showAlert } = useAlert();
  const { fetchNotifications } = useNotifications();

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

  // Fetch notifications on mount — fetchNotifications is a stable callback
  // from NotificationProvider; including it in deps would re-trigger this
  // effect on every pagination change upstream.
  useEffect(() => {
    if (userId) fetchNotifications(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

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

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <NotificationCenter role="customer-rep" showStats showRefresh>
          <NotificationPreferences
            preferences={preferences}
            onToggle={togglePreference}
          />
        </NotificationCenter>
      </div>
    </div>
  );
}
