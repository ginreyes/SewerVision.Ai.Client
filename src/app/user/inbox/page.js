'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import {
  Inbox, Bell, Trash2, Check, Loader2,
  CheckCheck, Search, X,
} from 'lucide-react';
import { useUser } from '@/components/providers/UserContext';
import notificationApi from '@/data/notificationApi ';
import { useUserInbox, useUserUnreadCount } from '@/hooks/useQueryHooks';
import ChatBubble from '@/components/user/inbox/ChatBubble';
import DateSeparator from '@/components/user/inbox/DateSeparator';
import { typeConfig, getDateLabel } from '@/components/user/inbox/inboxConfig';

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════ */
export default function UserInboxPage() {
  const { userId } = useUser();
  const router = useRouter();
  const scrollRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [busy, setBusy] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // TanStack Query: notifications list + unread count
  const {
    data: inboxData,
    isLoading: inboxLoading,
  } = useUserInbox(userId, {
    page: 1,
    limit: 50,
    unreadOnly: filterUnreadOnly,
    type: filterType !== 'all' ? filterType : undefined,
  });

  const {
    data: unreadData,
    isLoading: unreadLoading,
  } = useUserUnreadCount(userId);

  useEffect(() => {
    if (inboxData) {
      setNotifications(inboxData?.data?.notifications || inboxData?.notifications || []);
    }
  }, [inboxData]);

  useEffect(() => {
    if (typeof unreadData === 'number') {
      setUnreadCount(unreadData);
    }
  }, [unreadData]);

  useEffect(() => {
    setLoading(inboxLoading || unreadLoading);
  }, [inboxLoading, unreadLoading]);

  const handleOpen = (item) => {
    if (item.actionUrl) {
      if (item.actionUrl.startsWith('/')) {
        router.push(item.actionUrl);
      } else {
        window.open(item.actionUrl, '_blank');
      }
    }
  };

  const handleMarkRead = async (item) => {
    if (!userId || item.read) return;
    try {
      setBusy(true);
      await notificationApi.markAsRead(item._id, userId);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === item._id ? { ...n, read: true, readAt: new Date().toISOString() } : n
        )
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (item) => {
    if (!userId) return;
    try {
      setBusy(true);
      await notificationApi.deleteNotification(item._id, userId);
      setNotifications((prev) => prev.filter((n) => n._id !== item._id));
      if (!item.read) setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    } finally {
      setBusy(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!userId || unreadCount === 0) return;
    try {
      setBusy(true);
      await notificationApi.markAllAsRead(userId);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true, readAt: n.readAt || new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    } finally {
      setBusy(false);
    }
  };

  const handleClearAll = async () => {
    if (!userId || notifications.length === 0) return;
    try {
      setBusy(true);
      await notificationApi.deleteAllNotifications(userId);
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    } finally {
      setBusy(false);
    }
  };

  /* ─── Filter + search ─── */
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return notifications;
    const q = searchQuery.toLowerCase();
    return notifications.filter(
      (n) =>
        n.title?.toLowerCase().includes(q) ||
        n.message?.toLowerCase().includes(q) ||
        n.projectId?.name?.toLowerCase().includes(q)
    );
  }, [notifications, searchQuery]);

  /* ─── Group by date ─── */
  const grouped = useMemo(() => {
    const groups = [];
    let currentLabel = '';

    filtered.forEach((n, i) => {
      const label = getDateLabel(n.createdAt);
      if (label !== currentLabel) {
        groups.push({ type: 'date', label });
        currentLabel = label;
      }
      // Check if consecutive same type (for avatar grouping)
      const prev = i > 0 ? filtered[i - 1] : null;
      const isConsecutive =
        prev &&
        prev.type === n.type &&
        getDateLabel(prev.createdAt) === label;
      groups.push({ type: 'notification', data: n, isConsecutive });
    });

    return groups;
  }, [filtered]);

  const typeFilters = ['all', ...Object.keys(typeConfig)];

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-3xl mx-auto">

      {/* ─── Chat header ─── */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-lg">
                <Inbox className="w-5 h-5" />
              </div>
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Inbox</h1>
              <p className="text-xs text-gray-400">
                {loading
                  ? 'Loading...'
                  : unreadCount > 0
                    ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                    : 'All caught up'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`p-2 rounded-full transition-colors ${
                searchOpen ? 'bg-rose-50 text-rose-600' : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <Search className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={handleMarkAllAsRead}
              disabled={busy || unreadCount === 0}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 disabled:opacity-30 transition-colors"
              title="Mark all as read"
            >
              <CheckCheck className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={handleClearAll}
              disabled={busy || notifications.length === 0}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 disabled:opacity-30 transition-colors"
              title="Clear all"
            >
              <Trash2 className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Search bar (collapsible) */}
        {searchOpen && (
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications..."
              autoFocus
              className="w-full pl-9 pr-9 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Type filter pills */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {typeFilters.map((t) => {
            const isActive = filterType === t;
            const cfg = typeConfig[t];
            return (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t === 'all' ? 'All' : cfg?.label || t}
              </button>
            );
          })}
          <button
            onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filterUnreadOnly
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Unread
          </button>
        </div>
      </div>

      {/* ─── Chat body (scrollable) ─── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-gray-100/50 py-3"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
              <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
            </div>
            <p className="text-sm font-medium text-gray-700">Loading messages</p>
            <p className="text-xs text-gray-400 mt-1">Please wait...</p>
          </div>
        ) : grouped.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
              <Bell className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-700">
              {searchQuery ? 'No matches found' : "You're all caught up"}
            </p>
            <p className="text-xs text-gray-400 mt-1 text-center max-w-[240px]">
              {searchQuery
                ? 'Try a different search term'
                : "New notifications will appear here like messages in a chat"}
            </p>
          </div>
        ) : (
          grouped.map((item, i) => {
            if (item.type === 'date') {
              return <DateSeparator key={`date-${i}`} label={item.label} />;
            }
            return (
              <ChatBubble
                key={item.data._id}
                item={item.data}
                onOpen={handleOpen}
                onMarkRead={handleMarkRead}
                onDelete={handleDelete}
                isConsecutive={item.isConsecutive}
              />
            );
          })
        )}
      </div>

      {/* ─── Bottom bar (summary) ─── */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 py-2.5">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {filtered.length} notification{filtered.length !== 1 ? 's' : ''}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}