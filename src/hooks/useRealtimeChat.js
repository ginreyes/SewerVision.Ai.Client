'use client';

import { useEffect, useCallback } from 'react';
import { useSocket } from '@/components/providers/SocketProvider';

/**
 * Hook for real-time chat in a conversation.
 * Joins the conversation room and listens for events.
 *
 * @param {string} conversationId - The conversation to listen to
 * @param {object} handlers - Event handlers
 * @param {function} handlers.onNewMessage - Called when a new message arrives
 * @param {function} handlers.onMessageEdited - Called when a message is edited
 * @param {function} handlers.onMessageDeleted - Called when a message is deleted
 * @param {function} handlers.onReactionToggled - Called when a reaction changes
 * @param {function} handlers.onMessagesSeen - Called when messages are read
 * @param {function} handlers.onUserTyping - Called when someone is typing
 */
export function useRealtimeChat(conversationId, handlers = {}) {
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !conversationId) return;

    // Join conversation room
    socket.joinConversation(conversationId);

    // Set up listeners
    const onNewMessage = (data) => {
      if (data.conversationId === conversationId && handlers.onNewMessage) {
        handlers.onNewMessage(data.message);
      }
    };

    const onMessageEdited = (data) => {
      if (data.conversationId === conversationId && handlers.onMessageEdited) {
        handlers.onMessageEdited(data.messageId, data.text);
      }
    };

    const onMessageDeleted = (data) => {
      if (data.conversationId === conversationId && handlers.onMessageDeleted) {
        handlers.onMessageDeleted(data.messageId);
      }
    };

    const onReactionToggled = (data) => {
      if (data.conversationId === conversationId && handlers.onReactionToggled) {
        handlers.onReactionToggled(data.messageId, data.reactions);
      }
    };

    const onMessagesSeen = (data) => {
      if (data.conversationId === conversationId && handlers.onMessagesSeen) {
        handlers.onMessagesSeen(data.seenByUserId);
      }
    };

    const onUserTyping = (data) => {
      if (handlers.onUserTyping) {
        handlers.onUserTyping(data.userId, data.isTyping);
      }
    };

    socket.on('new-message', onNewMessage);
    socket.on('message-edited', onMessageEdited);
    socket.on('message-deleted', onMessageDeleted);
    socket.on('reaction-toggled', onReactionToggled);
    socket.on('messages-seen', onMessagesSeen);
    socket.on('user-typing', onUserTyping);

    return () => {
      socket.leaveConversation(conversationId);
      socket.off('new-message', onNewMessage);
      socket.off('message-edited', onMessageEdited);
      socket.off('message-deleted', onMessageDeleted);
      socket.off('reaction-toggled', onReactionToggled);
      socket.off('messages-seen', onMessagesSeen);
      socket.off('user-typing', onUserTyping);
    };
  }, [socket, conversationId]);
}
