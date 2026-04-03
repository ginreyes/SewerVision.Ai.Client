'use client';

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useUser } from './UserContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { userId } = useUser();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const listenersRef = useRef(new Map());

  useEffect(() => {
    if (!userId) return;

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

    const socket = io(backendUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      // Join user room for notifications
      socket.emit('join', userId);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket.IO] Connection error:', err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [userId]);

  // Join a conversation room
  const joinConversation = useCallback((conversationId) => {
    if (socketRef.current && conversationId) {
      socketRef.current.emit('join-conversation', conversationId);
    }
  }, []);

  // Leave a conversation room
  const leaveConversation = useCallback((conversationId) => {
    if (socketRef.current && conversationId) {
      socketRef.current.emit('leave-conversation', conversationId);
    }
  }, []);

  // Send typing indicator
  const sendTyping = useCallback((conversationId, isTyping) => {
    if (socketRef.current && conversationId) {
      socketRef.current.emit('typing', { conversationId, userId, isTyping });
    }
  }, [userId]);

  // Subscribe to an event
  const on = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  }, []);

  // Unsubscribe from an event
  const off = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  }, []);

  return (
    <SocketContext.Provider value={{ connected, joinConversation, leaveConversation, sendTyping, on, off }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
