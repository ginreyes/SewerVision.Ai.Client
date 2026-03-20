"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Inbox,
  Search,
  PenSquare,
  MailOpen,
  Loader2,
  Send,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/components/providers/UserContext";
import { useAlert } from "@/components/providers/AlertProvider";
import EmptySewerComponent from "@/components/shared/EmptySewerComponent";

// Extracted components
import MessageDetail from "@/components/customer-rep/inbox/MessageDetail";
import MessageRow from "@/components/customer-rep/inbox/MessageRow";
import FolderSidebar from "@/components/customer-rep/inbox/FolderSidebar";
import { getUserName } from "@/components/customer-rep/inbox/constants";

import {
  useMessagesInbox,
  useMessagesSent,
  useMessagesContacts,
  useMessagesUnreadCount,
  useMarkAllMessagesRead,
  useSendMessage,
} from "@/hooks/useQueryHooks";

export default function CustomerRepInbox() {
  const { userId } = useUser();
  const { showAlert } = useAlert();

  const [activeFolder, setActiveFolder] = useState("inbox");
  const [search, setSearch] = useState("");
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [starredOnly, setStarredOnly] = useState(false);

  // Compose form state
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");

  const inboxParams = useMemo(() => {
    const p = {};
    if (search) p.search = search;
    if (starredOnly) p.starred = "true";
    return p;
  }, [search, starredOnly]);

  const { data: inboxData, isLoading: inboxLoading } = useMessagesInbox(userId, inboxParams, { refetchInterval: 15000 });
  const { data: sentData, isLoading: sentLoading } = useMessagesSent(userId, { enabled: activeFolder === "sent" });
  const { data: unreadData } = useMessagesUnreadCount(userId, { refetchInterval: 15000 });
  const { data: contacts } = useMessagesContacts(userId);

  const markAllReadMutation = useMarkAllMessagesRead();
  const sendMutation = useSendMessage();

  const messages = useMemo(() => {
    const raw = activeFolder === "sent" ? sentData : inboxData;
    return Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
  }, [activeFolder, inboxData, sentData]);

  const unreadCount = unreadData?.count || 0;
  const loading = activeFolder === "sent" ? sentLoading : inboxLoading;

  const handleReply = useCallback((msg) => {
    setReplyTo(msg);
    setComposeTo(msg.from?._id || "");
    setComposeSubject(`Re: ${msg.subject}`);
    setComposeBody("");
    setSelectedMsg(null);
    setShowCompose(true);
  }, []);

  const handleCompose = useCallback(() => {
    setReplyTo(null);
    setComposeTo("");
    setComposeSubject("");
    setComposeBody("");
    setSelectedMsg(null);
    setShowCompose(true);
  }, []);

  const handleCloseCompose = useCallback(() => {
    setShowCompose(false);
    setReplyTo(null);
  }, []);

  const handleSend = useCallback(async () => {
    if (!composeTo || !composeSubject.trim() || !composeBody.trim()) {
      showAlert("Please fill all fields", "error");
      return;
    }
    try {
      await sendMutation.mutateAsync({
        from: userId,
        to: composeTo,
        subject: composeSubject.trim(),
        body: composeBody.trim(),
        parentMessageId: replyTo?._id,
      });
      showAlert("Message sent", "success");
      handleCloseCompose();
    } catch (e) {
      showAlert(e.message, "error");
    }
  }, [composeTo, composeSubject, composeBody, userId, replyTo, sendMutation, showAlert, handleCloseCompose]);

  const handleFolderChange = useCallback((key) => {
    if (key === "starred") {
      setActiveFolder("inbox");
      setStarredOnly(true);
    } else {
      setActiveFolder(key);
      setStarredOnly(false);
    }
    setSelectedMsg(null);
    setShowCompose(false);
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    await markAllReadMutation.mutateAsync(userId);
    showAlert("All marked as read", "success");
  }, [userId, markAllReadMutation, showAlert]);

  // Right panel content
  const renderRightPanel = () => {
    // Compose mode — inline like Gmail
    if (showCompose) {
      return (
        <div className="h-full flex flex-col bg-white">
          {/* Compose Header */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-teal-600 to-cyan-600 shadow-md">
            <span className="font-semibold text-white">
              {replyTo ? "Reply" : "New Message"}
            </span>
            <Button variant="ghost" size="sm" onClick={handleCloseCompose} className="text-white/80 hover:text-white hover:bg-white/10 h-7 w-7 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Compose Fields */}
          <div className="flex-1 overflow-y-auto">
            {/* To Field */}
            <div className="px-5 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-400 w-16">To</span>
                <div className="flex-1">
                  <Select value={composeTo} onValueChange={setComposeTo}>
                    <SelectTrigger className="h-9 border-0 shadow-none bg-transparent px-0 focus:ring-0">
                      <SelectValue placeholder="Select recipient..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(contacts || [])
                        .filter((c) => c._id !== userId && ['customer', 'customer-rep', 'admin'].includes(c.role))
                        .map((c) => (
                        <SelectItem key={c._id} value={c._id}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{getUserName(c)}</span>
                            <span className="text-xs text-gray-400">{c.email}</span>
                            <span className="text-[10px] text-gray-400 capitalize">({c.role})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Subject Field */}
            <div className="px-5 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-400 w-16">Subject</span>
                <Input
                  placeholder="Enter subject..."
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  className="h-9 border-0 shadow-none bg-transparent px-0 focus-visible:ring-0"
                />
              </div>
            </div>

            {/* Message Body */}
            <div className="px-5 py-4 flex-1">
              <Textarea
                placeholder="Write your message..."
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                rows={14}
                className="resize-none border-0 shadow-none bg-transparent px-0 focus-visible:ring-0 text-sm leading-relaxed"
              />
            </div>
          </div>

          {/* Compose Footer */}
          <div className="border-t border-gray-200 px-5 py-3 flex items-center justify-between bg-gray-50/50">
            <Button variant="ghost" size="sm" onClick={handleCloseCompose} className="text-gray-500">
              Discard
            </Button>
            <Button
              onClick={handleSend}
              disabled={sendMutation.isPending}
              className="bg-teal-600 hover:bg-teal-700 px-6"
            >
              {sendMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-1.5" />
              )}
              Send
            </Button>
          </div>
        </div>
      );
    }

    // Message detail view
    if (selectedMsg) {
      return (
        <MessageDetail
          message={selectedMsg}
          userId={userId}
          onBack={() => setSelectedMsg(null)}
          onReply={handleReply}
        />
      );
    }

    // Empty state
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <MailOpen className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">Select a message to read</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 bg-gray-50">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-md">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Inbox</h1>
              <p className="text-sm text-gray-500">Internal messages and ticket updates</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleCompose}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <PenSquare className="w-4 h-4 mr-1.5" /> Compose
          </Button>
        </div>

        {/* Gmail-style Layout */}
        <div className="flex gap-4 h-[calc(100vh-140px)]">
          {/* Left Sidebar */}
          <FolderSidebar
            activeFolder={activeFolder}
            starredOnly={starredOnly}
            unreadCount={unreadCount}
            onFolderChange={handleFolderChange}
            onMarkAllRead={handleMarkAllRead}
            markingAllRead={markAllReadMutation.isPending}
          />

          {/* Message List + Detail/Compose */}
          <div className="flex-1 flex border border-gray-200 rounded-xl overflow-hidden min-h-0 shadow-sm">
            {/* Message List */}
            <div className={`${selectedMsg || showCompose ? "hidden lg:flex" : "flex"} flex-col w-full lg:w-[380px] border-r border-gray-100`}>
              {/* Search */}
              <div className="p-3 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search messages..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-9 bg-gray-50 border-gray-200"
                  />
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-5 h-5 animate-spin text-teal-500" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-12">
                    <EmptySewerComponent
                      variant="no-tickets"
                      title={starredOnly ? "No starred messages" : "No messages yet"}
                      subtitle={starredOnly ? "Star messages to find them here" : "Compose a new message to get started"}
                      size="sm"
                    />
                  </div>
                ) : (
                  messages.map((msg) => {
                    const otherUser = activeFolder === "sent" ? msg.to : msg.from;
                    return (
                      <MessageRow
                        key={msg._id}
                        msg={msg}
                        otherUser={otherUser}
                        isSelected={selectedMsg?._id === msg._id}
                        isUnread={!msg.read && activeFolder !== "sent"}
                        onClick={() => { setSelectedMsg(msg); setShowCompose(false); }}
                      />
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Panel: Detail or Compose */}
            <div className={`${selectedMsg || showCompose ? "flex" : "hidden lg:flex"} flex-col flex-1 min-w-0`}>
              {renderRightPanel()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
