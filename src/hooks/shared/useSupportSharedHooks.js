'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import supportApi from '@/data/supportApi';
import cannedResponseApi from '@/data/cannedResponseApi';
import repActivityApi from '@/data/repActivityApi';
import { queryKeys } from '../queryKeys';

/**
 * ============ SUPPORT / CUSTOMER-REP HOOKS ============
 */

export function useSupportAllTickets(params = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.supportAllTickets(params),
        queryFn: () => supportApi.getAllTickets(params),
        staleTime: 1000 * 30,
        ...options,
    });
}

export function useSupportGlobalStats(options = {}) {
    return useQuery({
        queryKey: queryKeys.supportGlobalStats,
        queryFn: () => supportApi.getGlobalStats(),
        staleTime: 1000 * 30,
        ...options,
    });
}

export function useSupportTicket(ticketId, options = {}) {
    return useQuery({
        queryKey: queryKeys.supportTicket(ticketId),
        queryFn: () => supportApi.getTicketById(ticketId),
        enabled: !!ticketId,
        staleTime: 1000 * 15,
        ...options,
    });
}

export function useSupportAssignedTickets(repId, options = {}) {
    return useQuery({
        queryKey: queryKeys.supportAssigned(repId),
        queryFn: () => supportApi.getAssignedTickets(repId),
        enabled: !!repId,
        staleTime: 1000 * 30,
        ...options,
    });
}

export function useSupportTeam(options = {}) {
    return useQuery({
        queryKey: queryKeys.supportTeam,
        queryFn: () => supportApi.getTeam(),
        staleTime: 1000 * 60 * 2,
        ...options,
    });
}

export function useManagedTeam(repId, options = {}) {
    return useQuery({
        queryKey: ['managedTeam', repId],
        queryFn: () => supportApi.getManagedTeam(repId),
        staleTime: 1000 * 60 * 2,
        enabled: !!repId,
        ...options,
    });
}

export function useSupportCustomerStats(userId, options = {}) {
    return useQuery({
        queryKey: queryKeys.supportCustomerStats(userId),
        queryFn: () => supportApi.getCustomerStats(userId),
        enabled: !!userId,
        staleTime: 1000 * 30,
        ...options,
    });
}

export function useCreateSupportTicket() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => supportApi.createTicket(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['support'] });
        },
    });
}

export function useUpdateSupportTicket() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ ticketId, ...data }) => supportApi.updateTicket(ticketId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['support'] });
        },
    });
}

export function useAddTicketResponse() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ ticketId, ...data }) => supportApi.addResponse(ticketId, data),
        onSuccess: (_data, { ticketId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.supportTicket(ticketId) });
            queryClient.invalidateQueries({ queryKey: ['support', 'tickets'] });
        },
    });
}

export function useDeleteSupportTicket() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (ticketId) => supportApi.deleteTicket(ticketId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['support'] });
        },
    });
}

export function useAddInternalNote() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ ticketId, ...data }) => supportApi.addInternalNote(ticketId, data),
        onSuccess: (_data, { ticketId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.supportTicket(ticketId) });
        },
    });
}

export function useSupportTags(options = {}) {
    return useQuery({
        queryKey: ['support', 'tags'],
        queryFn: () => supportApi.getTags(),
        staleTime: 1000 * 60 * 5,
        ...options,
    });
}

export function useSupportCustomerHistory(customerId, options = {}) {
    return useQuery({
        queryKey: ['support', 'customer-history', customerId],
        queryFn: () => supportApi.getCustomerHistory(customerId),
        enabled: !!customerId,
        staleTime: 1000 * 30,
        ...options,
    });
}

export function useRequestTicketDeletion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ ticketId, ...data }) => supportApi.requestDeletion(ticketId, data),
        onSuccess: (_data, { ticketId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.supportTicket(ticketId) });
            queryClient.invalidateQueries({ queryKey: ['support', 'deletion-requests'] });
        },
    });
}

export function useReviewTicketDeletion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ ticketId, ...data }) => supportApi.reviewDeletion(ticketId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['support'] });
            queryClient.invalidateQueries({ queryKey: ['support', 'deletion-requests'] });
        },
    });
}

export function usePendingDeletionRequests(options = {}) {
    return useQuery({
        queryKey: ['support', 'deletion-requests'],
        queryFn: () => supportApi.getPendingDeletionRequests(),
        staleTime: 1000 * 30,
        ...options,
    });
}

/**
 * ============ CANNED RESPONSE HOOKS ============
 */

export function useCannedResponses(userId, options = {}) {
    return useQuery({
        queryKey: ['canned-responses', userId],
        queryFn: () => cannedResponseApi.getAll(userId),
        staleTime: 1000 * 60 * 2,
        ...options,
    });
}

export function useCreateCannedResponse() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => cannedResponseApi.create(data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['canned-responses'] }); },
    });
}

export function useUpdateCannedResponse() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }) => cannedResponseApi.update(id, data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['canned-responses'] }); },
    });
}

export function useDeleteCannedResponse() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => cannedResponseApi.delete(id),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['canned-responses'] }); },
    });
}

/**
 * ============ REP ACTIVITY HOOKS ============
 */

export function useRepActivity({ mode = 'list', repId, managedBy } = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.repActivity(mode, repId),
        queryFn: () => (mode === 'self' && repId ? repActivityApi.getOne(repId) : repActivityApi.list({ managedBy })),
        enabled: mode === 'self' ? !!repId : true,
        staleTime: 1000 * 60 * 2,
        ...options,
    });
}
