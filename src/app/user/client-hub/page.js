"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  MessageCircle, Send, Paperclip, Search, Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUser } from "@/components/providers/UserContext";
import { useAlert } from "@/components/providers/AlertProvider";
import {
  useUserConversations,
  useUserMessages,
  useSendClientMessage,
  useMarkConversationRead,
} from "@/hooks/useQueryHooks";
import { ConversationItem, MessageBubble } from "@/components/user/client-hub";

export default function ClientHub() {
  const { userId } = useUser();
  const { showAlert } = useAlert();
  const [selected, setSelected] = useState(null);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");

  const { data: convoData, isLoading: convosLoading } = useUserConversations(userId);
  const conversations = useMemo(() => Array.isArray(convoData) ? convoData : (convoData?.data || []), [convoData]);

  const { data: msgData, isLoading: msgsLoading } = useUserMessages(selected);
  const messages = useMemo(() => Array.isArray(msgData) ? msgData : (msgData?.data || []), [msgData]);

  const sendMessage = useSendClientMessage();
  const markRead = useMarkConversationRead();

  const filtered = useMemo(
    () =>
      conversations.filter(
        c =>
          !search ||
          c.customer.toLowerCase().includes(search.toLowerCase()) ||
          c.project.toLowerCase().includes(search.toLowerCase())
      ),
    [conversations, search]
  );

  const conv = useMemo(
    () => conversations.find(c => c.id === selected) ?? null,
    [conversations, selected]
  );

  const handleSelect = useCallback(
    (id) => {
      setSelected(id);
      markRead.mutate(id);
    },
    [markRead]
  );

  const handleSend = useCallback(() => {
    if (!input.trim() || !selected) return;
    sendMessage.mutate(
      { conversationId: selected, text: input.trim() },
      {
        onSuccess: () => setInput(""),
        onError: () => showAlert("Failed to send message", "error"),
      }
    );
  }, [input, selected, sendMessage, showAlert]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") handleSend();
    },
    [handleSend]
  );

  if (convosLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white shadow-md">
          <MessageCircle className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Client Communication Hub</h1>
          <p className="text-sm text-gray-500">Direct messaging with assigned customers per project</p>
        </div>
      </div>

      {conversations.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
          <MessageCircle className="w-8 h-8 mr-2 opacity-30" />
          <p className="text-sm">No conversations yet.</p>
        </div>
      ) : (
        <div
          className="flex gap-0 border border-gray-200 rounded-2xl overflow-hidden bg-white"
          style={{ height: "calc(100vh - 220px)", minHeight: 500 }}
        >
          {/* Sidebar */}
          <div className="w-72 shrink-0 border-r border-gray-100 flex flex-col">
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search clients..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filtered.map(c => (
                <ConversationItem
                  key={c.id}
                  conversation={c}
                  isSelected={selected === c.id}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 flex flex-col">
            {conv ? (
              <>
                {/* Chat header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${conv.color}`}
                  >
                    {conv.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{conv.customer}</p>
                    <p className="text-[10px] text-gray-400">
                      {conv.project} · {conv.online ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {msgsLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                    </div>
                  ) : (
                    messages.map(msg => (
                      <MessageBubble
                        key={msg.id}
                        message={msg}
                        isOwn={msg.from === "me"}
                        avatarContent={conv.avatar}
                        avatarColor={conv.color}
                      />
                    ))
                  )}
                </div>

                {/* Input */}
                <div className="p-3 border-t border-gray-100 flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <Input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="flex-1 h-9 text-sm"
                  />
                  <Button
                    onClick={handleSend}
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <MessageCircle className="w-8 h-8 mr-2 opacity-30" />
                <p className="text-sm">Select a conversation</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
