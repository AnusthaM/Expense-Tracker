import { useState, useMemo } from 'react';
import { useDebounce } from './useDebounce';
import type { ExpenseFilter } from '../types';

/**
 * Shared hook for transaction filtering and pagination.
 * Eliminates duplicate logic between Expenses.tsx and Transactions.tsx.
 */
export function useTransactionFilters(pageSize: number = 20) {
  const [searchInput, setSearchInput] = useState('');
  const searchTerm = useDebounce(searchInput, 300);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [page, setPage] = useState(1);

  const filter: ExpenseFilter = useMemo(() => ({
    page,
    pageSize,
    ...(selectedCategory && { categoryId: selectedCategory }),
    ...(selectedType && { type: selectedType as 'income' | 'expense' }),
    ...(searchTerm && { searchTerm })
  }), [page, pageSize, selectedCategory, selectedType, searchTerm]);

  const clearFilters = () => {
    setSearchInput('');
    setSelectedCategory('');
    setSelectedType('');
    setPage(1);
  };

  const activeFilterCount = [selectedCategory, selectedType].filter(Boolean).length;

  return {
    searchInput,
    setSearchInput,
    searchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedType,
    setSelectedType,
    page,
    setPage,
    filter,
    clearFilters,
    activeFilterCount
  };
}