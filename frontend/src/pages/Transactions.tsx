import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Calendar, X } from "lucide-react";
import { Button } from "../components/ui/Button";
import { useExpenses } from "../hooks/useExpenses";
import { useCategories } from "../hooks/useCategories";
import { useTransactionFilters } from "../hooks/useTransactionFilters";
import { formatCurrency, formatDate, getMonthName } from "../lib/utils";
import { getIconElement, getCategoryColor } from "../lib/icons";
import { PageHeader } from "../components/reusable_parts/PageHeader";
import { EmptyState } from "../components/reusable_parts/EmptyState";
import { ListSkeleton } from "../components/reusable_parts/LoadingSkeleton";
import type { ExpenseDto } from "../types";

const NOW = new Date();
const CURRENT_MONTH = NOW.getMonth() + 1;
const CURRENT_YEAR = NOW.getFullYear();
const MONTHS = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: getMonthName(i + 1) }));
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

const Transactions: React.FC = () => {
  const pageSize = 20;
  const { searchInput, setSearchInput, selectedCategory, setSelectedCategory, selectedType, setSelectedType, page, setPage, filter, clearFilters, activeFilterCount } = useTransactionFilters(pageSize);
  const [filterByMonth, setFilterByMonth] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(CURRENT_MONTH);
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [customDateRange, setCustomDateRange] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const enhancedFilter = useMemo(() => {
    const base = { ...filter };
    if (customDateRange && startDate && endDate) { base.startDate = new Date(startDate).toISOString(); base.endDate = new Date(endDate).toISOString(); }
    else if (filterByMonth) { base.startDate = new Date(selectedYear, selectedMonth - 1, 1).toISOString(); base.endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59).toISOString(); }
    return base;
  }, [filter, filterByMonth, selectedMonth, selectedYear, customDateRange, startDate, endDate]);

  const { expenses, pagination, isLoading } = useExpenses(enhancedFilter);
  const { categories } = useCategories();

  const grouped = useMemo(() => {
    const g: Record<string, ExpenseDto[]> = {};
    expenses.forEach(e => { const k = formatDate(e.date); if (!g[k]) g[k] = []; g[k].push(e); });
    return g;
  }, [expenses]);

  const clearAll = () => { clearFilters(); setFilterByMonth(false); setCustomDateRange(false); setStartDate(""); setEndDate(""); setPage(1); };
  const hasDateFilter = filterByMonth || customDateRange;
  const hasAnyFilter = activeFilterCount > 0 || hasDateFilter;

  return (
    <div className="space-y-6">
      <PageHeader title="All Transactions" subtitle={`${pagination?.totalCount || 0} transactions`} />

      {/* Filters */}
      <div className="p-3 border shadow-sm bg-surface rounded-xl border-surface-border">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 min-w-37.5">
            <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-primary-400" />
            <input value={searchInput} onChange={e => { setSearchInput(e.target.value); setPage(1); }} placeholder="Search..." className="w-full h-10 pl-10 pr-4 text-sm transition-all border-2 rounded-xl border-surface-border focus:outline-none focus:border-accent-400" aria-label="Search" />
          </div>
          <select value={selectedType} onChange={e => { setSelectedType(e.target.value); setPage(1); }} className="h-10 px-3 text-sm border-2 rounded-xl border-surface-border bg-surface focus:outline-none focus:border-accent-400" aria-label="Type">
            <option value="">All Types</option><option value="income">Income</option><option value="expense">Expense</option>
          </select>
          <select value={selectedCategory} onChange={e => { setSelectedCategory(e.target.value); setPage(1); }} className="h-10 px-3 text-sm border-2 rounded-xl border-surface-border bg-surface focus:outline-none focus:border-accent-400" aria-label="Category">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {!hasDateFilter ? (
            <div className="flex items-center gap-1 bg-primary-50 rounded-xl p-0.5">
              <button onClick={() => setFilterByMonth(true)} className="px-3 text-sm font-medium transition-all rounded-lg h-9 hover:bg-surface hover:shadow-sm text-primary-600">Month</button>
              <button onClick={() => setCustomDateRange(true)} className="px-3 text-sm font-medium transition-all rounded-lg h-9 hover:bg-surface hover:shadow-sm text-primary-600">Range</button>
            </div>
          ) : filterByMonth ? (
            <>
              <select value={selectedMonth} onChange={e => { setSelectedMonth(+e.target.value); setPage(1); }} className="h-10 px-3 text-sm border-2 rounded-xl border-surface-border bg-surface focus:outline-none focus:border-accent-400">
                {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
              <select value={selectedYear} onChange={e => { setSelectedYear(+e.target.value); setPage(1); }} className="h-10 px-3 text-sm border-2 rounded-xl border-surface-border bg-surface focus:outline-none focus:border-accent-400">
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </>
          ) : (
            <>
              <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setPage(1); }} max={NOW.toISOString().split('T')[0]} className="h-10 px-3 text-sm border-2 rounded-xl border-surface-border bg-surface focus:outline-none focus:border-accent-400 w-35" aria-label="Start" />
              <span className="text-xs font-medium text-primary-400">to</span>
              <input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setPage(1); }} max={NOW.toISOString().split('T')[0]} className="h-10 px-3 text-sm border-2 rounded-xl border-surface-border bg-surface focus:outline-none focus:border-accent-400 w-35" aria-label="End" />
            </>
          )}
          {hasAnyFilter && (
            <button onClick={clearAll} className="h-10 px-3 rounded-xl text-sm font-medium text-expense-500 hover:bg-expense-50 transition-all flex items-center gap-1.5" aria-label="Clear filters">
              <X className="w-4 h-4" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="overflow-hidden border shadow-sm bg-surface rounded-xl border-surface-border">
        {isLoading ? <ListSkeleton rows={5} /> : expenses.length === 0 ? (
          <EmptyState icon={Calendar} title="No transactions found" description={hasAnyFilter ? 'Try adjusting filters' : 'Add your first transaction'} />
        ) : (
          <div>
            {Object.entries(grouped).map(([date, items]) => (
              <div key={date}>
                <div className="px-5 py-2.5 bg-primary-50/50 border-b border-primary-50 flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-primary-400" />
                  <span className="text-xs font-medium text-primary-500">{date}</span>
                  <span className="text-xs text-primary-300">· {items.length}</span>
                </div>
                <div className="divide-y divide-primary-50">
                  {items.map((e, i) => (
                    <motion.div key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      className="flex items-center justify-between px-5 py-3.5 hover:bg-primary-50/50 transition-colors">
                      <div className="flex items-center gap-3.5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getCategoryColor(e.categoryType, e.categoryIcon)}`}>
                          {getIconElement(e.categoryIcon, "h-5 w-5")}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-primary-700">{e.description}</p>
                          <p className="text-xs text-primary-400">{e.categoryName}</p>
                        </div>
                      </div>
                      <span className={`text-sm font-semibold ${e.categoryType === 'income' ? 'text-income-500' : 'text-expense-500'}`}>
                        {e.categoryType === 'income' ? '+' : '−'}{formatCurrency(e.amount)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-surface-border bg-primary-50/50">
            <span className="text-xs text-primary-500">Page {pagination.page} of {pagination.totalPages}</span>
            <div className="flex gap-1.5">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}>Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;