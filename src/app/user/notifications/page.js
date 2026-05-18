'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Check,
  Mail,
  Loader2,
  Trash2,
  Inbox,
  CheckCheck,
  Search,
  X,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useUser } from '@/components/providers/UserContext';
import { useNotifications } from '@/components/providers/NotificationProvider';
import { useAlert } from '@/components/providers/AlertProvider';
import { api } from '@/lib/helper';
import { useUserInbox, useUserUnreadCount } from '@/hooks/useQueryHooks';
import notificationApi from '@/data/notificationApi';
import ChatBubble from '@/components/user/inbox/ChatBubble';
import DateSeparator from '@/components/user/inbox/DateSeparator';
import { typeConfig, getDateLabel } from '@/components/user/inbox/inboxConfig';
import NotificationCenter from '@/components/shared/NotificationCenter';
import ChatNotificationPreferences from '@/components/shared/notifications/ChatNotificationPreferences';

const NotificationPageTeamLeader = () => {
  const { userId } = useUser();
  const { showAlert } = useAlert();
  const router = useRouter();
  const scrollRef = useRef(null);
  const {
    unreadCount,
    fetchNotifications,
  } = useNotifications();

  // ── Messages (Inbox) state ──
  const [inboxLoading, setInboxLoading] = useState(true);
  const [inboxNotifications, setInboxNotifications] = useState([]);
  const [inboxUnreadCount, setInboxUnreadCount] = useState(0);
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [inboxBusy, setInboxBusy] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: inboxData,
    isLoading: inboxQueryLoading,
  } = useUserInbox(userId, {
    page: 1,
    limit: 50,
    unreadOnly: filterUnreadOnly,
    type: filterType !== 'all' ? filterType : undefined,
  });

  const {
    data: unreadData,
    isLoading: unreadQueryLoading,
  } = useUserUnreadCount(userId);

  useEffect(() => {
    if (inboxData) {
      setInboxNotifications(inboxData?.data?.notifications || inboxData?.notifications || []);
    }
  }, [inboxData]);

  useEffect(() => {
    if (typeof unreadData === 'number') {
      setInboxUnreadCount(unreadData);
    }
  }, [unreadData]);

  useEffect(() => {
    setInboxLoading(inboxQueryLoading || unreadQueryLoading);
  }, [inboxQueryLoading, unreadQueryLoading]);

  const handleInboxOpen = (item) => {
    if (item.actionUrl) {
      if (item.actionUrl.startsWith('/')) {
        router.push(item.actionUrl);
      } else {
        window.open(item.actionUrl, '_blank');
      }
    }
  };

  const handleInboxMarkRead = async (item) => {
    if (!userId || item.read) return;
    try {
      setInboxBusy(true);
      await notificationApi.markAsRead(item._id, userId);
      setInboxNotifications((prev) =>
        prev.map((n) =>
          n._id === item._id ? { ...n, read: true, readAt: new Date().toISOString() } : n
        )
      );
      setInboxUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    } finally {
      setInboxBusy(false);
    }
  };

  const handleInboxDelete = async (item) => {
    if (!userId) return;
    try {
      setInboxBusy(true);
      await notificationApi.deleteNotification(item._id, userId);
      setInboxNotifications((prev) => prev.filter((n) => n._id !== item._id));
      if (!item.read) setInboxUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    } finally {
      setInboxBusy(false);
    }
  };

  const handleInboxMarkAllAsRead = async () => {
    if (!userId || inboxUnreadCount === 0) return;
    try {
      setInboxBusy(true);
      await notificationApi.markAllAsRead(userId);
      setInboxNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true, readAt: n.readAt || new Date().toISOString() }))
      );
      setInboxUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    } finally {
      setInboxBusy(false);
    }
  };

  const handleInboxClearAll = async () => {
    if (!userId || inboxNotifications.length === 0) return;
    try {
      setInboxBusy(true);
      await notificationApi.deleteAllNotifications(userId);
      setInboxNotifications([]);
      setInboxUnreadCount(0);
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    } finally {
      setInboxBusy(false);
    }
  };

  const filteredInbox = useMemo(() => {
    if (!searchQuery.trim()) return inboxNotifications;
    const q = searchQuery.toLowerCase();
    return inboxNotifications.filter(
      (n) =>
        n.title?.toLowerCase().includes(q) ||
        n.message?.toLowerCase().includes(q) ||
        n.projectId?.name?.toLowerCase().includes(q)
    );
  }, [inboxNotifications, searchQuery]);

  const groupedInbox = useMemo(() => {
    const groups = [];
    let currentLabel = '';
    filteredInbox.forEach((n, i) => {
      const label = getDateLabel(n.createdAt);
      if (label !== currentLabel) {
        groups.push({ type: 'date', label });
        currentLabel = label;
      }
      const prev = i > 0 ? filteredInbox[i - 1] : null;
      const isConsecutive =
        prev &&
        prev.type === n.type &&
        getDateLabel(prev.createdAt) === label;
      groups.push({ type: 'notification', data: n, isConsecutive });
    });
    return groups;
  }, [filteredInbox]);

  const inboxTypeFilters = ['all', ...Object.keys(typeConfig)];

  // ── Notification Preferences ──
  const [preferences, setPreferences] = useState({
    email: true,
    push: true,
    reportReady: true,
    aiComplete: true,
    statusUpdate: true,
    taskAssignment: true,
    deleteRequest: true,
    chatMention: true,
    chatReply: true,
    chatPin: true,
    chatMessage: false,
    chatReaction: false,
  });

  // Intentionally omits fetchNotifications from deps — it's a stable callback
  // from NotificationProvider, and including it would re-trigger the initial
  // fetch every time pagination changes upstream.
  useEffect(() => {
    if (userId) {
      fetchNotifications(true);
      const loadPreferences = async () => {
        try {
          const response = await api(`/api/notifications/preferences/${userId}`, 'GET');
          if (response.ok && response.data?.data) {
            const prefs = response.data.data;
            setPreferences({
              email: prefs.email ?? true,
              push: prefs.push ?? true,
              reportReady: prefs.reportReady ?? true,
              aiComplete: prefs.aiComplete ?? true,
              statusUpdate: prefs.statusUpdate ?? true,
              taskAssignment: prefs.taskAssignment ?? true,
              deleteRequest: prefs.deleteRequest ?? true,
              chatMention: prefs.chatMention ?? true,
              chatReply: prefs.chatReply ?? true,
              chatPin: prefs.chatPin ?? true,
              chatMessage: prefs.chatMessage ?? false,
              chatReaction: prefs.chatReaction ?? false,
            });
          }
        } catch (err) {
          console.warn('Could not load notification preferences:', err);
        }
      };
      loadPreferences();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const togglePreference = async (key) => {
    // Snapshot the previous value BEFORE the optimistic update so the
    // rollback path doesn't read a stale closure if multiple toggles fire
    // in quick succession (the original code re-saved `preferences` from
    // the closure, which already pointed at the new state by the time the
    // catch block ran).
    const previous = preferences;
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };

    setPreferences(newPreferences);

    try {
      const response = await api(`/api/notifications/preferences/${userId}`, 'PUT', newPreferences);
      if (response.ok) {
        showAlert('Preferences updated', 'success');
      } else {
        throw new Error(response.data?.message || 'Failed to update');
      }
    } catch (err) {
      console.error('Error updating preferences:', err);
      showAlert('Failed to update preferences', 'error');
      setPreferences(previous);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Notifications & Messages
            {(unreadCount > 0 || inboxUnreadCount > 0) && (
              <Badge className="ml-2 bg-indigo-600 hover:bg-indigo-700">
                {unreadCount + inboxUnreadCount}
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground">Manage alerts, messages, and view recent updates</p>
        </div>
      </div>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            System Notifications
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-1 bg-indigo-100 text-indigo-700 text-xs px-1.5 py-0">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            Messages
            {inboxUnreadCount > 0 && (
              <Badge variant="secondary" className="ml-1 bg-purple-100 text-purple-700 text-xs px-1.5 py-0">
                {inboxUnreadCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* System Notifications Tab */}
        <TabsContent value="notifications">
          <NotificationCenter role="user">
            {/* Notification Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-indigo-600" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email" className="flex flex-col">
                    <span>Email Notifications</span>
                    <span className="text-xs text-muted-foreground">Receive emails for alerts</span>
                  </Label>
                  <Switch
                    id="email"
                    checked={preferences.email}
                    onCheckedChange={() => togglePreference('email')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="push" className="flex flex-col">
                    <span>Push Notifications</span>
                    <span className="text-xs text-muted-foreground">Browser notifications</span>
                  </Label>
                  <Switch
                    id="push"
                    checked={preferences.push}
                    onCheckedChange={() => togglePreference('push')}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alert Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="report-ready" className="text-sm">
                    Report Ready
                  </Label>
                  <Switch
                    id="report-ready"
                    checked={preferences.reportReady}
                    onCheckedChange={() => togglePreference('reportReady')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="ai-complete" className="text-sm">
                    AI Complete
                  </Label>
                  <Switch
                    id="ai-complete"
                    checked={preferences.aiComplete}
                    onCheckedChange={() => togglePreference('aiComplete')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="status-update" className="text-sm">
                    Status Updates
                  </Label>
                  <Switch
                    id="status-update"
                    checked={preferences.statusUpdate}
                    onCheckedChange={() => togglePreference('statusUpdate')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="task-assignment" className="text-sm">
                    Task Assignments
                  </Label>
                  <Switch
                    id="task-assignment"
                    checked={preferences.taskAssignment}
                    onCheckedChange={() => togglePreference('taskAssignment')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="delete-request" className="text-sm">
                    Delete Requests
                  </Label>
                  <Switch
                    id="delete-request"
                    checked={preferences.deleteRequest}
                    onCheckedChange={() => togglePreference('deleteRequest')}
                  />
                </div>
              </CardContent>
            </Card>

            <ChatNotificationPreferences
              preferences={preferences}
              onToggle={togglePreference}
              accent="indigo"
            />
          </NotificationCenter>
        </TabsContent>

        {/* Messages (Inbox) Tab */}
        <TabsContent value="messages">
          <div className="flex flex-col h-[calc(100vh-240px)] max-w-3xl mx-auto">
            {/* Chat header */}
            <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 rounded-t-lg">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                      <Inbox className="w-5 h-5" />
                    </div>
                    {inboxUnreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                        {inboxUnreadCount > 9 ? '9+' : inboxUnreadCount}
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 leading-tight">Messages</h2>
                    <p className="text-xs text-gray-400">
                      {inboxLoading
                        ? 'Loading...'
                        : inboxUnreadCount > 0
                          ? `${inboxUnreadCount} unread message${inboxUnreadCount > 1 ? 's' : ''}`
                          : 'All caught up'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSearchOpen(!searchOpen)}
                    className={`p-2 rounded-full transition-colors ${
                      searchOpen ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-100 text-gray-500'
                    }`}
                  >
                    <Search className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={handleInboxMarkAllAsRead}
                    disabled={inboxBusy || inboxUnreadCount === 0}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-500 disabled:opacity-30 transition-colors"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={handleInboxClearAll}
                    disabled={inboxBusy || inboxNotifications.length === 0}
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
                    placeholder="Search messages..."
                    autoFocus
                    className="w-full pl-9 pr-9 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
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
                {inboxTypeFilters.map((t) => {
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
                      ? 'bg-indigo-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Unread
                </button>
              </div>
            </div>

            {/* Chat body (scrollable) */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-gray-100/50 py-3"
            >
              {inboxLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">Loading messages</p>
                  <p className="text-xs text-gray-400 mt-1">Please wait...</p>
                </div>
              ) : groupedInbox.length === 0 ? (
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
                      : "New messages will appear here"}
                  </p>
                </div>
              ) : (
                groupedInbox.map((item, i) => {
                  if (item.type === 'date') {
                    return <DateSeparator key={`date-${item.label}`} label={item.label} />;
                  }
                  return (
                    <ChatBubble
                      key={item.data._id}
                      item={item.data}
                      onOpen={handleInboxOpen}
                      onMarkRead={handleInboxMarkRead}
                      onDelete={handleInboxDelete}
                      isConsecutive={item.isConsecutive}
                    />
                  );
                })
              )}
            </div>

            {/* Bottom bar (summary) */}
            <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 py-2.5 rounded-b-lg">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  {filteredInbox.length} message{filteredInbox.length !== 1 ? 's' : ''}
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
                <div className="flex items-center gap-1.5">
                  {inboxUnreadCount > 0 && (
                    <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      {inboxUnreadCount} unread
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationPageTeamLeader;
