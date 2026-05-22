"use client";

/**
 * HighPriorityToastBridge — translates the 'notification:high' window event
 * emitted by NotificationProvider into a showAlert() call on AlertProvider.
 *
 * This bridge exists because AlertProvider sits BELOW NotificationProvider in
 * the AppProviders tree, so the notification socket handler can't call
 * useAlert() directly. The window event keeps the two providers loosely
 * coupled while still letting high-priority chat notifications pop a
 * transient toast (the Phase C messenger UI goal from May 11's plan).
 */

import { useEffect } from "react";
import { useAlert } from "./AlertProvider";

const HIGH_PRIORITY_TOAST_DURATION_MS = 8000;

export default function HighPriorityToastBridge() {
  const { showAlert } = useAlert();

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handler = (event) => {
      const n = event?.detail;
      if (!n) return;
      const title = n.title || "New notification";
      const summary = formatRollupSummary(n);
      showAlert(`${title}${summary ? ` — ${summary}` : ""}`, "info", HIGH_PRIORITY_TOAST_DURATION_MS);
    };
    window.addEventListener("notification:high", handler);
    return () => window.removeEventListener("notification:high", handler);
  }, [showAlert]);

  return null;
}

function formatRollupSummary(notification) {
  const count = notification?.rollupCount;
  if (typeof count === "number" && count > 1) {
    const projectName = notification?.projectName || notification?.metadata?.projectName;
    return projectName ? `${count} new in ${projectName}` : `${count} new`;
  }
  return notification?.message || "";
}
