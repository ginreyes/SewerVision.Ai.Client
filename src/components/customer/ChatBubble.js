'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  MessageCircle, X, Send, ArrowLeft, Users, FolderOpen, Loader2,
  Paperclip, Image as ImageIcon, File, Download, Smile, ChevronDown,
} from 'lucide-react';
import { useUser } from '@/components/providers/UserContext';
import { customerApi } from '@/data/customerApi';
import { api } from '@/lib/helper';
import { BACKEND_URL } from '@/lib/config';
import { avatarSrc, getAvatarColor, getInitials } from '@/components/admin/constants';
import EmojiPicker from '@/components/shared/EmojiPicker';
import AttachmentMenu from '@/components/shared/AttachmentMenu';
import SharedChatMessage, { ChatDateSeparator } from '@/components/shared/ChatMessage';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';

/* ─── Helpers ─── */
function formatTime(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === now.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / 1048576).toFixed(1)}MB`;
}

/* ─── Avatar Component ─── */
function Avatar({ userId: uid, name, size = 'sm', online }) {
  const [imgError, setImgError] = useState(false);
  const sizeClass = size === 'lg' ? 'w-10 h-10' : size === 'md' ? 'w-8 h-8' : 'w-7 h-7';
  const textSize = size === 'lg' ? 'text-xs' : 'text-[10px]';
  const url = uid ? avatarSrc({ _id: uid }) : null;

  return (
    <div className="relative shrink-0">
      {url && !imgError ? (
        <img src={url} alt={name || ''} className={`${sizeClass} rounded-full object-cover`}
          onError={() => setImgError(true)} />
      ) : (
        <div className={`${sizeClass} rounded-full flex items-center justify-center text-white font-bold ${textSize} ${getAvatarColor(name || '?')}`}>
          {getInitials(name || '?')}
        </div>
      )}
      {online && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
      )}
    </div>
  );
}

/* ─── Message Bubble (Messenger-style) ─── */
function MessageBubble({ msg, isMine, senderName, senderId, isLast, isFirst, showAvatar }) {
  const isImage = (att) => att.mimetype?.startsWith('image/');

  return (
    <div className={`flex gap-1.5 ${isMine ? 'flex-row-reverse' : ''} ${isFirst ? 'mt-3' : 'mt-0.5'}`}>
      {/* Avatar — only show on last message in a group */}
      <div className="w-7 shrink-0 flex items-end">
        {showAvatar && !isMine && (
          <Avatar userId={senderId} name={senderName} size="sm" />
        )}
      </div>

      <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[72%]`}>
        {/* Text bubble */}
        {msg.text && (
          <div className={`px-3 py-1.5 text-[13px] leading-relaxed ${
            isMine
              ? 'bg-emerald-500 text-white rounded-[18px] rounded-br-[4px]'
              : 'bg-white border border-gray-200 text-gray-800 rounded-[18px] rounded-bl-[4px]'
          } ${!isFirst && isMine ? 'rounded-tr-[18px] rounded-br-[4px]' : ''} ${!isFirst && !isMine ? 'rounded-tl-[18px] rounded-bl-[4px]' : ''}`}>
            {msg.text}
          </div>
        )}

        {/* Attachments */}
        {msg.attachments?.length > 0 && (
          <div className="mt-1 space-y-1">
            {msg.attachments.map((att, i) =>
              isImage(att) ? (
                <img key={i} src={att.url} alt={att.filename} onClick={() => window.open(att.url, '_blank')}
                  className="rounded-xl max-w-[240px] max-h-[200px] object-cover cursor-pointer hover:opacity-90 transition-opacity shadow-sm" />
              ) : (
                <a key={i} href={att.url} target="_blank" rel="noopener noreferrer"
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${isMine ? 'bg-emerald-600/80 text-white' : 'bg-gray-100 text-gray-700'}`}>
                  <File className="w-4 h-4 shrink-0" />
                  <span className="truncate flex-1">{att.filename}</span>
                  <span className="opacity-60">{formatSize(att.size)}</span>
                </a>
              )
            )}
          </div>
        )}

        {/* Timestamp on last message */}
        {isLast && (
          <span className={`text-[10px] mt-0.5 px-1 ${isMine ? 'text-gray-400' : 'text-gray-400'}`}>
            {formatTime(msg.createdAt)}
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Date Separator ─── */
function DateSep({ date }) {
  return (
    <div className="flex items-center gap-3 my-3 px-2">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-[10px] text-gray-400 font-medium bg-gray-50 px-2 py-0.5 rounded-full">{formatDate(date)}</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

/* ─── Conversation Item in Sidebar ─── */
function ConvoItem({ conv, isActive, onClick }) {
  const name = conv.createdBy?.first_name
    ? `${conv.createdBy.first_name} ${conv.createdBy.last_name || ''}`.trim()
    : 'Team Leader';
  const createdById = conv.createdBy?._id || conv.createdBy;
  const hasUnread = (conv.unreadCount || 0) > 0;

  return (
    <button onClick={onClick}
      className={`w-full text-left px-3 py-2.5 flex items-center gap-3 transition-colors rounded-lg mx-1 ${
        isActive ? 'bg-emerald-50' : 'hover:bg-gray-50'
      }`}>
      <Avatar userId={createdById} name={name} size="lg" online />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className={`text-[13px] truncate ${hasUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{name}</span>
          <span className="text-[10px] text-gray-400 ml-2 shrink-0">
            {conv.lastMessageAt ? formatTime(conv.lastMessageAt) : ''}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className={`text-xs truncate ${hasUnread ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
            {conv.lastMessage || conv.projectCode || 'No messages yet'}
          </p>
          {hasUnread && (
            <span className="w-[18px] h-[18px] rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 ml-1">
              {conv.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

/* ─── Contact Item ─── */
function ContactItem({ contact, onClick }) {
  return (
    <button onClick={onClick}
      className="w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-emerald-50 transition-colors rounded-lg mx-1">
      <Avatar userId={contact._id} name={contact.name} size="lg" online />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-gray-900">{contact.name}</p>
        <p className="text-[10px] text-emerald-600 font-medium">{contact.role}</p>
        <div className="flex items-center gap-1 mt-0.5">
          {contact.projects.slice(0, 2).map((p, i) => (
            <span key={i} className="text-[9px] bg-gray-100 text-gray-500 rounded px-1.5 py-0.5">{p}</span>
          ))}
        </div>
      </div>
    </button>
  );
}

/* ─── Main ChatBubble ─── */
export default function ChatBubble() {
  const { userId, userData } = useUser();

  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('list'); // 'list' | 'thread'
  const [tab, setTab] = useState('chats'); // 'chats' | 'contacts'
  const [conversations, setConversations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showEmoji, setShowEmoji] = useState(false);

  // Unread count polling
  useEffect(() => {
    if (!userId) return;
    const fetch = async () => {
      try {
        const res = await api(`/api/client-conversations/unread-total?customerId=${userId}`, 'GET');
        setUnreadCount(res.ok ? (res.data?.data?.unreadTotal || 0) : 0);
      } catch { /* silent */ }
    };
    fetch();
    const iv = setInterval(fetch, 15000);
    return () => clearInterval(iv);
  }, [userId]);

  // Fetch data when panel opens
  useEffect(() => {
    if (!isOpen || !userId) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        // Contacts
        const projects = await customerApi.getAllProjects(userId);
        const projectList = Array.isArray(projects) ? projects : (projects?.data || []);
        const contactMap = {};
        projectList.forEach(p => {
          const mgr = p.managerId;
          if (mgr && typeof mgr === 'object' && mgr._id) {
            if (!contactMap[mgr._id]) {
              contactMap[mgr._id] = {
                _id: mgr._id,
                name: `${mgr.first_name || ''} ${mgr.last_name || ''}`.trim() || 'Team Leader',
                role: 'Team Leader',
                projects: [], projectIds: [],
              };
            }
            contactMap[mgr._id].projects.push(p.name || p.workOrder || 'Project');
            contactMap[mgr._id].projectIds.push({ id: p._id, name: p.name || p.workOrder });
          }
        });
        setContacts(Object.values(contactMap));

        // Conversations
        const convRes = await api(`/api/client-conversations?customerId=${userId}`, 'GET');
        setConversations(convRes.ok ? (convRes.data?.data || []) : []);
      } catch { setContacts([]); setConversations([]); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [isOpen, userId]);

  // Fetch messages
  useEffect(() => {
    if (!selectedThread) return;
    const fetchMsgs = async () => {
      try {
        const res = await api(`/api/client-conversations/${selectedThread}/messages?limit=100`, 'GET');
        if (res.ok) setMessages(res.data?.data || []);
      } catch { setMessages([]); }
    };
    fetchMsgs();
  }, [selectedThread]);

  // Auto-scroll
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Real-time chat via Socket.IO
  useRealtimeChat(selectedThread, {
    onNewMessage: (msg) => {
      setMessages(prev => {
        // Avoid duplicates
        if (prev.some(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
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

  const toggleChat = () => {
    if (isOpen) {
      setIsOpen(false); setSelectedThread(null); setSelectedRecipient(null); setMessages([]); setView('list');
    } else setIsOpen(true);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;
    const txt = newMessage.trim();
    setSending(true);
    try {
      let convId = selectedThread;
      if (!convId && selectedRecipient) {
        const proj = selectedRecipient.projectIds?.[0];
        const custName = userData?.first_name ? `${userData.first_name} ${userData.last_name || ''}`.trim() : 'Customer';
        const cr = await api('/api/client-conversations', 'POST', {
          customerId: userId, customerName: custName,
          projectId: proj?.id, projectCode: proj?.name || 'Project',
          createdBy: selectedRecipient._id,
        });
        if (cr.ok && cr.data?.data?._id) { convId = cr.data.data._id; setSelectedThread(convId); }
      }
      if (!convId) { setSending(false); return; }

      const res = await api(`/api/client-conversations/${convId}/messages`, 'POST', {
        from: 'customer', sender: userId, text: txt,
      });
      setNewMessage('');
      const sent = res.ok ? res.data?.data : null;
      setMessages(prev => [...prev, sent || { _id: Date.now(), from: 'customer', sender: { _id: userId }, text: txt, createdAt: new Date().toISOString() }]);
    } catch (e) { console.error('Send failed:', e); }
    finally { setSending(false); }
  };

  const handleSendAttachment = async (filesOrFile, fileType) => {
    // Normalize to array
    const fileList = Array.isArray(filesOrFile) ? filesOrFile : [filesOrFile];
    if (fileList.length === 0) return;
    setSending(true);
    try {
      let convId = selectedThread;
      if (!convId && selectedRecipient) {
        const proj = selectedRecipient.projectIds?.[0];
        const custName = userData?.first_name ? `${userData.first_name} ${userData.last_name || ''}`.trim() : 'Customer';
        const cr = await api('/api/client-conversations', 'POST', {
          customerId: userId, customerName: custName,
          projectId: proj?.id, projectCode: proj?.name || 'Project',
          createdBy: selectedRecipient._id,
        });
        if (cr.ok && cr.data?.data?._id) { convId = cr.data.data._id; setSelectedThread(convId); }
      }
      if (!convId) { setSending(false); return; }

      const token = document.cookie.split('authToken=')[1]?.split(';')[0] || '';

      // Upload ALL files to B2 in parallel
      const uploadResults = await Promise.all(fileList.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
          const res = await fetch(`${BACKEND_URL}/api/client-conversations/${convId}/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData,
          });
          const data = await res.json();
          if (data.status === 'success' && data.data?.url) {
            return { url: data.data.url, filename: data.data.filename, mimetype: data.data.mimetype, size: data.data.size };
          }
        } catch {}
        return null;
      }));

      const attachments = uploadResults.filter(Boolean);

      if (attachments.length > 0) {
        // Send ONE message with ALL attachments
        const allImages = attachments.every(a => a.mimetype?.startsWith('image/'));
        const res = await api(`/api/client-conversations/${convId}/messages`, 'POST', {
          from: 'customer', sender: userId,
          text: allImages ? '' : attachments.map(a => a.filename).join(', '),
          attachments,
        });
        const sent = res.ok ? res.data?.data : null;
        setMessages(prev => [...prev, sent || { _id: Date.now(), from: 'customer', sender: { _id: userId }, text: '', attachments, createdAt: new Date().toISOString() }]);
      }
    } catch (e) { console.error('Send failed:', e); }
    finally { setSending(false); }
  };

  const openThread = async (convId, recipient) => {
    setSelectedRecipient(recipient);
    setMessages([]);
    setView('thread');
    setSelectedThread(null);
    setTimeout(() => setSelectedThread(convId), 0);
    try { await api(`/api/client-conversations/${convId}/read`, 'PATCH'); } catch { /* silent */ }
  };

  const startConversation = (contact) => {
    setSelectedRecipient(contact);
    const existing = conversations.find(c => (c.createdBy?._id || c.createdBy) === contact._id);
    if (existing) {
      openThread(existing._id, contact);
    } else {
      setSelectedThread(null); setMessages([]); setView('thread');
    }
  };

  const goBack = async () => {
    setSelectedThread(null); setSelectedRecipient(null); setMessages([]); setView('list');
    try {
      const r = await api(`/api/client-conversations?customerId=${userId}`, 'GET');
      setConversations(r.ok ? (r.data?.data || []) : []);
    } catch { /* silent */ }
  };

  // Collect ALL images from the conversation for carousel lightbox
  const allConversationImages = useMemo(() => {
    const imgs = [];
    messages.forEach(msg => {
      (msg.attachments || []).forEach(att => {
        if (att.mimetype?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(att.filename || att.url || '')) {
          imgs.push(att);
        }
      });
    });
    return imgs;
  }, [messages]);

  // Group messages by date + consecutive sender
  const groupedMessages = useMemo(() => {
    const items = [];
    let lastDate = '', lastSender = '', lastDir = '';
    messages.forEach((msg, idx) => {
      const msgDate = msg.createdAt ? new Date(msg.createdAt).toDateString() : '';
      if (msgDate !== lastDate) { items.push({ type: 'date', date: msg.createdAt }); lastDate = msgDate; lastSender = ''; }
      const dir = msg.from === 'customer' || (msg.sender?._id || msg.sender) === userId ? 'mine' : 'theirs';
      const senderId = msg.sender?._id || msg.sender;
      const isFirst = dir !== lastDir || senderId !== lastSender;
      const nextMsg = messages[idx + 1];
      const nextDir = nextMsg ? (nextMsg.from === 'customer' || (nextMsg.sender?._id || nextMsg.sender) === userId ? 'mine' : 'theirs') : '';
      const isLast = dir !== nextDir || idx === messages.length - 1;
      items.push({ type: 'msg', msg, isMine: dir === 'mine', isFirst, isLast, showAvatar: isLast });
      lastDir = dir; lastSender = senderId;
    });
    return items;
  }, [messages, userId]);

  // Filter conversations by search
  const filteredConvos = useMemo(() => {
    if (!search) return conversations;
    const q = search.toLowerCase();
    return conversations.filter(c => {
      const name = c.createdBy?.first_name ? `${c.createdBy.first_name} ${c.createdBy.last_name || ''}` : '';
      return name.toLowerCase().includes(q) || (c.projectCode || '').toLowerCase().includes(q);
    });
  }, [conversations, search]);

  if (!userId) return null;

  return (
    <>
      {/* ─── Floating Bubble ─── */}
      <button onClick={toggleChat}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center">
        {isOpen ? <X className="w-6 h-6" /> : (
          <>
            <MessageCircle className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full flex items-center justify-center ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </>
        )}
      </button>

      {/* ─── Chat Panel (Messenger-style) ─── */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[420px] h-[580px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ animation: 'slideUp 0.2s ease-out' }}>

          {view === 'list' ? (
            /* ─── LIST VIEW (Messenger Sidebar Style) ─── */
            <>
              {/* Header */}
              <div className="px-4 pt-4 pb-2 shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-gray-900">Chats</h2>
                  <button onClick={toggleChat} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Search */}
                <div className="relative mb-3">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search conversations..."
                    className="w-full text-sm pl-9 pr-3 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all" />
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-1">
                  {[{ key: 'chats', label: 'Chats' }, { key: 'contacts', label: 'Projects' }].map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                        tab === t.key ? 'bg-emerald-100 text-emerald-700' : 'text-gray-500 hover:bg-gray-100'
                      }`}>{t.label}</button>
                  ))}
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto px-1">
                {loading ? (
                  <div className="flex items-center justify-center h-40"><Loader2 className="w-5 h-5 animate-spin text-emerald-500" /></div>
                ) : tab === 'chats' ? (
                  filteredConvos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                      <MessageCircle className="w-8 h-8 mb-2 opacity-30" />
                      <p className="text-xs">No conversations yet</p>
                      <button onClick={() => setTab('contacts')} className="text-xs text-emerald-600 mt-1 hover:underline">Start one</button>
                    </div>
                  ) : (
                    filteredConvos.map(c => {
                      const name = c.createdBy?.first_name ? `${c.createdBy.first_name} ${c.createdBy.last_name || ''}`.trim() : 'Team Leader';
                      return (
                        <ConvoItem key={c._id} conv={c} isActive={false}
                          onClick={() => openThread(c._id, { _id: c.createdBy?._id || c.createdBy, name, projectIds: [{ id: c.projectId, name: c.projectCode }] })} />
                      );
                    })
                  )
                ) : (
                  contacts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                      <Users className="w-8 h-8 mb-2 opacity-30" />
                      <p className="text-xs">No team leaders assigned yet</p>
                    </div>
                  ) : (
                    contacts.map(c => <ContactItem key={c._id} contact={c} onClick={() => startConversation(c)} />)
                  )
                )}
              </div>
            </>
          ) : (
            /* ─── THREAD VIEW ─── */
            <>
              {/* Thread Header */}
              <div className="flex items-center gap-3 px-3 py-2.5 border-b border-gray-100 shrink-0">
                <button onClick={goBack} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                {selectedRecipient && (
                  <>
                    <Avatar userId={selectedRecipient._id} name={selectedRecipient.name} size="md" online />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{selectedRecipient.name}</p>
                      <p className="text-[10px] text-emerald-500">Active now</p>
                    </div>
                  </>
                )}
                <button onClick={toggleChat} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition-colors ml-auto">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 py-2 bg-white">
                {loading ? (
                  <div className="flex items-center justify-center h-full"><Loader2 className="w-5 h-5 animate-spin text-emerald-500" /></div>
                ) : messages.length === 0 && !selectedThread ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <Avatar userId={selectedRecipient?._id} name={selectedRecipient?.name} size="lg" />
                    <p className="text-sm font-medium text-gray-700 mt-2">{selectedRecipient?.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Team Leader</p>
                    <p className="text-xs text-gray-400 mt-3">Say hello to start the conversation</p>
                  </div>
                ) : (
                  <>
                    {/* Conversation start */}
                    {messages.length > 0 && (
                      <div className="flex flex-col items-center mb-4 mt-2">
                        <Avatar userId={selectedRecipient?._id} name={selectedRecipient?.name} size="lg" />
                        <p className="text-xs font-medium text-gray-700 mt-1">{selectedRecipient?.name}</p>
                        <p className="text-[10px] text-gray-400">Team Leader · {selectedRecipient?.projectIds?.[0]?.name || ''}</p>
                      </div>
                    )}
                    {groupedMessages.map((item, idx) =>
                      item.type === 'date' ? (
                        <ChatDateSeparator key={`d-${idx}`} date={item.date} />
                      ) : (
                        <SharedChatMessage
                          key={item.msg._id || idx}
                          messageId={item.msg._id}
                          text={item.msg.text || item.msg.body}
                          isMine={item.isMine}
                          senderName={item.isMine ? undefined : selectedRecipient?.name}
                          senderId={item.isMine ? userId : selectedRecipient?._id}
                          currentUserId={userId}
                          timestamp={item.isLast ? item.msg.createdAt : undefined}
                          readAt={item.msg.readAt}
                          attachments={item.msg.attachments}
                          allConversationImages={allConversationImages}
                          reactions={item.msg.reactions || []}
                          edited={item.msg.edited}
                          deleted={item.msg.deleted}
                          showAvatar={item.showAvatar}
                          isFirst={item.isFirst}
                          isLast={item.isLast}
                          theme="emerald"
                          onRefresh={async () => {
                            if (!selectedThread) return;
                            try {
                              const res = await api(`/api/client-conversations/${selectedThread}/messages?limit=100`, 'GET');
                              if (res.ok) setMessages(res.data?.data || []);
                            } catch {}
                          }}
                        />
                      )
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input Bar */}
              <div className="flex items-center gap-1.5 px-3 py-2 border-t border-gray-100 shrink-0 bg-white">
                <AttachmentMenu onSendAttachment={handleSendAttachment} theme="emerald" disabled={sending} />
                <div className="flex-1 relative">
                  <input value={newMessage} onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="Aa"
                    className="w-full text-sm px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:bg-gray-50 focus:ring-2 focus:ring-emerald-300 transition-all" />
                </div>
                <div className="relative">
                  <button onClick={() => setShowEmoji(p => !p)}
                    className={`p-2 rounded-full transition-colors shrink-0 ${showEmoji ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-gray-100 text-emerald-500'}`}>
                    <Smile className="w-5 h-5" />
                  </button>
                  {showEmoji && (
                    <EmojiPicker
                      onSelect={emoji => setNewMessage(prev => prev + emoji)}
                      onClose={() => setShowEmoji(false)}
                    />
                  )}
                </div>
                <button onClick={handleSend} disabled={!newMessage.trim() || sending}
                  className="p-2 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-40 transition-colors shrink-0">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <style jsx global>{`
        @keyframes slideUp {
          from { transform: translateY(16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}
