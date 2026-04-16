'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import complaintApi from '@/data/complaintApi';
import { queryKeys } from '../queryKeys';

/**
 * ============ COMPLAINT HOOKS ============
 */

export function useComplaintsAll(params = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.complaintsAll(params),
        queryFn: () => complaintApi.getAllComplaints(params),
        staleTime: 1000 * 30,
        ...options,
    });
}

export function useComplaintStats(options = {}) {
    return useQuery({
        queryKey: queryKeys.complaintsStats,
        queryFn: () => complaintApi.getStats(),
        staleTime: 1000 * 30,
        ...options,
    });
}

export function useComplaint(complaintId, options = {}) {
    return useQuery({
        queryKey: queryKeys.complaint(complaintId),
        queryFn: () => complaintApi.getById(complaintId),
        enabled: !!complaintId,
        staleTime: 1000 * 15,
        ...options,
    });
}

export function useComplaintsAssigned(repId, options = {}) {
    return useQuery({
        queryKey: queryKeys.complaintsAssigned(repId),
        queryFn: () => complaintApi.getAssigned(repId),
        enabled: !!repId,
        staleTime: 1000 * 30,
        ...options,
    });
}

export function useCreateComplaint() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => complaintApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['complaints'] });
        },
    });
}

export function useUpdateComplaint() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ complaintId, ...data }) => complaintApi.update(complaintId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['complaints'] });
        },
    });
}

export function useDeleteComplaint() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (complaintId) => complaintApi.delete(complaintId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['complaints'] });
        },
    });
}

export function useAddComplaintNote() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ complaintId, ...data }) => complaintApi.addNote(complaintId, data),
        onSuccess: (_data, { complaintId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.complaint(complaintId) });
        },
    });
}

export function useCreateTicketFromComplaint() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ complaintId, ...data }) => complaintApi.createTicket(complaintId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['complaints'] });
            queryClient.invalidateQueries({ queryKey: ['support'] });
        },
    });
}
