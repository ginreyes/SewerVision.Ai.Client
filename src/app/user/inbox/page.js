'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Inbox, Bell, Filter, Trash2, Check, Loader2, ExternalLink,
  CheckCheck, MoreHorizontal, ChevronDown, Search, X,
  FileText, Zap, Activity, Shield, AlertTriangle, Settings,
} from 'lucide-react';
import { useUser } from '@/components/providers/UserContext';
import notificationApi from '@/data/notificationApi ';

/* ─── Type config with icons and avatar colors ─── */
const typeConfig = {
  report_ready: {
    label: 'Report',
    color: 'bg-emerald-50 text-emerald-700',
    avatar: 'from-emerald-400 to-teal-500',
    icon: FileText,
  },
  ai_complete: {
    label: 'AI',
    color: 'bg-indigo-50 text-indigo-700',
    avatar: 'from-indigo-400 to-violet-500',
    icon: Zap,
  },
  status_update: {
    label: 'Update',
    color: 'bg-sky-50 text-sky-700',
    avatar: 'from-sky-400 to-blue-500',
    icon: Activity,
  },
  system: {
    label: 'System',
    color: 'bg-slate-50 text-slate-700',
    avatar: 'from-slate-400 to-gray-500',
    icon: Settings,
  },
  qc_review: {
    label: 'QC',
    color: 'bg-purple-50 text-purple-700',
    avatar: 'from-purple-400 to-fuchsia-500',
    icon: Shield,
  },
  defect_found: {
    label: 'Defect',
    color: 'bg-rose-50 text-rose-700',
    avatar: 'from-rose-400 to-pink-500',
    icon: AlertTriangle,
  },
};

/* ─── Date grouping helper ─── */
const getDateLabel = (dateStr) => {
  if (!dateStr) return 'Unknown';
  const d = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const msgDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (msgDate.getTime() === today.getTime()) return 'Today';
  if (msgDate.getTime() === yesterday.getTime()) return 'Yesterday';

  const diffDays = Math.floor((today.getTime() - msgDate.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) return d.toLocaleDateString('en-US', { weekday: 'long' });

  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getTimeLabel = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

/* ─── Chat bubble component ─── */
function ChatBubble({ item, onOpen, onMarkRead, onDelete, isConsecutive }) {
  const [showActions, setShowActions] = useState(false);
  const cfg = typeConfig[item.type] || typeConfig.system;
  const Icon = cfg.icon;

  return (
    <div
      className="group relative flex items-start gap-2.5 px-4 py-1"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar — only show if not consecutive from same type */}
      <div className="w-9 flex-shrink-0 pt-1">
        {!isConsecutive ? (
          <div
            className={`w-9 h-9 rounded-full bg-gradient-to-br ${cfg.avatar} flex items-center justify-center shadow-md`}
          >
            <Icon className="w-4 h-4 text-white" />
          </div>
        ) : (
          <div className="w-9" />
        )}
      </div>

      {/* Bubble */}
      <div className="flex-1 min-w-0 max-w-[85%]">
        {/* Sender label — only on first of consecutive */}
        {!isConsecutive && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-gray-700">{cfg.label}</span>
            {item.projectId?.name && (
              <span className="text-[10px] text-gray-400">
                in {item.projectId.name}
              </span>
            )}
          </div>
        )}

        <button
          onClick={() => onOpen(item)}
          className={`text-left w-full rounded-2xl px-4 py-2.5 transition-all relative ${
            item.read
              ? 'bg-gray-100 hover:bg-gray-150'
              : 'bg-white border border-rose-100 shadow-sm hover:shadow-md'
          }`}
          style={{
            borderTopLeftRadius: isConsecutive ? '0.75rem' : '0.25rem',
          }}
        >
          {/* Unread indicator */}
          {!item.read && (
            <div className="absolute -left-1 top-3 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          )}

          {/* Title */}
          <p className={`text-sm leading-snug ${item.read ? 'text-gray-700' : 'text-gray-900 font-medium'}`}>
            {item.title}
          </p>

          {/* Message body */}
          <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-3">
            {item.message}
          </p>

          {/* Bottom row: badge + time + link indicator */}
          <div className="flex items-center gap-2 mt-2">
            <Badge
              variant="outline"
              className={`text-[10px] font-medium border-0 px-1.5 py-0 ${cfg.color}`}
            >
              {cfg.label}
            </Badge>
            <span className="text-[10px] text-gray-400">
              {getTimeLabel(item.createdAt)}
            </span>
            {item.read && (
              <CheckCheck className="w-3 h-3 text-sky-400 ml-auto" />
            )}
            {item.actionUrl && !item.read && (
              <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
            )}
          </div>
        </button>
      </div>

      {/* Hover actions */}
      <div
        className={`absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-0.5 bg-white border border-gray-200 rounded-lg shadow-lg px-1 py-0.5 transition-all ${
          showActions ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        {!item.read && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkRead(item);
            }}
            className="p-1.5 rounded-md hover:bg-emerald-50 text-emerald-600 transition-colors"
            title="Mark as read"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item);
          }}
          className="p-1.5 rounded-md hover:bg-rose-50 text-rose-500 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ─── Date separator ─── */
function DateSeparator({ label }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-2">
        {label}
      </span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

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

  const loadData = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [listData, unread] = await Promise.all([
        notificationApi.getNotifications(userId, {
          page: 1,
          limit: 50,
          unreadOnly: filterUnreadOnly,
          type: filterType !== 'all' ? filterType : undefined,
        }),
        notificationApi.getUnreadCount(userId),
      ]);
      setNotifications(listData?.data?.notifications || []);
      setUnreadCount(unread ?? 0);
    } catch (err) {
      console.error('Error loading inbox:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, filterUnreadOnly, filterType]);

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