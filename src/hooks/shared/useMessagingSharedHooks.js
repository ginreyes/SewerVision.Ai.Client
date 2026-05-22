'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import notificationApi from '@/data/notificationApi';
import messageApi from '@/data/messageApi';
import { queryKeys } from '../queryKeys';

/**
 * ============ USER INBOX (NOTIFICATIONS) HOOKS ============
 */

export function useUserInbox(userId, filters = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.userInbox(userId, filters),
        queryFn: () => notificationApi.getNotifications(userId, filters),
        enabled: !!userId,
        staleTime: 1000 * 10,
        ...options,
    });
}

export function useUserUnreadCount(userId, options = {}) {
    return useQuery({
        queryKey: queryKeys.userUnreadCount(userId),
        queryFn: () => notificationApi.getUnreadCount(userId),
        enabled: !!userId,
        staleTime: 1000 * 10,
        ...options,
    });
}

/**
 * ============ MESSAGES / INBOX HOOKS ============
 */

export function useMessagesInbox(userId, params = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.messagesInbox(userId, params),
        queryFn: () => messageApi.getInbox(userId, params),
        enabled: !!userId,
        staleTime: 1000 * 15,
        ...options,
    });
}

export function useMessagesSent(userId, options = {}) {
    return useQuery({
        queryKey: queryKeys.messagesSent(userId),
        queryFn: () => messageApi.getSent(userId),
        enabled: !!userId,
        staleTime: 1000 * 30,
        ...options,
    });
}

export function useMessagesThread(threadId, options = {}) {
    return useQuery({
        queryKey: queryKeys.messagesThread(threadId),
        queryFn: () => messageApi.getThread(threadId),
        enabled: !!threadId,
        staleTime: 1000 * 10,
        ...options,
    });
}

export function useMessagesUnreadCount(userId, options = {}) {
    return useQuery({
        queryKey: queryKeys.messagesUnreadCount(userId),
        queryFn: () => messageApi.getUnreadCount(userId),
        enabled: !!userId,
        staleTime: 1000 * 15,
        ...options,
    });
}

export function useMessagesContacts(userId, options = {}) {
    return useQuery({
        queryKey: queryKeys.messagesContacts(userId),
        queryFn: () => messageApi.getContacts(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5,
        ...options,
    });
}

export function useSendMessage() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => messageApi.send(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        },
    });
}

export function useToggleMessageStar() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (messageId) => messageApi.toggleStar(messageId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        },
    });
}

export function useMarkMessageRead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (messageId) => messageApi.markAsRead(messageId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        },
    });
}

export function useArchiveMessage() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (messageId) => messageApi.archive(messageId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        },
    });
}

export function useDeleteMessage() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (messageId) => messageApi.delete(messageId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        },
    });
}

export function useMarkAllMessagesRead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId) => messageApi.markAllAsRead(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        },
    });
}
