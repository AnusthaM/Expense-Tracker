import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/api';
import type {
  CategoryDto,
  CreateCategoryRequest,
  UpdateCategoryRequest
} from '../types';

/**
 * Hook for category CRUD operations.
 */
export function useCategories() {
  const queryClient = useQueryClient();

  const {
    data: categories,
    isLoading,
    error,
    refetch
  } = useQuery<CategoryDto[]>({
    queryKey: ['categories'],
    queryFn: () => apiClient.getCategories(),
    staleTime: 1000 * 60 * 5
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCategoryRequest) => apiClient.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryRequest }) =>
      apiClient.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    }
  });

  const incomeCategories = categories?.filter(c => c.type === 'income') || [];
  const expenseCategories = categories?.filter(c => c.type === 'expense') || [];

  return {
    categories: categories || [],
    incomeCategories,
    expenseCategories,
    isLoading,
    error,
    refetch,
    createCategory: createMutation.mutateAsync,
    updateCategory: updateMutation.mutateAsync,
    deleteCategory: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error
  };
}