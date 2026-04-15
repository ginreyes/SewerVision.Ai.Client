"use client";

import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  MessageCircle, Send, Search, Loader2, Plus, Users, Bell,
  Paperclip, Smile, MoreHorizontal, Trash2, Check, ArrowLeft,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/components/providers/UserContext";
import { useAlert } from "@/components/providers/AlertProvider";
import {
  useUserConversations, useUserMessages, useSendClientMessage,
  useMarkConversationRead, useUserProjects,
} from "@/hooks/useQueryHooks";
import { api } from "@/lib/helper";
import { BACKEND_URL } from "@/lib/config";
import { avatarSrc, getAvatarColor, getInitials } from "@/components/admin/constants";
import ChatMessage, { ChatDateSeparator } from "@/components/shared/ChatMessage";
import EmojiPicker from "@/components/shared/EmojiPicker";
import AttachmentMenu from "@/components/shared/AttachmentMenu";
import { useRealtimeChat } from "@/hooks/useRealtimeChat";

export default function ClientHub() {
  const { userId } = useUser();
  const { showAlert } = useAlert();
  const [selected, setSelected] = useState(null);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [convoMenu, setConvoMenu] = useState(null);
  const [localMessages, setLocalMessages] = useState([]);
  const fileInputRef = useRef(null);
  const endRef = useRef(null);

  const { data: convoData, isLoading: convosLoading, refetch: refetchConvos } = useUserConversations(userId);
  const conversations = useMemo(() => {
    const raw = Array.isArray(convoData) ? convoData : (convoData?.data || []);
    return raw.map(c => ({
      ...c,
      id: c._id,
      customer: c.customerName || (c.customerId?.first_name ? `${c.customerId.first_name} ${c.customerId.last_name || ''}`.trim() : 'Customer'),
      customerId_resolved: c.customerId?._id || c.customerId,
      project: c.projectCode || 'Project',
    }));
  }, [convoData]);

  const { data: msgData, isLoading: msgsLoading, refetch: refetchMsgs } = useUserMessages(selected);
  const messages = useMemo(() => {
    const apiMsgs = Array.isArray(msgData) ? msgData : (msgData?.data || []);
    // Merge with local optimistic messages
    const apiIds = new Set(apiMsgs.map(m => m._id));
    const unique = [...apiMsgs, ...localMessages.filter(m => !apiIds.has(m._id))];
    return unique.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [msgData, localMessages]);

  const sendMessage = useSendClientMessage();
  const markRead = useMarkConversationRead();

  const { data: projectsData } = useUserProjects(userId);
  const projects = useMemo(() => Array.isArray(projectsData) ? projectsData : (projectsData?.data || []), [projectsData]);

  const filtered = useMemo(() =>
    conversations.filter(c => !search || c.customer?.toLowerCase().includes(search.toLowerCase()) || c.project?.toLowerCase().includes(search.toLowerCase())),
    [conversations, search]
  );

  const conv = useMemo(() => conversations.find(c => c.id === selected) ?? null, [conversations, selected]);
  const totalUnread = useMemo(() => conversations.reduce((s, c) => s + (c.unreadCount || 0), 0), [conversations]);

  // Auto-scroll
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Real-time chat via Socket.IO
  useRealtimeChat(selected, {
    onNewMessage: (msg) => {
      setLocalMessages(prev => {
        if (prev.some(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      // Also refetch to sync
      refetchMsgs();
    },
    onMessageEdited: () => refetchMsgs(),
    onMessageDeleted: () => refetchMsgs(),
    onReactionToggled: () => refetchMsgs(),
    onMessagesSeen: () => refetchMsgs(),
  });

  // Group messages by date + consecutive sender
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

  const groupedMessages = useMemo(() => {
    const items = [];
    let lastDate = '', lastDir = '';
    messages.forEach((msg, idx) => {
      const msgDate = msg.createdAt ? new Date(msg.createdAt).toDateString() : '';
      if (msgDate !== lastDate) { items.push({ type: 'date', date: msg.createdAt }); lastDate = msgDate; lastDir = ''; }
      const dir = msg.from === 'user' || (msg.sender?._id || msg.sender) === userId ? 'mine' : 'theirs';
      const isFirst = dir !== lastDir;
      const nextMsg = messages[idx + 1];
      const nextDir = nextMsg ? (nextMsg.from === 'user' || (nextMsg.sender?._id || nextMsg.sender) === userId ? 'mine' : 'theirs') : '';
      const isLast = dir !== nextDir || idx === messages.length - 1;
      items.push({ type: 'msg', msg, isMine: dir === 'mine', isFirst, isLast });
      lastDir = dir;
    });
    return items;
  }, [messages, userId]);

  const handleSelect = useCallback((id) => { setSelected(id); setLocalMessages([]); markRead.mutate(id); }, [markRead]);

  const handleSend = useCallback(() => {
    if (!input.trim() || !selected) return;
    const txt = input.trim();
    // Optimistic local message
    const optimistic = { _id: `opt-${Date.now()}`, from: 'user', sender: { _id: userId }, text: txt, createdAt: new Date().toISOString() };
    setLocalMessages(prev => [...prev, optimistic]);
    setInput("");
    setShowEmoji(false);

    sendMessage.mutate(
      { conversationId: selected, text: txt, from: 'user', sender: userId },
      {
        onSuccess: () => { setLocalMessages([]); },
        onError: () => { showAlert("Failed to send", "error"); setLocalMessages(prev => prev.filter(m => m._id !== optimistic._id)); },
      },
    );
  }, [input, selected, sendMessage, showAlert, userId]);

  const handleKeyDown = useCallback((e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }, [handleSend]);

  const handleSendAttachment = async (filesOrFile, fileType) => {
    const fileList = Array.isArray(filesOrFile) ? filesOrFile : [filesOrFile];
    if (fileList.length === 0 || !selected) return;
    try {
      const token = document.cookie.split('authToken=')[1]?.split(';')[0] || '';

      // Upload ALL files in parallel
      const uploadResults = await Promise.all(fileList.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
          const res = await fetch(`${BACKEND_URL}/api/client-conversations/${selected}/upload`, {
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
        const allImages = attachments.every(a => a.mimetype?.startsWith('image/'));
        sendMessage.mutate(
          { conversationId: selected, text: allImages ? '' : attachments.map(a => a.filename).join(', '), from: 'user', sender: userId, attachments },
          { onError: () => showAlert("Failed to send", "error") },
        );
      }
    } catch {
      showAlert("Failed to upload", "error");
    }
  };

  const refreshMessages = useCallback(() => { refetchMsgs(); }, [refetchMsgs]);

  const handleDeleteConvo = async (convoId) => {
    try {
      await api(`/api/client-conversations/${convoId}`, 'DELETE');
      refetchConvos();
      if (selected === convoId) { setSelected(null); setLocalMessages([]); }
      setConvoMenu(null);
      showAlert("Conversation deleted", "success");
    } catch { showAlert("Failed to delete", "error"); }
  };

  async function handleCreateConversation(project) {
    if (creating) return;
    setCreating(true);
    try {
      const custName = project.customerId?.first_name ? `${project.customerId.first_name} ${project.customerId.last_name || ''}`.trim() : 'Customer';
      const res = await api('/api/client-conversations', 'POST', {
        customerId: project.customerId?._id || project.customerId,
        customerName: custName,
        projectId: project._id,
        projectCode: project.workOrder || project.name || 'Project',
        createdBy: userId,
      });
      if (res.ok) { showAlert("Conversation created", "success"); refetchConvos(); if (res.data?.data?._id) setSelected(res.data.data._id); }
      else showAlert(res.data?.message || "Failed", "error");
    } catch { showAlert("Failed", "error"); }
    finally { setCreating(false); }
  }

  const availableProjects = useMemo(() => {
    const convoProjectIds = new Set(conversations.map(c => (c.projectId || '').toString()));
    return projects.filter(p => !convoProjectIds.has(p._id?.toString()));
  }, [projects, conversations]);

  if (convosLoading) {
    return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white shadow-md">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Client Communication Hub</h1>
            <p className="text-sm text-gray-500">Direct messaging with customers per project</p>
          </div>
        </div>
        {totalUnread > 0 && (
          <Badge className="bg-indigo-500 text-white px-3 py-1 text-xs gap-1">
            <Bell className="w-3 h-3" />{totalUnread} unread
          </Badge>
        )}
      </div>

      <div className="flex gap-0 border border-gray-200 rounded-2xl overflow-hidden bg-white" style={{ height: "calc(100vh - 220px)", minHeight: 500 }}>
        {/* Sidebar */}
        <div className={`${selected ? 'hidden md:flex' : 'flex'} w-full md:w-80 shrink-0 border-r border-gray-100 flex-col`}>
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 && conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 px-4">
                <Users className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">No conversations yet</p>
              </div>
            ) : (
              filtered.map(c => {
                const custId = c.customerId_resolved;
                const menuOpen = convoMenu === c.id;
                return (
                  <div key={c.id} className={`relative group flex items-center transition-colors ${selected === c.id ? "bg-indigo-50 border-l-2 border-l-indigo-500" : "hover:bg-gray-50"}`}>
                    <button onClick={() => handleSelect(c.id)} className="flex-1 text-left px-4 py-3 flex items-start gap-3">
                      <div className="relative shrink-0">
                        <img src={avatarSrc({ _id: custId })} alt="" className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold ${getAvatarColor(c.customer)}`}
                          style={{ display: 'none' }}>{getInitials(c.customer)}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-[13px] truncate ${c.unreadCount > 0 ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>{c.customer}</span>
                          {c.lastMessageAt && <span className="text-[10px] text-gray-400 ml-2">{new Date(c.lastMessageAt).toLocaleDateString([], { month: "short", day: "numeric" })}</span>}
                        </div>
                        <p className="text-[10px] text-indigo-500 font-medium">{c.project}</p>
                        {c.lastMessage && <p className="text-xs text-gray-400 truncate mt-0.5">{c.lastMessage}</p>}
                      </div>
                      {c.unreadCount > 0 && (
                        <span className="w-[18px] h-[18px] rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-1">{c.unreadCount}</span>
                      )}
                    </button>
                    {/* Context menu */}
                    <button onClick={(e) => { e.stopPropagation(); setConvoMenu(menuOpen ? null : c.id); }}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all ${menuOpen ? 'bg-gray-200 text-gray-700' : 'opacity-0 group-hover:opacity-100 hover:bg-gray-200 text-gray-400'}`}>
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {menuOpen && (
                      <div className="absolute right-2 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-20 w-40">
                        <button onClick={() => { markRead.mutate(c.id); setConvoMenu(null); }}
                          className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                          <Check className="w-3.5 h-3.5" />Mark as read
                        </button>
                        <button onClick={() => handleDeleteConvo(c.id)}
                          className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2">
                          <Trash2 className="w-3.5 h-3.5" />Delete chat
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {availableProjects.length > 0 && (
            <div className="border-t border-gray-100 p-3">
              <p className="text-[10px] text-gray-400 mb-2 font-medium uppercase tracking-wide">Start conversation:</p>
              <div className="space-y-1 max-h-28 overflow-y-auto">
                {availableProjects.slice(0, 4).map(p => {
                  const custName = p.customerId?.first_name ? `${p.customerId.first_name} ${p.customerId.last_name || ''}` : 'Customer';
                  return (
                    <button key={p._id} onClick={() => handleCreateConversation(p)} disabled={creating}
                      className="w-full text-left px-3 py-2 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-xs transition-colors flex items-center gap-2">
                      <Plus className="w-3 h-3 text-indigo-500 shrink-0" />
                      <span className="font-medium text-gray-800 truncate">{custName}</span>
                      <span className="text-gray-400 truncate">· {p.workOrder || p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Chat area */}
        <div className={`${selected ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
          {conv ? (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-100 bg-white shrink-0">
                <button onClick={() => setSelected(null)} className="md:hidden p-1 rounded-full hover:bg-gray-100 text-gray-500">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="relative">
                  <img src={avatarSrc({ _id: conv.customerId_resolved })} alt="" className="w-9 h-9 rounded-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold ${getAvatarColor(conv.customer)}`}
                    style={{ display: 'none' }}>{getInitials(conv.customer)}</div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{conv.customer}</p>
                  <p className="text-[10px] text-indigo-500">{conv.project}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-gray-50/30">
                {msgsLoading && messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <MessageCircle className="w-8 h-8 mb-2 opacity-30" />
                    <p className="text-sm">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  groupedMessages.map((item, idx) =>
                    item.type === 'date' ? (
                      <ChatDateSeparator key={`date-${idx}`} date={item.date} />
                    ) : (
                      <ChatMessage
                        key={item.msg._id || idx}
                        messageId={item.msg._id}
                        text={item.msg.text || item.msg.body || item.msg.content}
                        isMine={item.isMine}
                        senderName={item.isMine ? undefined : conv.customer}
                        senderId={item.isMine ? userId : conv.customerId_resolved}
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
                        theme="indigo"
                        onRefresh={refreshMessages}
                      />
                    )
                  )
                )}
                <div ref={endRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-gray-100 flex items-center gap-1.5 bg-white shrink-0">
                <AttachmentMenu onSendAttachment={handleSendAttachment} theme="indigo" disabled={sendMessage.isPending} />
                <Input value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
                  placeholder={`Message ${conv.customer}...`} className="flex-1 h-10 text-sm rounded-full px-4" />
                <div className="relative">
                  <button onClick={() => setShowEmoji(p => !p)}
                    className={`p-2 rounded-full transition-colors shrink-0 ${showEmoji ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100 text-indigo-500'}`}>
                    <Smile className="w-5 h-5" />
                  </button>
                  {showEmoji && <EmojiPicker onSelect={emoji => setInput(prev => prev + emoji)} onClose={() => setShowEmoji(false)} />}
                </div>
                <Button onClick={handleSend} size="sm" disabled={!input.trim() || sendMessage.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full w-10 h-10 p-0">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <MessageCircle className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">Select a conversation or start a new one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
