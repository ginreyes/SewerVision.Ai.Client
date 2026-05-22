'use client';

import { useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import projectChatApi from '@/data/projectChatApi';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';

/**
 * TanStack Query hooks for the team-internal project chat surface.
 * Mirrors the customer-rep inbox pattern but talks to /api/project-conversations.
 */

const KEYS = {
  myConversations: ['projectChat', 'mine'],
  forProject: (projectId) => ['projectChat', 'project', projectId],
  messages: (conversationId) => ['projectChat', 'messages', conversationId],
  unreadTotal: ['projectChat', 'unreadTotal'],
  pinned: (conversationId) => ['projectChat', 'pinned', conversationId],
};

export function useMyProjectConversations() {
  return useQuery({
    queryKey: KEYS.myConversations,
    queryFn: projectChatApi.listMine,
    staleTime: 30 * 1000,
  });
}

export function useProjectConversations(projectId) {
  return useQuery({
    queryKey: KEYS.forProject(projectId),
    queryFn: () => projectChatApi.listForProject(projectId),
    enabled: Boolean(projectId),
    staleTime: 30 * 1000,
  });
}

export function useProjectChatUnreadTotal() {
  return useQuery({
    queryKey: KEYS.unreadTotal,
    queryFn: projectChatApi.getUnreadTotal,
    staleTime: 15 * 1000,
    refetchInterval: 60 * 1000,
  });
}

/**
 * Paged messages for a single conversation. Uses infinite-query so the
 * "Load older" button can prepend prior pages without remounting the list.
 */
export function useProjectMessages(conversationId) {
  return useInfiniteQuery({
    queryKey: KEYS.messages(conversationId),
    queryFn: ({ pageParam = 1 }) => projectChatApi.getMessages(conversationId, { page: pageParam, limit: 50 }),
    enabled: Boolean(conversationId),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage?.pagination?.hasMore ? (lastPage.pagination.page + 1) : undefined,
    staleTime: 30 * 1000,
  });
}

/**
 * Send a message with optimistic update. Accepts either a raw string (legacy
 * call sites) or an object `{text, attachments}`. Replaces the temp entry
 * with the server-assigned _id on success, rolls back on error.
 */
export function useSendProjectMessage(conversationId, currentUser) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => {
      const payload = typeof input === 'string' ? { text: input } : (input || {});
      return projectChatApi.sendMessage(conversationId, {
        text: payload.text,
        attachments: payload.attachments,
        replyToMessageId: payload.replyToMessageId,
      });
    },
    onMutate: async (input) => {
      const payload = typeof input === 'string' ? { text: input } : (input || {});
      await queryClient.cancelQueries({ queryKey: KEYS.messages(conversationId) });
      const tempId = `tmp-${Date.now()}`;
      const optimistic = {
        _id: tempId,
        conversationId,
        sender: currentUser
          ? { _id: currentUser._id, first_name: currentUser.first_name, last_name: currentUser.last_name, role: currentUser.role }
          : null,
        text: payload.text || '',
        attachments: payload.attachments || [],
        createdAt: new Date().toISOString(),
        readBy: [],
        reactions: [],
        pending: true,
      };
      queryClient.setQueryData(KEYS.messages(conversationId), (old) => {
        if (!old?.pages?.length) {
          return { pages: [{ messages: [optimistic], pagination: { page: 1, limit: 50, total: 1, hasMore: false } }], pageParams: [1] };
        }
        const pages = [...old.pages];
        const last = pages[pages.length - 1];
        pages[pages.length - 1] = { ...last, messages: [...last.messages, optimistic] };
        return { ...old, pages };
      });
      return { tempId };
    },
    onSuccess: (saved, _vars, ctx) => {
      queryClient.setQueryData(KEYS.messages(conversationId), (old) => {
        if (!old?.pages?.length) return old;
        const pages = old.pages.map((p) => ({
          ...p,
          messages: p.messages.map((m) => (m._id === ctx.tempId ? saved : m)),
        }));
        return { ...old, pages };
      });
      queryClient.invalidateQueries({ queryKey: KEYS.myConversations });
    },
    onError: (_err, _vars, ctx) => {
      if (!ctx?.tempId) return;
      queryClient.setQueryData(KEYS.messages(conversationId), (old) => {
        if (!old?.pages?.length) return old;
        const pages = old.pages.map((p) => ({
          ...p,
          messages: p.messages.filter((m) => m._id !== ctx.tempId),
        }));
        return { ...old, pages };
      });
    },
  });
}

export function useEditProjectMessage(conversationId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, text }) => projectChatApi.editMessage(messageId, text),
    onSuccess: (saved) => {
      // Live-update happens via socket emission too; this is a fast-path so
      // the editor closes immediately for the user that initiated.
      queryClient.setQueryData(KEYS.messages(conversationId), (old) => {
        if (!old?.pages?.length) return old;
        const pages = old.pages.map((p) => ({
          ...p,
          messages: p.messages.map((m) => (m._id === saved?._id ? { ...m, ...saved } : m)),
        }));
        return { ...old, pages };
      });
    },
  });
}

export function useDeleteProjectMessage(conversationId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messageId) => projectChatApi.deleteMessage(messageId),
    onSuccess: (_data, messageId) => {
      queryClient.setQueryData(KEYS.messages(conversationId), (old) => {
        if (!old?.pages?.length) return old;
        const pages = old.pages.map((p) => ({
          ...p,
          messages: p.messages.filter((m) => m._id !== messageId),
        }));
        return { ...old, pages };
      });
    },
  });
}

export function useReactToProjectMessage(conversationId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, emoji }) => projectChatApi.reactToMessage(messageId, emoji),
    onSuccess: (data) => {
      if (!data?.messageId) return;
      queryClient.setQueryData(KEYS.messages(conversationId), (old) => {
        if (!old?.pages?.length) return old;
        const pages = old.pages.map((p) => ({
          ...p,
          messages: p.messages.map((m) =>
            m._id === data.messageId ? { ...m, reactions: data.reactions } : m
          ),
        }));
        return { ...old, pages };
      });
    },
  });
}

export function useUploadProjectAttachment() {
  return useMutation({
    mutationFn: (file) => projectChatApi.uploadAttachment(file),
  });
}

export function usePinnedProjectMessages(conversationId) {
  const queryClient = useQueryClient();

  // Realtime: when anyone in this conversation pins/unpins a message, invalidate
  // the pinned-strip cache and patch the inline message so other tabs update
  // without manual refetch. The server is authoritative for ordering by
  // pinnedAt, so we invalidate rather than splicing the pin into local state.
  useRealtimeChat(conversationId, {
    onPinToggled: ({ messageId, pinned, pinnedAt, pinnedBy }) => {
      if (!conversationId) return;
      queryClient.invalidateQueries({ queryKey: KEYS.pinned(conversationId) });
      queryClient.setQueryData(KEYS.messages(conversationId), (old) => {
        if (!old?.pages?.length) return old;
        const pages = old.pages.map((p) => ({
          ...p,
          messages: p.messages.map((m) =>
            m._id === messageId ? { ...m, pinned, pinnedAt, pinnedBy } : m
          ),
        }));
        return { ...old, pages };
      });
    },
  });

  return useQuery({
    queryKey: KEYS.pinned(conversationId),
    queryFn: () => projectChatApi.listPinnedMessages(conversationId),
    enabled: Boolean(conversationId),
    staleTime: 30 * 1000,
  });
}

export function useTogglePinProjectMessage(conversationId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messageId) => projectChatApi.togglePinMessage(messageId),
    onSuccess: (data) => {
      if (!data?.messageId) return;
      // Patch pinned flag onto the message in the paged cache so the bubble
      // hover-action reflects the new state immediately.
      queryClient.setQueryData(KEYS.messages(conversationId), (old) => {
        if (!old?.pages?.length) return old;
        const pages = old.pages.map((p) => ({
          ...p,
          messages: p.messages.map((m) =>
            m._id === data.messageId
              ? { ...m, pinned: data.pinned, pinnedAt: data.pinnedAt, pinnedBy: data.pinnedBy }
              : m
          ),
        }));
        return { ...old, pages };
      });
      // Refetch the pinned-strip so it picks up the change (server is the
      // source of truth for ordering by pinnedAt).
      queryClient.invalidateQueries({ queryKey: KEYS.pinned(conversationId) });
    },
  });
}

export function useMarkProjectConversationRead(conversationId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => projectChatApi.markAsRead(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.myConversations });
      queryClient.invalidateQueries({ queryKey: KEYS.unreadTotal });
    },
  });
}

export function useOpenProjectDm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, otherUserId }) => projectChatApi.openDm(projectId, otherUserId),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: KEYS.forProject(vars.projectId) });
      queryClient.invalidateQueries({ queryKey: KEYS.myConversations });
    },
  });
}

/**
 * Subscribe to a conversation's socket room and push new messages into the
 * TanStack cache. Wraps the existing useRealtimeChat hook (which already
 * handles join/leave + socket lifecycle).
 */
export function useLiveProjectChat(conversationId) {
  const queryClient = useQueryClient();

  useRealtimeChat(conversationId, {
    onNewMessage: (message) => {
      queryClient.setQueryData(KEYS.messages(conversationId), (old) => {
        if (!old?.pages?.length) {
          return { pages: [{ messages: [message], pagination: { page: 1, limit: 50, total: 1, hasMore: false } }], pageParams: [1] };
        }
        // Skip if already present (the sender's optimistic insert already
        // got replaced by the server response).
        const flat = old.pages.flatMap((p) => p.messages);
        if (flat.some((m) => m._id === message._id)) return old;
        const pages = [...old.pages];
        const last = pages[pages.length - 1];
        pages[pages.length - 1] = { ...last, messages: [...last.messages, message] };
        return { ...old, pages };
      });
      queryClient.invalidateQueries({ queryKey: KEYS.myConversations });
      queryClient.invalidateQueries({ queryKey: KEYS.unreadTotal });
    },
    onMessageDeleted: (messageId) => {
      queryClient.setQueryData(KEYS.messages(conversationId), (old) => {
        if (!old?.pages?.length) return old;
        const pages = old.pages.map((p) => ({
          ...p,
          messages: p.messages.filter((m) => m._id !== messageId),
        }));
        return { ...old, pages };
      });
    },
    onMessageEdited: (messageId, text) => {
      queryClient.setQueryData(KEYS.messages(conversationId), (old) => {
        if (!old?.pages?.length) return old;
        const pages = old.pages.map((p) => ({
          ...p,
          messages: p.messages.map((m) => (m._id === messageId ? { ...m, text, edited: true } : m)),
        }));
        return { ...old, pages };
      });
    },
    onReactionToggled: (messageId, reactions) => {
      queryClient.setQueryData(KEYS.messages(conversationId), (old) => {
        if (!old?.pages?.length) return old;
        const pages = old.pages.map((p) => ({
          ...p,
          messages: p.messages.map((m) => (m._id === messageId ? { ...m, reactions } : m)),
        }));
        return { ...old, pages };
      });
    },
  });
}

/**
 * Convenience: flatten infinite-query pages to a single chronological list.
 */
export function useFlattenedMessages(conversationId) {
  const query = useProjectMessages(conversationId);
  const messages = useMemo(() => {
    if (!query.data?.pages) return [];
    return query.data.pages.flatMap((p) => p.messages);
  }, [query.data]);
  return { ...query, messages };
}

// Effect helper for components that want to mark-read on mount.
export function useMarkReadOnMount(conversationId) {
  const mutation = useMarkProjectConversationRead(conversationId);
  useEffect(() => {
    if (conversationId) mutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);
}
