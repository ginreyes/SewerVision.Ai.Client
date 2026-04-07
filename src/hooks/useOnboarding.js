import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/helper';

export const useOnboardingProgress = (userId) =>
  useQuery({
    queryKey: ['onboarding', userId],
    queryFn: async () => {
      const { data } = await api(`/api/onboarding/${userId}`);
      return data?.data || data || null;
    },
    enabled: !!userId,
    staleTime: 60_000,
  });

export const useCompleteOnboardingStep = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, stepKey }) => {
      const { data } = await api(`/api/onboarding/${userId}/step`, 'PUT', { stepKey });
      return data?.data || data;
    },
    onSuccess: (_, { userId }) => qc.invalidateQueries({ queryKey: ['onboarding', userId] }),
  });
};

export const useInitOnboarding = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId) => {
      const { data } = await api(`/api/onboarding/init/${userId}`, 'POST');
      return data?.data || data;
    },
    onSuccess: (_, userId) => qc.invalidateQueries({ queryKey: ['onboarding', userId] }),
  });
};
