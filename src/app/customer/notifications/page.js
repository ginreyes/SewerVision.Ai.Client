'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Bell,
  Check,
  Loader2,
  MessageCircle,
  Send,
  ArrowLeft,
  Smile,
  MoreHorizontal,
  Trash2,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser } from '@/components/providers/UserContext';
import { useAlert } from '@/components/providers/AlertProvider';
import {
  useCustomerNotifications,
  useCustomerNotificationPreferences,
  useMarkCustomerNotificationRead,
  useMarkAllCustomerNotificationsRead,
  useDeleteCustomerNotification,
  useUpdateCustomerNotificationPreferences,
} from '@/hooks/useQueryHooks';
import { api } from '@/lib/helper';
import { avatarSrc, getAvatarColor, getInitials } from '@/components/admin/constants';

import NotificationPreferences from '@/components/customer/notifications/NotificationPreferences';
import ChatMessage, { ChatDateSeparator } from '@/components/shared/ChatMessage';
import EmojiPicker from '@/components/shared/EmojiPicker';
import AttachmentMenu from '@/components/shared/AttachmentMenu';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';
import NotificationCenter from '@/components/shared/NotificationCenter';

const NotificationPageCustomer = () => {
  const { userId } = useUser();
  const { showAlert } = useAlert();

  // TanStack Query hooks
  const {
    data: notificationsData,
    isLoading: loading,
  } = useCustomerNotifications(userId);

  const {
    data: preferencesData,
  } = useCustomerNotificationPreferences(userId);

  const markReadMutation = useMarkCustomerNotificationRead();
  const markAllReadMutation = useMarkAllCustomerNotificationsRead();
  const deleteMutation = useDeleteCustomerNotification();
  const updatePrefsMutation = useUpdateCustomerNotificationPreferences();

  const notifications = notificationsData?.data || [];
  const unreadCount = notificationsData?.unreadCount || 0;
  const preferences = preferencesData || {
    email: true,
    push: true,
    reportReady: true,
    aiComplete: true,
    statusUpdate: true,
    qcReview: true,
    defectFound: true,
  };

  const markAsRead = async (notificationId) => {
    try {
      await markReadMutation.mutateAsync({ notificationId, userId });
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllReadMutation.mutateAsync({ userId });
      showAlert('All notifications marked as read', 'success');
    } catch (err) {
      console.error('Error marking all as read:', err);
      showAlert('Failed to mark notifications as read', 'error');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await deleteMutation.mutateAsync({ notificationId, userId });
      showAlert('Notification deleted', 'success');
    } catch (err) {
      console.error('Error deleting notification:', err);
      showAlert('Failed to delete notification', 'error');
    }
  };

  const togglePreference = async (key) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };

    try {
      await updatePrefsMutation.mutateAsync({ userId, preferences: newPreferences });
      showAlert('Preferences updated', 'success');
    } catch (err) {
      console.error('Error updating preferences:', err);
      showAlert('Failed to update preferences', 'error');
    }
  };

  // ─── Messages State ───
  const [convos, setConvos] = useState([]);
  const [msgUnread, setMsgUnread] = useState(0);
  const [convosLoading, setConvosLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const fetchConvos = async () => {
      setConvosLoading(true);
      try {
        const res = await api(`/api/client-conversations?customerId=${userId}`, 'GET');
        const data = res.ok ? (res.data?.data || []) : [];
        setConvos(data);
        setMsgUnread(data.reduce((s, c) => s + (c.unreadCount || 0), 0));
      } catch { setConvos([]); }
      finally { setConvosLoading(false); }
    };
    fetchConvos();
  }, [userId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6 p-4 md:p-6" data-tour="customer-notifications">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Notifications & Messages
          </h1>
          <p className="text-muted-foreground">Manage alerts, view updates, and read messages</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={markAllAsRead}
          disabled={unreadCount === 0 || markAllReadMutation.isPending}
        >
          <Check className="h-4 w-4 mr-2" />
          Mark All as Read
        </Button>
      </div>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="mb-4 bg-gray-100/80 p-1 rounded-xl h-auto">
          <TabsTrigger value="notifications" className="flex items-center gap-1.5 text-gray-600 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm rounded-lg px-5 py-2.5">
            <Bell className="w-4 h-4" />
            <span className="text-sm font-medium">Notifications</span>
            {unreadCount > 0 && <span className="ml-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{unreadCount}</span>}
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-1.5 text-gray-600 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm rounded-lg px-5 py-2.5">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Messages</span>
            {msgUnread > 0 && <span className="ml-1 w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">{msgUnread}</span>}
          </TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-0">
          <NotificationCenter
            role="customer"
            notifications={notifications}
            unreadCount={unreadCount}
            isLoading={loading}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onDelete={deleteNotification}
          >
            <NotificationPreferences
              preferences={preferences}
              onToggle={togglePreference}
              userId={userId}
            />
          </NotificationCenter>
        </TabsContent>

        {/* Messages Tab (Full Messenger-style) */}
        <TabsContent value="messages" className="mt-0">
          <MessengerInbox userId={userId} convos={convos} setConvos={setConvos} convosLoading={convosLoading} msgUnread={msgUnread} setMsgUnread={setMsgUnread} formatDate={formatDate} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

/* ─── Messenger-style Inbox Component ─── */
function MessengerInbox({ userId, convos, setConvos, convosLoading, msgUnread, setMsgUnread, formatDate: fmtDate }) {
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgsLoading, setMsgsLoading] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [convoMenu, setConvoMenu] = useState(null);
  const endRef = useRef(null);

  const selected = convos.find(c => c._id === selectedConvo);
  const selectedName = selected?.createdBy?.first_name ? `${selected.createdBy.first_name} ${selected.createdBy.last_name || ''}`.trim() : 'Team Leader';
  const selectedId = selected?.createdBy?._id || selected?.createdBy;

  // Fetch messages when conversation selected
  useEffect(() => {
    if (!selectedConvo) return;
    const load = async () => {
      setMsgsLoading(true);
      try {
        const res = await api(`/api/client-conversations/${selectedConvo}/messages?limit=100`, 'GET');
        setMessages(res.ok ? (res.data?.data || []) : []);
      } catch { setMessages([]); }
      finally { setMsgsLoading(false); }
    };
    load();
    // Mark as read
    api(`/api/client-conversations/${selectedConvo}/read`, 'PATCH').catch(() => {});
    setConvos(prev => prev.map(c => c._id === selectedConvo ? { ...c, unreadCount: 0 } : c));
  }, [selectedConvo, setConvos]);

  // Auto-scroll
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Real-time chat via Socket.IO
  useRealtimeChat(selectedConvo, {
    onNewMessage: (msg) => {
      setMessages(prev => prev.some(m => m._id === msg._id) ? prev : [...prev, msg]);
    },
    onMessageEdited: (msgId, newText) => {
      setMessages(prev => prev.map(m => m._id === msgId ? { ...m, text: newText, edited: true } : m));
    },
    onMessageDeleted: (msgId) => {
      setMessages(prev => prev.map(m => m._id === msgId ? { ...m, deleted: true, text: 'This message was removed' } : m));
    },
    onReactionToggled: (msgId, reactions) => {
      setMessages(prev => prev.map(m => m._id === msgId ? { ...m, reactions } : m));
    },
    onMessagesSeen: () => {
      setMessages(prev => prev.map(m => ({ ...m, readAt: m.readAt || new Date().toISOString() })));
    },
  });

  // Keep the auto-refresh as fallback (less frequent)
  useEffect(() => {
    if (!selectedConvo) return;
    const iv = setInterval(async () => {
      try {
        const res = await api(`/api/client-conversations/${selectedConvo}/messages?limit=100`, 'GET');
        if (res.ok) setMessages(res.data?.data || []);
      } catch { /* silent */ }
    }, 30000);
    return () => clearInterval(iv);
  }, [selectedConvo]);

  const handleSend = async () => {
    if (!input.trim() || !selectedConvo || sending) return;
    const txt = input.trim();
    setSending(true);
    try {
      const res = await api(`/api/client-conversations/${selectedConvo}/messages`, 'POST', {
        from: 'customer', sender: userId, text: txt,
      });
      setInput('');
      setShowEmoji(false);
      const sent = res.ok ? res.data?.data : null;
      setMessages(prev => [...prev, sent || { _id: Date.now(), from: 'customer', sender: { _id: userId }, text: txt, createdAt: new Date().toISOString() }]);
    } catch { /* silent */ }
    finally { setSending(false); }
  };

  // Refresh messages (called after edit/delete/react)
  const refreshMessages = async () => {
    if (!selectedConvo) return;
    try {
      const res = await api(`/api/client-conversations/${selectedConvo}/messages?limit=100`, 'GET');
      if (res.ok) setMessages(res.data?.data || []);
    } catch { /* silent */ }
  };

  // Delete conversation
  const handleDeleteConvo = async (convoId) => {
    try {
      await api(`/api/client-conversations/${convoId}`, 'DELETE');
      setConvos(prev => prev.filter(c => c._id !== convoId));
      if (selectedConvo === convoId) { setSelectedConvo(null); setMessages([]); }
      setConvoMenu(null);
    } catch { /* silent */ }
  };

  // Group messages by date + sender
  const allConversationImages = useMemo(() => {
    const imgs = [];
    messages.forEach(msg => {
      (msg.attachments || []).forEach(att => {
        if (att.mimetype?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(att.filename || att.url || '')) imgs.push(att);
      });
    });
    return imgs;
  }, [messages]);

  const grouped = useMemo(() => {
    const items = [];
    let lastDate = '', lastDir = '';
    messages.forEach((msg, idx) => {
      const msgDate = msg.createdAt ? new Date(msg.createdAt).toDateString() : '';
      if (msgDate !== lastDate) { items.push({ type: 'date', date: msg.createdAt }); lastDate = msgDate; lastDir = ''; }
      const dir = msg.from === 'customer' || (msg.sender?._id || msg.sender) === userId ? 'mine' : 'theirs';
      const isFirst = dir !== lastDir;
      const nextMsg = messages[idx + 1];
      const nextDir = nextMsg ? (nextMsg.from === 'customer' || (nextMsg.sender?._id || nextMsg.sender) === userId ? 'mine' : 'theirs') : '';
      const isLast = dir !== nextDir || idx === messages.length - 1;
      items.push({ type: 'msg', msg, isMine: dir === 'mine', isFirst, isLast });
      lastDir = dir;
    });
    return items;
  }, [messages, userId]);

  if (convosLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex" style={{ height: 'calc(100vh - 280px)', minHeight: 450 }}>
          {/* Sidebar */}
          <div className={`${selectedConvo ? 'hidden md:flex' : 'flex'} w-full md:w-80 shrink-0 border-r border-gray-100 flex-col`}>
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">Messages</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              {convos.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 px-4">
                  <MessageCircle className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-xs">No conversations yet</p>
                </div>
              ) : convos.map(conv => {
                const name = conv.createdBy?.first_name ? `${conv.createdBy.first_name} ${conv.createdBy.last_name || ''}`.trim() : 'Team Leader';
                const cId = conv.createdBy?._id || conv.createdBy;
                const hasUnread = (conv.unreadCount || 0) > 0;
                const isActive = selectedConvo === conv._id;
                const menuOpen = convoMenu === conv._id;
                return (
                  <div key={conv._id} className={`relative group flex items-center transition-colors ${isActive ? 'bg-emerald-50' : hasUnread ? 'bg-emerald-50/30 hover:bg-gray-50' : 'hover:bg-gray-50'}`}>
                    <button onClick={() => setSelectedConvo(conv._id)}
                      className="flex-1 text-left px-4 py-3 flex items-center gap-3">
                      <div className="relative shrink-0">
                        <img src={avatarSrc({ _id: cId })} alt="" className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                        <div className={`w-10 h-10 rounded-full items-center justify-center text-white text-xs font-bold ${getAvatarColor(name)}`}
                          style={{ display: 'none' }}>{getInitials(name)}</div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-[13px] truncate ${hasUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{name}</span>
                          <span className="text-[10px] text-gray-400 ml-2">{conv.lastMessageAt ? fmtDate(conv.lastMessageAt) : ''}</span>
                        </div>
                        <p className={`text-xs truncate ${hasUnread ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>{conv.lastMessage || conv.projectCode}</p>
                      </div>
                      {hasUnread && <span className="w-[18px] h-[18px] rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">{conv.unreadCount}</span>}
                    </button>
                    {/* Context menu trigger */}
                    <button onClick={(e) => { e.stopPropagation(); setConvoMenu(menuOpen ? null : conv._id); }}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all ${menuOpen ? 'bg-gray-200 text-gray-700' : 'opacity-0 group-hover:opacity-100 hover:bg-gray-200 text-gray-400'}`}>
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {/* Context menu dropdown */}
                    {menuOpen && (
                      <div className="absolute right-2 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-20 w-40">
                        <button onClick={() => { api(`/api/client-conversations/${conv._id}/read`, 'PATCH'); setConvos(prev => prev.map(c => c._id === conv._id ? { ...c, unreadCount: 0 } : c)); setConvoMenu(null); }}
                          className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                          <Check className="w-3.5 h-3.5" />Mark as read
                        </button>
                        <button onClick={() => handleDeleteConvo(conv._id)}
                          className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2">
                          <Trash2 className="w-3.5 h-3.5" />Delete chat
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`${selectedConvo ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
            {selectedConvo && selected ? (
              <>
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-100 shrink-0">
                  <button onClick={() => setSelectedConvo(null)} className="md:hidden p-1 rounded-full hover:bg-gray-100 text-gray-500">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <img src={avatarSrc({ _id: selectedId })} alt="" className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                  <div className={`w-8 h-8 rounded-full items-center justify-center text-white text-[10px] font-bold ${getAvatarColor(selectedName)}`}
                    style={{ display: 'none' }}>{getInitials(selectedName)}</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{selectedName}</p>
                    <p className="text-[10px] text-emerald-500">Active now</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-3 bg-white">
                  {msgsLoading ? (
                    <div className="flex items-center justify-center h-full"><Loader2 className="w-5 h-5 animate-spin text-emerald-500" /></div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <MessageCircle className="w-8 h-8 mb-2 opacity-30" />
                      <p className="text-sm">No messages yet</p>
                    </div>
                  ) : (
                    grouped.map((item, idx) =>
                      item.type === 'date' ? (
                        <ChatDateSeparator key={`d-${idx}`} date={item.date} />
                      ) : (
                        <ChatMessage
                          key={item.msg._id || idx}
                          messageId={item.msg._id}
                          text={item.msg.text || item.msg.body}
                          isMine={item.isMine}
                          senderName={item.isMine ? undefined : selectedName}
                          senderId={item.isMine ? userId : selectedId}
                          currentUserId={userId}
                          timestamp={item.isLast ? item.msg.createdAt : undefined}
                          readAt={item.msg.readAt}
                          attachments={item.msg.attachments}
                          allConversationImages={allConversationImages}
                          reactions={item.msg.reactions || []}
                          edited={item.msg.edited}
                          deleted={item.msg.deleted}
                          showAvatar={item.isLast && !item.isMine}
                          isFirst={item.isFirst}
                          isLast={item.isLast}
                          theme="emerald"
                          onRefresh={refreshMessages}
                        />
                      )
                    )
                  )}
                  <div ref={endRef} />
                </div>

                {/* Input */}
                <div className="flex items-center gap-1.5 px-3 py-2 border-t border-gray-100 shrink-0 bg-white relative">
                  <AttachmentMenu onSendAttachment={async (filesOrFile) => {
                    const fileList = Array.isArray(filesOrFile) ? filesOrFile : [filesOrFile];
                    if (fileList.length === 0 || !selectedConvo) return;
                    setSending(true);
                    try {
                      const results = await Promise.all(fileList.map(async (file) => {
                        const fd = new FormData(); fd.append('file', file);
                        try {
                          const r = await api(`/api/client-conversations/${selectedConvo}/upload`, 'POST', fd);
                          const d = r.data;
                          if (d?.status === 'success' && d.data?.url) return { url: d.data.url, filename: d.data.filename, mimetype: d.data.mimetype, size: d.data.size };
                        } catch {} return null;
                      }));
                      const atts = results.filter(Boolean);
                      if (atts.length > 0) {
                        const allImg = atts.every(a => a.mimetype?.startsWith('image/'));
                        const res = await api(`/api/client-conversations/${selectedConvo}/messages`, 'POST', { from: 'customer', sender: userId, text: allImg ? '' : atts.map(a => a.filename).join(', '), attachments: atts });
                        const sent = res.ok ? res.data?.data : null;
                        setMessages(prev => [...prev, sent || { _id: Date.now(), from: 'customer', sender: { _id: userId }, text: '', attachments: atts, createdAt: new Date().toISOString() }]);
                      }
                    } catch {} finally { setSending(false); }
                  }} theme="emerald" disabled={sending} />
                  <input value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="Aa" className="flex-1 text-sm px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-300" />
                  <div className="relative">
                    <button onClick={() => setShowEmoji(p => !p)}
                      className={`p-2 rounded-full transition-colors shrink-0 ${showEmoji ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-gray-100 text-emerald-500'}`}>
                      <Smile className="w-5 h-5" />
                    </button>
                    {showEmoji && <EmojiPicker onSelect={emoji => setInput(prev => prev + emoji)} onClose={() => setShowEmoji(false)} />}
                  </div>
                  <button onClick={handleSend} disabled={!input.trim() || sending}
                    className="p-2 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-40 transition-colors shrink-0">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <MessageCircle className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">Select a conversation</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default NotificationPageCustomer;
