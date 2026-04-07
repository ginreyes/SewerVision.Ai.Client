import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/helper';

// ── Learning Paths ──────────────────────────────────────
export const useLearningPaths = () =>
  useQuery({ queryKey: ['learning-paths'], queryFn: async () => { const { data } = await api('/api/training/paths'); return data?.data || []; } });

export const useLearningPath = (id) =>
  useQuery({ queryKey: ['learning-path', id], queryFn: async () => { const { data } = await api(`/api/training/paths/${id}`); return data?.data || null; }, enabled: !!id });

export const useUserPathProgress = (userId) =>
  useQuery({ queryKey: ['path-progress', userId], queryFn: async () => { const { data } = await api(`/api/training/paths/progress/${userId}`); return data?.data || []; }, enabled: !!userId });

export const useEnrollInPath = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ pathId, userId }) => { const { data } = await api(`/api/training/paths/${pathId}/enroll`, 'POST', { userId }); return data?.data; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['path-progress'] }),
  });
};

export const useUpdatePathProgress = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ pathId, userId, moduleId, score }) => {
      const { data } = await api(`/api/training/paths/${pathId}/update-progress`, 'POST', { userId, moduleId, score });
      return data?.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['path-progress'] }),
  });
};

export const useCreatePath = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (pathData) => { const { data } = await api('/api/training/paths', 'POST', pathData); return data?.data; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['learning-paths'] }),
  });
};

export const useDeletePath = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => { await api(`/api/training/paths/${id}`, 'DELETE'); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['learning-paths'] }),
  });
};

export const useCertificate = (pathId, userId) =>
  useQuery({ queryKey: ['certificate', pathId, userId], queryFn: async () => { const { data } = await api(`/api/training/paths/${pathId}/certificate/${userId}`); return data?.data || null; }, enabled: !!(pathId && userId) });

// ── Defect Exercises ────────────────────────────────────
export const useDefectExercises = (filters = {}) =>
  useQuery({ queryKey: ['defect-exercises', filters], queryFn: async () => { const params = new URLSearchParams(filters).toString(); const { data } = await api(`/api/training/exercises?${params}`); return data?.data || []; } });

export const useDefectExercise = (id) =>
  useQuery({ queryKey: ['defect-exercise', id], queryFn: async () => { const { data } = await api(`/api/training/exercises/${id}`); return data?.data || null; }, enabled: !!id });

export const useSubmitExercise = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ exerciseId, userId, userMarks, timeSpent }) => {
      const { data } = await api(`/api/training/exercises/${exerciseId}/submit`, 'POST', { userId, userMarks, timeSpent });
      return data?.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['defect-exercises'] }),
  });
};

export const useCreateExercise = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data) => { const res = await api('/api/training/exercises', 'POST', data); return res.data?.data; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['defect-exercises'] }),
  });
};

export const useUserExerciseAttempts = (userId) =>
  useQuery({ queryKey: ['exercise-attempts', userId], queryFn: async () => { const { data } = await api(`/api/training/exercises/attempts/${userId}`); return data?.data || []; }, enabled: !!userId });
