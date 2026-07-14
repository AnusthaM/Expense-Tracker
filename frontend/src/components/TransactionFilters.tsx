import React from 'react';
import { Search, X } from 'lucide-react';
import { Button } from './ui/Button';
import type { CategoryDto } from '../types';

interface TransactionFiltersProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  selectedType: string;
  onTypeChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  categories: CategoryDto[];
  activeFilterCount: number;
  onClear: () => void;
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  searchInput, onSearchChange,
  selectedType, onTypeChange,
  selectedCategory, onCategoryChange,
  categories, activeFilterCount, onClear
}) => {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1 min-w-45">
        <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
        <input
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search..."
          className="w-full h-10 pl-10 pr-4 text-sm transition-all duration-200 border-2 rounded-xl border-slate-200 focus:outline-none focus:border-sky-400"
          aria-label="Search transactions"
        />
      </div>
      <select
        value={selectedType}
        onChange={(e) => onTypeChange(e.target.value)}
        className="h-10 px-3 text-sm transition-all duration-200 bg-white border-2 rounded-xl border-slate-200 focus:outline-none focus:border-sky-400"
        aria-label="Filter by type"
      >
        <option value="">All Types</option>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>
      <select
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="h-10 px-3 text-sm transition-all duration-200 bg-white border-2 rounded-xl border-slate-200 focus:outline-none focus:border-sky-400"
        aria-label="Filter by category"
      >
        <option value="">All Categories</option>
        {categories.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      {activeFilterCount > 0 && (
        <Button variant="ghost" size="sm" onClick={onClear} className="h-10 rounded-xl whitespace-nowrap">
          <X className="w-4 h-4 mr-1" /> Clear
        </Button>
      )}
    </div>
  );
};