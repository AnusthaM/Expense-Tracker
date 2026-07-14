import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/api';
import type {
  ExpenseDto,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  ExpenseFilter,
  PagedResponse,
  MonthlySummaryDto,
  YearlyOverviewDto,
  ExpenseTrendDto
} from '../types';

const DEFAULT_FILTER: ExpenseFilter = {
  page: 1,
  pageSize: 20
};

/**
 * Hook for expense CRUD operations with pagination.
 * Merges provided filter with defaults to ensure data always loads.
 */
export function useExpenses(filter?: ExpenseFilter) {
  const queryClient = useQueryClient();
  
  const mergedFilter: ExpenseFilter = {
    ...DEFAULT_FILTER,
    ...filter
  };

  const {
    data: expensesData,
    isLoading,
    error,
    refetch
  } = useQuery<PagedResponse<ExpenseDto>>({
    queryKey: ['expenses', mergedFilter],
    queryFn: () => apiClient.getExpenses(mergedFilter),
    placeholderData: (previousData) => previousData
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateExpenseRequest) => apiClient.createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-summary'] });
      queryClient.invalidateQueries({ queryKey: ['yearly-overview'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });

  const updateMutation = useMutation({
  mutationFn: ({ id, data }: { id: string; data: UpdateExpenseRequest }) =>
    apiClient.updateExpense(id, data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['expenses'] });
    queryClient.invalidateQueries({ queryKey: ['monthly-summary'] });
    queryClient.invalidateQueries({ queryKey: ['yearly-overview'] });
    queryClient.invalidateQueries({ queryKey: ['budgets'] });
    queryClient.invalidateQueries({ queryKey: ['budget-notifications'] });
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  }
});

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-summary'] });
      queryClient.invalidateQueries({ queryKey: ['yearly-overview'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });

  return {
    expenses: expensesData?.items || [],
    pagination: expensesData ? {
      totalCount: expensesData.totalCount,
      page: expensesData.page,
      pageSize: expensesData.pageSize,
      totalPages: expensesData.totalPages
    } : null,
    isLoading,
    error,
    refetch,
    createExpense: createMutation.mutateAsync,
    updateExpense: updateMutation.mutateAsync,
    deleteExpense: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error
  };
}

/**
 * Hook for fetching monthly summary.
 */
export function useMonthlySummary(year: number, month: number) {
  return useQuery<MonthlySummaryDto>({
    queryKey: ['monthly-summary', year, month],
    queryFn: () => apiClient.getMonthlySummary(year, month),
    enabled: !!year && !!month
  });
}

/**
 * Hook for fetching yearly overview.
 */
export function useYearlyOverview(year: number) {
  return useQuery<YearlyOverviewDto[]>({
    queryKey: ['yearly-overview', year],
    queryFn: () => apiClient.getYearlyOverview(year),
    enabled: !!year,
    select: (data) => {
      return Array.from({ length: 12 }, (_, i) => {
        const monthData = data?.find(d => d.month === i + 1);
        return monthData || {
          month: i + 1,
          monthName: new Date(year, i).toLocaleString('default', { month: 'long' }),
          income: 0,
          expenses: 0,
          netSavings: 0,
          transactionCount: 0
        };
      });
    }
  });
}

/**
 * Hook for fetching expense trends.
 */
export function useExpenseTrends(months: number = 6) {
  return useQuery<ExpenseTrendDto[]>({
    queryKey: ['expense-trends', months],
    queryFn: () => apiClient.getExpenseTrends(months),
    enabled: months > 0
  });
}