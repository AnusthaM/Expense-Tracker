import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, AlertTriangle, X, Target } from "lucide-react";
import { Button } from "../components/ui/Button";
import { ConfirmDialog } from "../components/reusable_parts/ConfirmDialog";
import { useBudgets, useBudgetNotifications } from "../hooks/useBudgets";
import { useCategories } from "../hooks/useCategories";
import { formatCurrency } from "../lib/utils";
import { getIconElement, getCategoryColor } from "../lib/icons";
import { useToast } from "../components/reusable_parts/Toast";
import { PageHeader } from "../components/reusable_parts/PageHeader";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/reusable_parts/EmptyState";
import { CardSkeleton } from "../components/reusable_parts/LoadingSkeleton";

const Budgets: React.FC = () => {
  const y = new Date().getFullYear(), m = new Date().getMonth() + 1;
  const { showToast } = useToast();
  const { budgets, isLoading, createBudget, updateBudget, deleteBudget, isCreating, isDeleting } = useBudgets(y, m);
  const { data: notifications } = useBudgetNotifications();
  const { expenseCategories } = useCategories();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState(0);
  const [form, setForm] = useState({ categoryId: "", amount: 0 });
  const [error, setError] = useState("");
  const [dismissedNotifications, setDismissedNotifications] = useState<number[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const existingBudget = budgets.find(b => b.categoryId === form.categoryId);

  const handleSave = async () => {
    if (!form.categoryId || form.amount <= 0) { setError("Select category and amount"); return; }
    try {
      if (existingBudget) await updateBudget({ id: existingBudget.id, data: { amount: form.amount } });
      else await createBudget({ categoryId: form.categoryId, amount: form.amount, month: m, year: y });
      showToast("success", existingBudget ? "Updated!" : "Created!");
      setShowForm(false); reset();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed"); }
  };

  const handleUpdate = async (id: string) => {
    if (editAmount <= 0) return;
    try { await updateBudget({ id, data: { amount: editAmount } }); setEditing(null); showToast("warning", "Budget updated!"); }
    catch (err: unknown) { showToast("error", err instanceof Error ? err.message : "Failed"); }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try { await deleteBudget(deleteTarget.id); showToast("error", "Budget deleted"); }
    catch (err: unknown) { showToast("error", err instanceof Error ? err.message : "Failed"); }
    finally { setDeleteTarget(null); }
  };

  const reset = () => { setForm({ categoryId: "", amount: 0 }); setError(""); };

  const progressColor = (pct: number) => {
    if (pct >= 90) return { bar: "bg-expense-500", bg: "bg-expense-50", text: "text-expense-600", border: "border-expense-200" };
    if (pct >= 75) return { bar: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" };
    return { bar: "bg-accent-500", bg: "bg-accent-50", text: "text-accent-600", border: "border-accent-200" };
  };

  const monthName = new Date(y, m - 1).toLocaleString('default', { month: 'long' });
  const activeNotifications = notifications?.filter((_, i) => !dismissedNotifications.includes(i)) || [];

  return (
    <div className="space-y-6">
      <PageHeader title="Budgets" subtitle={`${monthName} ${y}`}>
        <Button variant="accent" size="sm" onClick={() => { setShowForm(true); reset(); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Budget
        </Button>
      </PageHeader>

      {/* Notifications */}
      <AnimatePresence>
        {activeNotifications.map((n, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
            className={`p-4 rounded-xl border flex items-start gap-3 ${n.status === 'critical' ? 'bg-expense-50/80 border-expense-200' : 'bg-amber-50/80 border-amber-200'}`}>
            <AlertTriangle className={`h-5 w-5 shrink-0 mt-0.5 ${n.status === 'critical' ? 'text-expense-500' : 'text-amber-500'}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary-800">{n.categoryName}</p>
              <p className="text-xs text-primary-500 mt-0.5">{n.message}</p>
              <div className="flex gap-4 mt-2 text-xs">
                <span>Spent: <span className="font-medium text-primary-700">{formatCurrency(n.spent)}</span></span>
                <span>Budget: <span className="font-medium text-primary-700">{formatCurrency(n.budgetAmount)}</span></span>
                <span>Left: <span className={`font-medium ${n.remaining < 0 ? 'text-expense-500' : 'text-primary-700'}`}>{formatCurrency(n.remaining)}</span></span>
              </div>
            </div>
            <button onClick={() => setDismissedNotifications(prev => [...prev, i])} className="p-1 rounded-lg hover:bg-black/5" aria-label="Dismiss">
              <X className="w-4 h-4 text-primary-400" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Budget Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : budgets.length === 0 ? (
        <Card>
          <EmptyState icon={Target} title="No budgets set" description="Set spending limits for categories"
            action={<Button variant="accent" size="sm" onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" /> Set Budget</Button>} />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {budgets.map((b, i) => {
              const c = progressColor(b.percentageUsed);
              return (
                <motion.div key={b.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3, delay: i * 0.05 }}
                  className={`bg-surface rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow group relative ${c.border}`}>
                  {/* Action buttons on hover */}
                  <div className="absolute flex gap-1 transition-opacity opacity-0 top-3 right-3 group-hover:opacity-100">
                    <button onClick={() => { setEditing(b.id); setEditAmount(b.amount); }} className="p-1.5 hover:bg-accent-50 rounded-lg" aria-label="Edit">
                      <Edit2 className="h-3.5 w-3.5 text-primary-400" />
                    </button>
                    <button onClick={() => setDeleteTarget({ id: b.id, name: b.categoryName })} className="p-1.5 hover:bg-expense-50 rounded-lg" aria-label="Delete">
                      <Trash2 className="h-3.5 w-3.5 text-expense-400" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2.5 mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getCategoryColor("expense", b.categoryIcon)}`}>
                      {getIconElement(b.categoryIcon, "h-5 w-5")}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary-800">{b.categoryName}</p>
                      <p className="text-xs text-primary-400">{formatCurrency(b.amount)} budget</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-primary-500">Spent {formatCurrency(b.spent)}</span>
                      <span className={`font-medium ${c.text}`}>{b.percentageUsed.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-2 overflow-hidden rounded-full bg-primary-50">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(b.percentageUsed, 100)}%` }} transition={{ duration: 0.6 }} className={`h-full rounded-full ${c.bar}`} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className={`p-3 rounded-xl ${c.bg}`}>
                      <p className="text-xs text-primary-500 mb-0.5">Remaining</p>
                      <p className={`font-semibold text-sm ${b.remaining < 0 ? 'text-expense-500' : 'text-primary-800'}`}>{formatCurrency(Math.max(0, b.remaining))}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-primary-50">
                      <p className="text-xs text-primary-500 mb-0.5">Spent</p>
                      <p className="text-sm font-semibold text-primary-800">{formatCurrency(b.spent)}</p>
                    </div>
                  </div>

                  {b.remaining < 0 && <p className="mt-3 text-xs font-medium text-center text-expense-500">Over by {formatCurrency(Math.abs(b.remaining))}</p>}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditing(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-sm overflow-hidden shadow-xl bg-surface rounded-2xl">
              <div className="flex items-center justify-between px-6 pt-6 pb-4">
                <h3 className="text-lg font-semibold text-primary-800">Edit Budget</h3>
                <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg hover:bg-primary-50"><X size={18} className="text-primary-400" /></button>
              </div>
              <div className="px-6 pb-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-primary-600 mb-1.5 block">Amount</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-500 font-medium">$</span>
                    <input type="number" min="0.01" step="0.01" value={editAmount || ''} onChange={e => setEditAmount(+e.target.value || 0)}
                      className="w-full pl-8 pr-4 text-sm transition-all border-2 h-11 rounded-xl border-surface-border bg-surface focus:outline-none focus:border-accent-400 focus:ring-4 focus:ring-accent-50" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setEditing(null)} className="flex-1 h-11">Cancel</Button>
                  <Button variant="accent" onClick={() => handleUpdate(editing)} disabled={editAmount <= 0} className="flex-1 h-11">Update</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setShowForm(false); reset(); }} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-sm overflow-hidden shadow-xl bg-surface rounded-2xl">
              <div className="flex items-center justify-between px-6 pt-6 pb-4">
                <h3 className="text-lg font-semibold text-primary-800">Set Budget</h3>
                <button onClick={() => { setShowForm(false); reset(); }} className="p-1.5 rounded-lg hover:bg-primary-50"><X size={18} className="text-primary-400" /></button>
              </div>
              <div className="px-6 pb-6 space-y-4">
                {error && <div className="p-3 text-sm border rounded-xl bg-expense-50 border-expense-100 text-expense-600">{error}</div>}
                <div>
                  <label className="text-sm font-medium text-primary-600 mb-1.5 block">Category</label>
                  <select value={form.categoryId} onChange={e => { setForm({ categoryId: e.target.value, amount: budgets.find(b => b.categoryId === e.target.value)?.amount || 0 }); }}
                    className="w-full px-4 text-sm transition-all border-2 h-11 rounded-xl border-surface-border bg-surface focus:outline-none focus:border-accent-400 focus:ring-4 focus:ring-accent-50">
                    <option value="">Select category</option>
                    {expenseCategories.map(c => <option key={c.id} value={c.id}>{c.name}{budgets.find(b => b.categoryId === c.id) ? ' (has budget)' : ''}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-primary-600 mb-1.5 block">Monthly Limit</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-500 font-medium">$</span>
                    <input type="number" min="0.01" step="0.01" value={form.amount || ''} onChange={e => setForm({ ...form, amount: +e.target.value || 0 })} placeholder="0.00"
                      className="w-full pl-8 pr-4 text-sm transition-all border-2 h-11 rounded-xl border-surface-border bg-surface focus:outline-none focus:border-accent-400 focus:ring-4 focus:ring-accent-50 placeholder:text-primary-300" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => { setShowForm(false); reset(); }} className="flex-1 h-11">Cancel</Button>
                  <Button variant="accent" onClick={handleSave} loading={isCreating} disabled={!form.categoryId || form.amount <= 0} className="flex-1 h-11">
                    {existingBudget ? 'Update' : 'Set'} Budget
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Budget?"
        message={`Are you sure you want to delete the budget for "${deleteTarget?.name}"? This action cannot be undone.`}
        loading={isDeleting}
      />
    </div>
  );
};

export default Budgets;