import React, { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Plus, Edit2, Trash2, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/Button";
import ExpenseForm from "../components/reusable_parts/ExpenseForm";
import { ConfirmDialog } from "../components/reusable_parts/ConfirmDialog";
import { useExpenses } from "../hooks/useExpenses";
import { useCategories } from "../hooks/useCategories";
import { useTransactionFilters } from "../hooks/useTransactionFilters";
import { formatCurrency, formatDate, getMonthName } from "../lib/utils";
import { useToast } from "../components/reusable_parts/Toast";
import { getIconElement, getCategoryColor } from "../lib/icons";
import { PageHeader } from "../components/reusable_parts/PageHeader";
import { EmptyState } from "../components/reusable_parts/EmptyState";
import { ListSkeleton } from "../components/reusable_parts/LoadingSkeleton";
import { TransactionFilters } from "../components/TransactionFilters";
import type { ExpenseDto, CreateExpenseRequest } from "../types";

const Expenses: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const pageSize = 10;

  const { searchInput, setSearchInput, selectedCategory, setSelectedCategory, selectedType, setSelectedType, filter, clearFilters, activeFilterCount } = useTransactionFilters(pageSize);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ExpenseDto | null>(null);

  const { expenses, isLoading, createExpense, updateExpense, deleteExpense, isCreating, isUpdating, isDeleting } = useExpenses(filter);
  const { categories } = useCategories();

  const totals = useMemo(() => {
    const income = expenses.filter(e => e.categoryType === 'income').reduce((s, e) => s + e.amount, 0);
    const expense = expenses.filter(e => e.categoryType === 'expense').reduce((s, e) => s + e.amount, 0);
    return { income, expense, net: income - expense };
  }, [expenses]);

 const handleSubmit = useCallback(async (data: CreateExpenseRequest, id?: string) => {
  try {
    if (id) {
      await updateExpense({ id, data });
      showToast("warning", "Transaction updated!");
    } else {
      await createExpense(data);
      showToast("success", "Transaction added!");
    }
    // Form auto-closes after success
  } catch (err: unknown) {
    showToast("error", err instanceof Error ? err.message : "Failed to save");
    throw err;
  }
}, [createExpense, updateExpense, showToast]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteExpense(deleteTarget.id);
      showToast("error", "Transaction deleted");
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleteTarget(null);
    }
  }, [deleteTarget, deleteExpense, showToast]);

  // Debug: log expenses to verify data
  console.log('Expenses data:', expenses);
  console.log('Filter:', filter);

  return (
    <div className="space-y-6">
      <PageHeader title="Recent Expenses" subtitle={`${getMonthName(new Date().getMonth() + 1)} ${new Date().getFullYear()} · Latest ${pageSize} records`}>
        <Button variant="outline" size="sm" onClick={() => navigate("/transactions")}>
          View All <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        <Button variant="accent" size="sm" onClick={() => { setEditingExpense(null); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Add
        </Button>
      </PageHeader>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Income", value: totals.income, color: "text-income-500" },
          { label: "Expenses", value: totals.expense, color: "text-expense-500" },
          { label: "Net", value: totals.net, color: totals.net >= 0 ? "text-accent-500" : "text-expense-500" }
        ].map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
            className="p-4 text-center border shadow-sm bg-surface rounded-xl border-surface-border">
            <p className="mb-1 text-xs text-primary-400">{item.label}</p>
            <p className={`font-bold text-lg ${item.color}`}>{formatCurrency(item.value)}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <TransactionFilters
        searchInput={searchInput} onSearchChange={setSearchInput}
        selectedType={selectedType} onTypeChange={setSelectedType}
        selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory}
        categories={categories} activeFilterCount={activeFilterCount} onClear={clearFilters}
      />

      {/* List */}
      <div className="overflow-hidden border shadow-sm bg-surface rounded-xl border-surface-border">
        {isLoading ? <ListSkeleton rows={5} /> : expenses.length === 0 ? (
          <EmptyState title="No transactions found" description="Add your first transaction" />
        ) : (
          <div className="divide-y divide-primary-50">
            {expenses.map((expense, i) => (
              <motion.div key={expense.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                className="flex items-center justify-between p-3.5 hover:bg-primary-50/50 transition-colors group">
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getCategoryColor(expense.categoryType, expense.categoryIcon)}`}>
                    {getIconElement(expense.categoryIcon, "h-5 w-5")}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary-700">{expense.description}</p>
                    <p className="text-xs text-primary-400">{expense.categoryName} · {formatDate(expense.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${expense.categoryType === 'income' ? 'text-income-500' : 'text-expense-500'}`}>
                    {expense.categoryType === 'income' ? '+' : '−'}{formatCurrency(expense.amount)}
                  </span>
                  <div className="flex transition-opacity opacity-0 group-hover:opacity-100">
                    <button onClick={() => { setEditingExpense(expense); setShowForm(true); }} className="p-1.5 hover:bg-accent-50 rounded-lg" aria-label="Edit">
                      <Edit2 className="h-3.5 w-3.5 text-primary-400" />
                    </button>
                    <button onClick={() => setDeleteTarget(expense)} className="p-1.5 hover:bg-expense-50 rounded-lg" aria-label="Delete">
                      <Trash2 className="h-3.5 w-3.5 text-expense-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <ExpenseForm
        expense={editingExpense}
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingExpense(null); }}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Transaction?"
        message={`Are you sure you want to delete "${deleteTarget?.description}"?`}
        loading={isDeleting}
      />
    </div>
  );
};

export default Expenses;