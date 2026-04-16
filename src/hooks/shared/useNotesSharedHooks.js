'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { qcApi } from '@/data/qcApi';
import { queryKeys } from '../queryKeys';

/**
 * ============ NOTES HOOKS ============
 */

export function useNotes(userId, filters = {}, options = {}) {
    return useQuery({
        queryKey: queryKeys.notes(userId, filters),
        queryFn: () => qcApi.getNotes(userId, filters),
        enabled: !!userId,
        ...options,
    });
}

export function useNote(noteId, userId, options = {}) {
    return useQuery({
        queryKey: queryKeys.note(noteId),
        queryFn: () => qcApi.getNoteById(noteId, userId),
        enabled: !!noteId,
        ...options,
    });
}

export function useNotesStats(userId, options = {}) {
    return useQuery({
        queryKey: queryKeys.notesStats(userId),
        queryFn: () => qcApi.getNotesStats(userId),
        enabled: !!userId,
        ...options,
    });
}

export function useCreateNote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (noteData) => qcApi.createNote(noteData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notes'] });
        },
    });
}

export function useUpdateNote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ noteId, noteData }) => qcApi.updateNote(noteId, noteData),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.note(variables.noteId) });
            queryClient.invalidateQueries({ queryKey: ['notes'] });
        },
    });
}

export function useDeleteNote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ noteId, userId }) => qcApi.deleteNote(noteId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notes'] });
        },
    });
}
