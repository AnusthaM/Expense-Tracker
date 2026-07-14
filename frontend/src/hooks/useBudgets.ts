import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/api';
import type { BudgetDto, CreateBudgetRequest, UpdateBudgetRequest, BudgetNotificationDto } from '../types';

/**
 * Hook for budget operations.
 * No refetchInterval - mutations keep cache fresh.
 */
export function useBudgets(year?: number, month?: number) {
  const queryClient = useQueryClient();

  const { data: budgets, isLoading, error } = useQuery<BudgetDto[]>({
    queryKey: ['budgets', year, month],
    queryFn: () => apiClient.getBudgets(year, month),
    staleTime: 1000 * 60 * 2
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateBudgetRequest) => apiClient.createBudget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget-notifications'] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBudgetRequest }) =>
      apiClient.updateBudget(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget-notifications'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget-notifications'] });
    }
  });

  return {
    budgets: budgets || [],
    isLoading,
    error,
    createBudget: createMutation.mutateAsync,
    updateBudget: updateMutation.mutateAsync,
    deleteBudget: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
}

/**
 * Hook for budget notifications.
 * Uses mutation-triggered invalidation only - no polling needed.
 */
export function useBudgetNotifications() {
  return useQuery<BudgetNotificationDto[]>({
    queryKey: ['budget-notifications'],
    queryFn: () => apiClient.getBudgetNotifications(),
    staleTime: 1000 * 60 * 2
  });
}