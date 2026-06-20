"use client";
import { useEffect, useState, useRef, useCallback } from "react";

// July 1 — hook for the two new socket events landing this week:
//   - 'messages-read': another participant bulk-read up to a message
//   - 'user-typing':   another participant is (still) typing in this convo
//
// Caller passes a socket instance + conversationId. Hook returns:
//   typingUsers: array of { userId } currently typing
//   onMessagesRead: subscribe to read-receipt updates
//   emitTyping(isTyping): client -> server typing event with built-in throttle
//                         so we don't even hit the server-side debounce path
//
// Hook is intentionally socket-instance agnostic (just needs .on/.off/.emit)
// so it works with both the global io() connection and per-page sockets.

const CLIENT_TYPING_THROTTLE_MS = 1000;
const STALE_TYPING_MS = 4000;

export function useChatPresence(socket, conversationId, userId) {
  const [typingUsers, setTypingUsers] = useState([]);
  const lastTypingEmitRef = useRef(0);
  const staleTimersRef = useRef(new Map());

  useEffect(() => {
    if (!socket || !conversationId) return undefined;

    const onUserTyping = ({ userId: typerId, isTyping }) => {
      if (typerId === userId) return; // ignore self
      setTypingUsers((prev) => {
        const exists = prev.find((u) => u.userId === typerId);
        if (isTyping) {
          if (exists) return prev;
          return [...prev, { userId: typerId }];
        }
        return prev.filter((u) => u.userId !== typerId);
      });

      if (isTyping) {
        // Arm a client-side stale-clear in case the stop event never arrives.
        const existing = staleTimersRef.current.get(typerId);
        if (existing) clearTimeout(existing);
        staleTimersRef.current.set(
          typerId,
          setTimeout(() => {
            setTypingUsers((prev) => prev.filter((u) => u.userId !== typerId));
            staleTimersRef.current.delete(typerId);
          }, STALE_TYPING_MS),
        );
      } else {
        const t = staleTimersRef.current.get(typerId);
        if (t) clearTimeout(t);
        staleTimersRef.current.delete(typerId);
      }
    };

    socket.on("user-typing", onUserTyping);
    return () => {
      socket.off("user-typing", onUserTyping);
      for (const t of staleTimersRef.current.values()) clearTimeout(t);
      staleTimersRef.current.clear();
    };
  }, [socket, conversationId, userId]);

  const emitTyping = useCallback(
    (isTyping) => {
      if (!socket || !conversationId || !userId) return;
      const now = Date.now();
      // Throttle "is typing" client-side so we send one per 1s. Stop events
      // always go through verbatim.
      if (isTyping && now - lastTypingEmitRef.current < CLIENT_TYPING_THROTTLE_MS) return;
      lastTypingEmitRef.current = isTyping ? now : 0;
      socket.emit("typing", { conversationId, userId, isTyping });
    },
    [socket, conversationId, userId],
  );

  const onMessagesRead = useCallback(
    (handler) => {
      if (!socket) return () => {};
      socket.on("messages-read", handler);
      return () => socket.off("messages-read", handler);
    },
    [socket],
  );

  return { typingUsers, emitTyping, onMessagesRead };
}
