'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/data/userApi';
import { api } from '@/lib/helper';
import { queryKeys } from '../queryKeys';

/**
 * ============ SHARED PROJECT DETAIL HOOKS ============
 * Used by admin/operator/user ProjectDetail to fetch observations,
 * snapshots, metadata, PACP codes, and videos for a specific project.
 */

export function useProjectObservations(projectId, page = 1, pageSize = 10, options = {}) {
    return useQuery({
        queryKey: ['project', projectId, 'observations', page, pageSize],
        queryFn: async () => {
            const { data } = await api(`/api/observations/get-all-observations?projectId=${projectId}&page=${page}&limit=${pageSize}`);
            const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
            const total = data?.pagination?.total ?? list.length;
            return { observations: list, total };
        },
        enabled: !!projectId,
        staleTime: 1000 * 30,
        ...options,
    });
}

export function useProjectSnapshots(projectId, options = {}) {
    return useQuery({
        queryKey: ['project', projectId, 'snapshots'],
        queryFn: async () => {
            const { data } = await api(`/api/snapshots/get-all-snapshots?projectId=${projectId}`);
            return Array.isArray(data) ? data : data?.data || [];
        },
        enabled: !!projectId,
        staleTime: 1000 * 60,
        ...options,
    });
}

export function useProjectMetadata(projectId, options = {}) {
    return useQuery({
        queryKey: ['project', projectId, 'metadata'],
        queryFn: async () => {
            const { data } = await api(`/api/projects/get-project/${projectId}`);
            return data?.data?.metadata || {};
        },
        enabled: !!projectId,
        staleTime: 1000 * 60 * 2,
        ...options,
    });
}

export function usePacpCodes(options = {}) {
    return useQuery({
        queryKey: ['pacp-codes'],
        queryFn: async () => {
            const { data } = await api('/api/pacpcodes/get-all-pacpcodes');
            return Array.isArray(data) ? data : data?.data || [];
        },
        staleTime: 1000 * 60 * 10,
        ...options,
    });
}

/**
 * ============ USER PROJECT HOOKS ============
 */

export function useUserProjects(userId, { page = 1, limit = 20, search = '', status = '' } = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.userProjects(userId, { page, limit, search, status }),
        queryFn: () => userApi.getAllProjects(userId, { page, limit, search, status }),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5,
        ...options,
    });
}

export function useUserProject(projectId, options = {}) {
    return useQuery({
        queryKey: queryKeys.userProject(projectId),
        queryFn: () => userApi.getProject(projectId),
        enabled: !!projectId,
        staleTime: 1000 * 60 * 5,
        ...options,
    });
}

// ── Project Mutations ──

export function useRequestDeleteProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (projectId) => userApi.requestDeleteProject(projectId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', 'projects'] });
        },
    });
}

export function useApproveDeleteProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (projectId) => userApi.approveDeleteProject(projectId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', 'projects'] });
        },
    });
}

export function useRejectDeleteProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (projectId) => userApi.rejectDeleteProject(projectId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', 'projects'] });
        },
    });
}

export function useDeleteUserProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (projectId) => userApi.deleteProject(projectId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', 'projects'] });
        },
    });
}

export function useCreateObservation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ projectId, userId, data }) => userApi.createObservation(projectId, userId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', 'projects'] });
        },
    });
}

export function useCreateUserSnapshot() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ projectId, userId, data }) => userApi.createSnapshot(projectId, userId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', 'projects'] });
        },
    });
}
