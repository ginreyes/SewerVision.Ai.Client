'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import {
  MessageCircle, X, Send, ArrowLeft, Users, FolderOpen, Loader2,
  Paperclip, Image as ImageIcon, File, Download, Smile, ChevronDown,
  Bell, BellOff,
} from 'lucide-react';
import { useUser } from '@/components/providers/UserContext';
import { useProjectChatLauncher } from '@/components/providers/ProjectChatLauncherProvider';
import { api } from '@/lib/helper';
import { avatarSrc, getAvatarColor, getInitials } from '@/components/admin/constants';
import EmojiPicker from '@/components/shared/EmojiPicker';
import AttachmentMenu from '@/components/shared/AttachmentMenu';
import SharedChatMessage, { ChatDateSeparator } from '@/components/shared/ChatMessage';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';

/* ─── Theme palettes ───────────────────────────────────────────────────────
 * Cloned from the customer ChatBubble's emerald variant — every emerald-*
 * class becomes a lookup against this map so user/operator/qc-tech each get
 * their own role accent without changing the visual structure.
 * Keep keys in sync with @/lib/roleThemes (user=indigo, operator=blue,
 * qc-technician=purple, customer=emerald, customer-rep=teal).
 * ────────────────────────────────────────────────────────────────────────── */
const THEMES = {
  emerald: {
    gradient: 'from-emerald-500 to-emerald-600',
    primary: 'bg-emerald-500',
    primaryHover: 'hover:bg-emerald-600',
    primaryText: 'text-emerald-500',
    primaryDeep: 'text-emerald-600',
    pillBg: 'bg-emerald-100',
    pillText: 'text-emerald-700',
    ring: 'focus:ring-emerald-300',
    iconActiveBg: 'bg-emerald-100',
    iconActiveText: 'text-emerald-600',
    bubbleTheme: 'emerald',
  },
  indigo: {
    gradient: 'from-indigo-500 to-indigo-600',
    primary: 'bg-indigo-500',
    primaryHover: 'hover:bg-indigo-600',
    primaryText: 'text-indigo-500',
    primaryDeep: 'text-indigo-600',
    pillBg: 'bg-indigo-100',
    pillText: 'text-indigo-700',
    ring: 'focus:ring-indigo-300',
    iconActiveBg: 'bg-indigo-100',
    iconActiveText: 'text-indigo-600',
    bubbleTheme: 'indigo',
  },
  blue: {
    gradient: 'from-blue-500 to-blue-600',
    primary: 'bg-blue-500',
    primaryHover: 'hover:bg-blue-600',
    primaryText: 'text-blue-500',
    primaryDeep: 'text-blue-600',
    pillBg: 'bg-blue-100',
    pillText: 'text-blue-700',
    ring: 'focus:ring-blue-300',
    iconActiveBg: 'bg-blue-100',
    iconActiveText: 'text-blue-600',
    bubbleTheme: 'blue',
  },
  purple: {
    gradient: 'from-purple-500 to-purple-600',
    primary: 'bg-purple-500',
    primaryHover: 'hover:bg-purple-600',
    primaryText: 'text-purple-500',
    primaryDeep: 'text-purple-600',
    pillBg: 'bg-purple-100',
    pillText: 'text-purple-700',
    ring: 'focus:ring-purple-300',
    iconActiveBg: 'bg-purple-100',
    iconActiveText: 'text-purple-600',
    bubbleTheme: 'purple',
  },
  teal: {
    gradient: 'from-teal-500 to-teal-600',
    primary: 'bg-teal-500',
    primaryHover: 'hover:bg-teal-600',
    primaryText: 'text-teal-500',
    primaryDeep: 'text-teal-600',
    pillBg: 'bg-teal-100',
    pillText: 'text-teal-700',
    ring: 'focus:ring-teal-300',
    iconActiveBg: 'bg-teal-100',
    iconActiveText: 'text-teal-600',
    bubbleTheme: 'teal',
  },
};

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

/* ─── Conversation Item in Sidebar ─── */
function ConvoItem({ conv, currentUserId, onClick, t }) {
  // Project-chat conversations populate `participants[].userId` (subdoc with
  // first_name/last_name/etc) — pick a label: project name for group chats,
  // the other participant's name for DMs.
  const project = conv.projectId;
  const projectName = project?.name || 'Project';

  const me = (conv.participants || []).find(
    (p) => (p.userId?._id || p.userId) === currentUserId
  );
  const unreadCount = me?.unreadCountHint || 0;

  let title;
  let titleId;
  if (conv.kind === 'dm') {
    const other = (conv.participants || [])
      .map((p) => p.userId)
      .find((u) => u && u._id !== currentUserId);
    title = other ? `${other.first_name || ''} ${other.last_name || ''}`.trim() || other.username || 'Direct Message' : 'Direct Message';
    titleId = other?._id;
  } else {
    title = projectName;
    titleId = project?._id;
  }

  return (
    <button onClick={onClick}
      className={`w-full text-left px-3 py-2.5 flex items-center gap-3 transition-colors rounded-lg mx-1 hover:bg-gray-50`}>
      <Avatar userId={titleId} name={title} size="lg" online />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className={`text-[13px] truncate ${unreadCount > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{title}</span>
          <span className="text-[10px] text-gray-400 ml-2 shrink-0">
            {conv.lastMessageAt ? formatTime(conv.lastMessageAt) : ''}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className={`text-xs truncate ${unreadCount > 0 ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
            {conv.lastMessage || `${conv.kind === 'group' ? 'Group chat' : 'No messages yet'}`}
          </p>
          {unreadCount > 0 && (
            <span className={`w-[18px] h-[18px] rounded-full ${t.primary} text-white text-[10px] font-bold flex items-center justify-center shrink-0 ml-1`}>
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

/* ─── Project Item (sidebar list of projects to start a chat with) ─── */
function ProjectItem({ project, onClick, t }) {
  return (
    <button onClick={onClick}
      className={`w-full text-left px-3 py-2.5 flex items-center gap-3 hover:${t.pillBg} transition-colors rounded-lg mx-1`}>
      <Avatar userId={project._id} name={project.name} size="lg" />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-gray-900 truncate">{project.name}</p>
        <p className={`text-[10px] font-medium ${t.primaryDeep}`}>{project.workOrder || 'Project'}</p>
        <div className="flex items-center gap-1 mt-0.5">
          {project.client && (
            <span className="text-[9px] bg-gray-100 text-gray-500 rounded px-1.5 py-0.5 truncate">{project.client}</span>
          )}
        </div>
      </div>
    </button>
  );
}

/* ─── Main ProjectChatBubble ─── */
export default function ProjectChatBubble({ accent = 'indigo' }) {
  const { userId, userData } = useUser();
  const launcher = useProjectChatLauncher();
  const t = THEMES[accent] || THEMES.indigo;

  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('list'); // 'list' | 'thread'
  const [tab, setTab] = useState('chats'); // 'chats' | 'projects'
  const [conversations, setConversations] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const pendingProjectIdRef = useRef(null);
  // Set of conversation ids the current user has muted. Loaded once when the
  // bubble first opens; mutated optimistically by handleToggleMute.
  const [mutedConversationIds, setMutedConversationIds] = useState(() => new Set());
  const [muteBusy, setMuteBusy] = useState(false);

  // Unread count polling — global across all my project conversations.
  useEffect(() => {
    if (!userId) return;
    const fetch = async () => {
      try {
        const res = await api(`/api/project-conversations/unread-total`, 'GET');
        setUnreadCount(res.ok ? (res.data?.data?.unreadTotal || 0) : 0);
      } catch { /* silent */ }
    };
    fetch();
    // 60s safety poll — message arrival itself is realtime via socket; this
    // only catches edge cases (lost socket, multi-device sync).
    const iv = setInterval(fetch, 60000);
    return () => clearInterval(iv);
  }, [userId]);

  // Fetch data when panel opens. Conversations and projects come from two
  // separate endpoints because old projects (pre-dating the chat backend)
  // may not have a conversation provisioned yet — pulling the projects list
  // straight from the user's role assignments shows everything they can chat
  // about, and clicking a no-conversation project triggers on-demand
  // provisioning via /project/:id/ensure.
  useEffect(() => {
    if (!isOpen || !userId) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [convRes, projRes, prefsRes] = await Promise.all([
          api(`/api/project-conversations`, 'GET'),
          api(`/api/project-conversations/my-projects`, 'GET'),
          api(`/api/notifications/preferences/${userId}`, 'GET'),
        ]);
        setConversations(convRes.ok ? (convRes.data?.data || []) : []);
        setProjects(projRes.ok ? (projRes.data?.data || []) : []);
        if (prefsRes.ok) {
          const muted = prefsRes.data?.data?.mutedConversations || [];
          setMutedConversationIds(new Set(muted.map((id) => String(id))));
        }
      } catch { setConversations([]); setProjects([]); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [isOpen, userId]);

  // Toggle mute for the currently-selected thread. Optimistic; rolls back on
  // failure. Backend endpoint is idempotent and returns the new mute state.
  const handleToggleMute = async () => {
    if (!selectedThread || !userId || muteBusy) return;
    const currentlyMuted = mutedConversationIds.has(selectedThread);
    setMuteBusy(true);
    setMutedConversationIds((prev) => {
      const next = new Set(prev);
      if (currentlyMuted) next.delete(selectedThread);
      else next.add(selectedThread);
      return next;
    });
    try {
      const res = await api(
        `/api/notifications/user/${userId}/mute-conversation`,
        'POST',
        { conversationId: selectedThread }
      );
      if (!res.ok) throw new Error('mute toggle failed');
    } catch (e) {
      // Roll back on error.
      setMutedConversationIds((prev) => {
        const next = new Set(prev);
        if (currentlyMuted) next.add(selectedThread);
        else next.delete(selectedThread);
        return next;
      });
      console.error('Toggle mute failed:', e);
    } finally {
      setMuteBusy(false);
    }
  };

  // Fetch messages for the selected thread.
  useEffect(() => {
    if (!selectedThread) return;
    const fetchMsgs = async () => {
      try {
        const res = await api(`/api/project-conversations/${selectedThread}/messages?limit=100`, 'GET');
        if (res.ok) {
          // Backend returns oldest-first per page; the customer chat reads
          // them in chronological order so we use as-is.
          setMessages(res.data?.data || []);
        }
      } catch { setMessages([]); }
    };
    fetchMsgs();
  }, [selectedThread]);

  // Auto-scroll
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // External launcher integration — when something on the page (e.g. a Chat
  // button on a ProjectCard) calls launcher.openChatForProject(id), open the
  // bubble and stash the project id. Once conversations arrive in the next
  // effect, we'll resolve to the matching group conversation.
  useEffect(() => {
    if (launcher.isOpen) {
      setIsOpen(true);
      if (launcher.selectedProjectId) {
        pendingProjectIdRef.current = launcher.selectedProjectId;
      }
    }
  }, [launcher.isOpen, launcher.selectedProjectId]);

  // Resolve a pending external project id to its group conversation as soon
  // as conversations finish loading. If the project has no group conv yet,
  // fall back to /ensure so the deep-linked Chat button still lands the user
  // inside a working thread.
  useEffect(() => {
    const pid = pendingProjectIdRef.current;
    if (!pid || loading) return;
    const groupConv = conversations.find(
      (c) => c.kind === 'group' && (c.projectId?._id === pid || c.projectId === pid)
    );
    if (groupConv) {
      const projectMeta = groupConv.projectId && typeof groupConv.projectId === 'object'
        ? groupConv.projectId
        : { _id: pid, name: 'Project' };
      pendingProjectIdRef.current = null;
      openThread(groupConv._id, projectMeta);
      return;
    }
    // No conv in cache — try to ensure one. We only fire this after the
    // initial load has settled (loading=false) so we don't double-fire while
    // the conversations fetch is still in-flight.
    if (!conversations) return;
    const projectMeta = projects.find((p) => p._id === pid) || { _id: pid, name: 'Project' };
    pendingProjectIdRef.current = null;
    startConversationForProject(projectMeta);
  }, [conversations, loading, projects]); // eslint-disable-line react-hooks/exhaustive-deps

  // Real-time chat via Socket.IO — same event names as customer chat since
  // the backend reuses the conversation:{id} room pattern.
  useRealtimeChat(selectedThread, {
    onNewMessage: (msg) => {
      setMessages(prev => {
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
      setIsOpen(false); setSelectedThread(null); setSelectedProject(null); setMessages([]); setView('list');
      // Keep the launcher context in sync so an external "is open?" read is honest.
      launcher.closeChat?.();
    } else {
      setIsOpen(true);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || sending || !selectedThread) return;
    const txt = newMessage.trim();
    setSending(true);
    try {
      const res = await api(`/api/project-conversations/${selectedThread}/messages`, 'POST', {
        text: txt,
      });
      setNewMessage('');
      const sent = res.ok ? res.data?.data : null;
      setMessages(prev => [...prev, sent || {
        _id: Date.now(),
        sender: { _id: userId, first_name: userData?.first_name, last_name: userData?.last_name },
        text: txt,
        createdAt: new Date().toISOString(),
      }]);
    } catch (e) { console.error('Send failed:', e); }
    finally { setSending(false); }
  };

  const handleSendAttachment = async (filesOrFile) => {
    const fileList = Array.isArray(filesOrFile) ? filesOrFile : [filesOrFile];
    if (fileList.length === 0 || !selectedThread) return;
    setSending(true);
    try {
      // Upload all files in parallel (project-chat has its own upload endpoint
      // that returns the proxy URL for use in attachments[]).
      const uploadResults = await Promise.all(fileList.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
          const res = await api(`/api/project-conversations/upload`, 'POST', formData);
          const data = res.data;
          if (data?.status === 'success' && data.data?.url) {
            return { url: data.data.url, filename: data.data.filename, mimetype: data.data.mimetype, size: data.data.size };
          }
        } catch {}
        return null;
      }));

      const attachments = uploadResults.filter(Boolean);
      if (attachments.length > 0) {
        const allImages = attachments.every(a => a.mimetype?.startsWith('image/'));
        const res = await api(`/api/project-conversations/${selectedThread}/messages`, 'POST', {
          text: allImages ? '' : attachments.map(a => a.filename).join(', '),
          attachments,
        });
        const sent = res.ok ? res.data?.data : null;
        setMessages(prev => [...prev, sent || {
          _id: Date.now(),
          sender: { _id: userId, first_name: userData?.first_name, last_name: userData?.last_name },
          text: '',
          attachments,
          createdAt: new Date().toISOString(),
        }]);
      }
    } catch (e) { console.error('Send failed:', e); }
    finally { setSending(false); }
  };

  const openThread = async (convId, projectMeta) => {
    setSelectedProject(projectMeta);
    setMessages([]);
    setView('thread');
    setSelectedThread(null);
    setTimeout(() => setSelectedThread(convId), 0);
    try { await api(`/api/project-conversations/${convId}/read`, 'PATCH'); } catch { /* silent */ }
  };

  const startConversationForProject = async (project) => {
    // Fast path: group conversation already exists in our cache.
    const groupConv = conversations.find(
      (c) => c.kind === 'group' && (c.projectId?._id === project._id || c.projectId === project._id)
    );
    if (groupConv) {
      openThread(groupConv._id, project);
      return;
    }

    // Slow path: no group conv yet (project pre-dates the chat backend, or
    // its participants don't include the current user yet). Ask the backend
    // to ensure-and-return; the endpoint is idempotent so this is safe even
    // under concurrent clicks.
    setLoading(true);
    try {
      const res = await api(`/api/project-conversations/project/${project._id}/ensure`, 'POST');
      const conv = res.ok ? res.data?.data : null;
      if (conv?._id) {
        setConversations((prev) => {
          if (prev.some((c) => c._id === conv._id)) return prev;
          return [conv, ...prev];
        });
        openThread(conv._id, project);
      } else {
        // No role-holders configured on the project — surface an empty thread.
        setSelectedProject(project);
        setSelectedThread(null);
        setMessages([]);
        setView('thread');
      }
    } catch (e) {
      console.error('Ensure conversation failed:', e);
      setSelectedProject(project);
      setSelectedThread(null);
      setMessages([]);
      setView('thread');
    } finally {
      setLoading(false);
    }
  };

  const goBack = async () => {
    setSelectedThread(null); setSelectedProject(null); setMessages([]); setView('list');
    try {
      const r = await api(`/api/project-conversations`, 'GET');
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

  // Group messages by date + consecutive sender — same logic as customer chat,
  // but `mine` is computed against the project-chat sender shape (sender._id
  // populated from the User ref, no `from: 'customer'` discriminator).
  const groupedMessages = useMemo(() => {
    const items = [];
    let lastDate = '', lastSender = '', lastDir = '';
    messages.forEach((msg, idx) => {
      const msgDate = msg.createdAt ? new Date(msg.createdAt).toDateString() : '';
      if (msgDate !== lastDate) { items.push({ type: 'date', date: msg.createdAt }); lastDate = msgDate; lastSender = ''; }
      const senderId = msg.sender?._id || msg.sender;
      const dir = senderId === userId || senderId?.toString?.() === userId ? 'mine' : 'theirs';
      const isFirst = dir !== lastDir || senderId !== lastSender;
      const nextMsg = messages[idx + 1];
      const nextSenderId = nextMsg?.sender?._id || nextMsg?.sender;
      const nextDir = nextMsg ? (nextSenderId === userId || nextSenderId?.toString?.() === userId ? 'mine' : 'theirs') : '';
      const isLast = dir !== nextDir || idx === messages.length - 1;
      items.push({ type: 'msg', msg, isMine: dir === 'mine', isFirst, isLast, showAvatar: isLast });
      lastDir = dir; lastSender = senderId;
    });
    return items;
  }, [messages, userId]);

  // Filter conversations by search — match by project name, work order, or
  // the other DM-target name.
  const filteredConvos = useMemo(() => {
    if (!search) return conversations;
    const q = search.toLowerCase();
    return conversations.filter(c => {
      const projectName = c.projectId?.name || '';
      const projectWO = c.projectId?.workOrder || '';
      const other = (c.participants || [])
        .map((p) => p.userId)
        .find((u) => u && u._id !== userId);
      const otherName = other ? `${other.first_name || ''} ${other.last_name || ''}` : '';
      return (
        projectName.toLowerCase().includes(q) ||
        projectWO.toLowerCase().includes(q) ||
        otherName.toLowerCase().includes(q)
      );
    });
  }, [conversations, search, userId]);

  // Filter projects by search.
  const filteredProjects = useMemo(() => {
    if (!search) return projects;
    const q = search.toLowerCase();
    return projects.filter(
      (p) =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.workOrder || '').toLowerCase().includes(q) ||
        (p.client || '').toLowerCase().includes(q)
    );
  }, [projects, search]);

  if (!userId) return null;

  // Sender label for the thread header — for group chats it's the project
  // name; for DMs it's the other participant.
  const headerName = selectedProject?.name || 'Project Chat';
  const headerSubtitle = selectedProject?.workOrder
    ? `Work Order: ${selectedProject.workOrder}`
    : 'Group conversation';

  return (
    <>
      {/* ─── Floating Bubble ─── */}
      <button onClick={toggleChat}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br ${t.gradient} text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center`}>
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
                  <h2 className="text-lg font-bold text-gray-900">Project Chat</h2>
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
                    placeholder="Search projects, conversations..."
                    className={`w-full text-sm pl-9 pr-3 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 ${t.ring} transition-all`} />
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-1">
                  {[{ key: 'chats', label: 'Chats' }, { key: 'projects', label: 'Projects' }].map(tabDef => (
                    <button key={tabDef.key} onClick={() => setTab(tabDef.key)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                        tab === tabDef.key ? `${t.pillBg} ${t.pillText}` : 'text-gray-500 hover:bg-gray-100'
                      }`}>{tabDef.label}</button>
                  ))}
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto px-1">
                {loading ? (
                  <div className="flex items-center justify-center h-40"><Loader2 className={`w-5 h-5 animate-spin ${t.primaryText}`} /></div>
                ) : tab === 'chats' ? (
                  filteredConvos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                      <MessageCircle className="w-8 h-8 mb-2 opacity-30" />
                      <p className="text-xs">No conversations yet</p>
                      <button onClick={() => setTab('projects')} className={`text-xs ${t.primaryDeep} mt-1 hover:underline`}>Start one</button>
                    </div>
                  ) : (
                    filteredConvos.map(c => (
                      <ConvoItem
                        key={c._id}
                        conv={c}
                        currentUserId={userId}
                        t={t}
                        onClick={() => openThread(c._id, c.projectId || { name: 'Project' })}
                      />
                    ))
                  )
                ) : (
                  filteredProjects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                      <Users className="w-8 h-8 mb-2 opacity-30" />
                      <p className="text-xs">No projects assigned yet</p>
                    </div>
                  ) : (
                    filteredProjects.map(p => <ProjectItem key={p._id} project={p} t={t} onClick={() => startConversationForProject(p)} />)
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
                <Avatar userId={selectedProject?._id} name={headerName} size="md" online />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{headerName}</p>
                  <p className={`text-[10px] ${t.primaryText}`}>{headerSubtitle}</p>
                </div>
                {selectedThread && (
                  <button
                    onClick={handleToggleMute}
                    disabled={muteBusy}
                    title={mutedConversationIds.has(selectedThread) ? 'Unmute this chat' : 'Mute this chat'}
                    className={`p-1.5 rounded-full transition-colors disabled:opacity-50 ${
                      mutedConversationIds.has(selectedThread)
                        ? `${t.iconActiveBg} ${t.iconActiveText}`
                        : 'hover:bg-gray-100 text-gray-500'
                    }`}
                  >
                    {mutedConversationIds.has(selectedThread) ? (
                      <BellOff className="w-4 h-4" />
                    ) : (
                      <Bell className="w-4 h-4" />
                    )}
                  </button>
                )}
                <button onClick={toggleChat} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 py-2 bg-white">
                {loading ? (
                  <div className="flex items-center justify-center h-full"><Loader2 className={`w-5 h-5 animate-spin ${t.primaryText}`} /></div>
                ) : messages.length === 0 && !selectedThread ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <Avatar userId={selectedProject?._id} name={headerName} size="lg" />
                    <p className="text-sm font-medium text-gray-700 mt-2">{headerName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{headerSubtitle}</p>
                    <p className="text-xs text-gray-400 mt-3">Say hello to start the conversation</p>
                  </div>
                ) : (
                  <>
                    {messages.length > 0 && (
                      <div className="flex flex-col items-center mb-4 mt-2">
                        <Avatar userId={selectedProject?._id} name={headerName} size="lg" />
                        <p className="text-xs font-medium text-gray-700 mt-1">{headerName}</p>
                        <p className="text-[10px] text-gray-400">{headerSubtitle}</p>
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
                          senderName={item.isMine ? undefined : (
                            item.msg.sender
                              ? `${item.msg.sender.first_name || ''} ${item.msg.sender.last_name || ''}`.trim() || item.msg.sender.username
                              : 'Unknown'
                          )}
                          senderRole={item.isMine ? undefined : item.msg.sender?.role}
                          showName={true}
                          senderId={item.isMine ? userId : (item.msg.sender?._id || item.msg.sender)}
                          currentUserId={userId}
                          timestamp={item.isLast ? item.msg.createdAt : undefined}
                          readAt={item.msg.readAt}
                          attachments={item.msg.attachments}
                          allConversationImages={allConversationImages}
                          reactions={(item.msg.reactions || []).map(r => ({ emoji: r.emoji, userId: r.userId?._id || r.userId }))}
                          edited={item.msg.edited}
                          deleted={item.msg.deleted}
                          showAvatar={item.showAvatar}
                          isFirst={item.isFirst}
                          isLast={item.isLast}
                          theme={t.bubbleTheme}
                          // Project-chat backend uses different endpoints than
                          // customer chat — pass mutation callbacks so the
                          // SharedChatMessage prefers them over the hardcoded
                          // /api/client-conversations/* fallbacks.
                          onEdit={async (id, text) => {
                            try {
                              await api(`/api/project-conversations/messages/${id}`, 'PUT', { text });
                            } catch (e) { console.error('Edit failed:', e); }
                          }}
                          onDelete={async (id) => {
                            try {
                              await api(`/api/project-conversations/messages/${id}`, 'DELETE');
                            } catch (e) { console.error('Delete failed:', e); }
                          }}
                          onReact={async (id, emoji) => {
                            try {
                              await api(`/api/project-conversations/messages/${id}/react`, 'POST', { emoji });
                            } catch (e) { console.error('React failed:', e); }
                          }}
                          onRefresh={async () => {
                            if (!selectedThread) return;
                            try {
                              const res = await api(`/api/project-conversations/${selectedThread}/messages?limit=100`, 'GET');
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
                <AttachmentMenu onSendAttachment={handleSendAttachment} theme={t.bubbleTheme} disabled={sending} />
                <div className="flex-1 relative">
                  <input value={newMessage} onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="Aa"
                    className={`w-full text-sm px-4 py-2 rounded-full bg-gray-100 focus:outline-none focus:bg-gray-50 focus:ring-2 ${t.ring} transition-all`} />
                </div>
                <div className="relative">
                  <button onClick={() => setShowEmoji(p => !p)}
                    className={`p-2 rounded-full transition-colors shrink-0 ${showEmoji ? `${t.iconActiveBg} ${t.iconActiveText}` : `hover:bg-gray-100 ${t.primaryText}`}`}>
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
                  className={`p-2 rounded-full ${t.primary} text-white ${t.primaryHover} disabled:opacity-40 transition-colors shrink-0`}>
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
