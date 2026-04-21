'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import supportApi from '@/data/supportApi';
import { knowledgeBaseApi } from '@/data/knowledgeBaseApi';
import { surveyApi } from '@/data/surveyApi';
import { queryKeys } from '../queryKeys';

// ── Knowledge Base Hooks ──

export function useKBArticles(filters = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.kbArticles(filters),
        queryFn: () => knowledgeBaseApi.getAllArticles(filters),
        staleTime: 1000 * 60 * 5,
        ...options,
    });
}

export function useKBCategories(options = {}) {
    return useQuery({
        queryKey: queryKeys.kbCategories,
        queryFn: () => knowledgeBaseApi.getCategories(),
        staleTime: 1000 * 60 * 30,
        ...options,
    });
}

export function useCreateKBArticle() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => knowledgeBaseApi.createArticle(data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['knowledge-base'] }); },
    });
}

export function useUpdateKBArticle() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }) => knowledgeBaseApi.updateArticle(id, data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['knowledge-base'] }); },
    });
}

export function useDeleteKBArticle() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => knowledgeBaseApi.deleteArticle(id),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['knowledge-base'] }); },
    });
}

// ── Survey Hooks ──

export function useSurveyResponses(filters = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.surveyResponses(filters),
        queryFn: () => surveyApi.getAllResponses(filters),
        staleTime: 1000 * 60 * 5,
        ...options,
    });
}

export function useSurveyStats(options = {}) {
    return useQuery({
        queryKey: queryKeys.surveyStats,
        queryFn: () => surveyApi.getStats(),
        staleTime: 1000 * 60 * 5,
        ...options,
    });
}

export function useSubmitSurvey() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => surveyApi.submitResponse(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['surveys'] });
        },
    });
}

// ── Canned Workflow Hooks ──

export function useCannedWorkflows(createdBy, options = {}) {
    return useQuery({
        queryKey: queryKeys.cannedWorkflows(createdBy),
        queryFn: () => supportApi.getAllWorkflows(createdBy),
        staleTime: 1000 * 60 * 5,
        ...options,
    });
}

export function useCreateCannedWorkflow() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => supportApi.createWorkflow(data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['canned-workflows'] }); },
    });
}

export function useUpdateCannedWorkflow() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }) => supportApi.updateWorkflow(id, data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['canned-workflows'] }); },
    });
}

export function useDeleteCannedWorkflow() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => supportApi.deleteWorkflow(id),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['canned-workflows'] }); },
    });
}

export function useToggleCannedWorkflow() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => supportApi.toggleWorkflowActive(id),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['canned-workflows'] }); },
    });
}

export function useDuplicateCannedWorkflow() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => supportApi.duplicateWorkflow(id),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['canned-workflows'] }); },
    });
}

// ── Survey Invite Hooks (admin-facing) ──

export function useSurveyInvites(filters = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.surveyInvites(filters),
        queryFn: () => surveyApi.getAllInvites(filters),
        staleTime: 1000 * 60 * 5,
        ...options,
    });
}

export function useSendSurveys() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => surveyApi.sendSurveys(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['survey'] });
            queryClient.invalidateQueries({ queryKey: ['surveys'] });
        },
    });
}

// ── Escalation Rule Hooks ──

export function useEscalationRules(createdBy, options = {}) {
    return useQuery({
        queryKey: queryKeys.escalationRules(createdBy),
        queryFn: () => supportApi.getAllEscalationRules(createdBy),
        staleTime: 1000 * 60 * 5,
        ...options,
    });
}

export function useCreateEscalationRule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => supportApi.createEscalationRule(data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['escalation-rules'] }); },
    });
}

export function useUpdateEscalationRule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }) => supportApi.updateEscalationRule(id, data),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['escalation-rules'] }); },
    });
}

export function useDeleteEscalationRule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => supportApi.deleteEscalationRule(id),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['escalation-rules'] }); },
    });
}

export function useToggleEscalationRule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => supportApi.toggleEscalationRule(id),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['escalation-rules'] }); },
    });
}
