import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { X, DollarSign, FileText, Calendar, Tag } from "lucide-react";
import { Button } from "../ui/Button";
import { useCategories } from "../../hooks/useCategories";
import { getIconElement, getCategoryColor } from "../../lib/icons";
import type { ExpenseDto, CreateExpenseRequest } from "../../types";

interface ExpenseFormProps {
  expense?: ExpenseDto | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateExpenseRequest, id?: string) => Promise<void>;
  isSubmitting: boolean;
}

interface FormData {
  amount: number;
  description: string;
  date: string;
  categoryId: string;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ expense, isOpen, onClose, onSubmit, isSubmitting }) => {
  const isEditing = !!expense;
  const { categories } = useCategories();

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<FormData>({
    defaultValues: { amount: undefined, description: '', date: new Date().toISOString().split('T')[0], categoryId: '' }
  });

  useEffect(() => {
    if (isOpen) {
      if (expense) {
        reset({ amount: expense.amount, description: expense.description, date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0], categoryId: expense.categoryId });
      } else {
        reset({ amount: undefined, description: '', date: new Date().toISOString().split('T')[0], categoryId: '' });
      }
    }
  }, [expense, isOpen, reset]);

  const selectedCategoryId = watch('categoryId');
  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  const handleFormSubmit = async (data: FormData) => {
    // Don't show toast here - let the parent handle it
    await onSubmit({ amount: data.amount, description: data.description, date: data.date, categoryId: data.categoryId }, expense?.id);
  };

  const Required = () => <span className="text-expense-500 ml-0.5">*</span>;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { reset(); onClose(); }} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-md overflow-hidden shadow-xl bg-surface rounded-2xl">
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <div>
                <h3 className="text-lg font-semibold text-primary-800">{isEditing ? 'Edit' : 'New'} Transaction</h3>
                {selectedCategory && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${getCategoryColor(selectedCategory.type, selectedCategory.icon)}`}>
                      {getIconElement(selectedCategory.icon, "h-3.5 w-3.5")}
                    </div>
                    <span className="text-sm text-primary-500">{selectedCategory.type === 'income' ? 'Income' : 'Expense'} · {selectedCategory.name}</span>
                  </div>
                )}
              </div>
              <button onClick={() => { reset(); onClose(); }} className="p-1.5 rounded-lg hover:bg-primary-50"><X size={18} className="text-primary-400" /></button>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="px-6 pb-6 space-y-4">
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-primary-600 mb-1.5"><DollarSign className="h-3.5 w-3.5" />Amount<Required /></label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary-400">$</span>
                  <input type="number" step="0.01" min="0.01" placeholder="0.00"
                    className={`w-full h-11 pl-8 pr-4 rounded-xl border-2 bg-surface text-sm focus:outline-none focus:ring-4 transition-all placeholder:text-primary-300 ${errors.amount ? 'border-expense-400 focus:border-expense-400 focus:ring-expense-50' : 'border-surface-border focus:border-accent-400 focus:ring-accent-50'}`}
                    {...register('amount', { required: 'Required', min: { value: 0.01, message: 'Must be > 0' }, valueAsNumber: true })} />
                </div>
                {errors.amount && <p className="mt-1 text-xs text-expense-500">{errors.amount.message}</p>}
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-primary-600 mb-1.5"><FileText className="h-3.5 w-3.5" />Description<Required /></label>
                <input type="text" placeholder="What was this for?"
                  className={`w-full h-11 px-4 rounded-xl border-2 bg-surface text-sm focus:outline-none focus:ring-4 transition-all ${errors.description ? 'border-expense-400 focus:border-expense-400 focus:ring-expense-50' : 'border-surface-border focus:border-accent-400 focus:ring-accent-50'}`}
                  {...register('description', { required: 'Required', maxLength: { value: 200, message: 'Max 200 chars' } })} />
                {errors.description && <p className="mt-1 text-xs text-expense-500">{errors.description.message}</p>}
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-primary-600 mb-1.5"><Calendar className="h-3.5 w-3.5" />Date<Required /></label>
                <input type="date" max={new Date().toISOString().split('T')[0]}
                  className={`w-full h-11 px-4 rounded-xl border-2 bg-surface text-sm focus:outline-none focus:ring-4 transition-all ${errors.date ? 'border-expense-400 focus:border-expense-400 focus:ring-expense-50' : 'border-surface-border focus:border-accent-400 focus:ring-accent-50'}`}
                  {...register('date', { required: 'Required' })} />
                {errors.date && <p className="mt-1 text-xs text-expense-500">{errors.date.message}</p>}
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-primary-600 mb-1.5"><Tag className="h-3.5 w-3.5" />Category<Required /></label>
                <select className={`w-full h-11 px-4 rounded-xl border-2 bg-surface text-sm focus:outline-none focus:ring-4 transition-all ${errors.categoryId ? 'border-expense-400 focus:border-expense-400 focus:ring-expense-50' : 'border-surface-border focus:border-accent-400 focus:ring-accent-50'}`}
                  {...register('categoryId', { required: 'Required' })}>
                  <option value="">Select category</option>
                  {categories.filter(c => c.type === 'income').length > 0 && <optgroup label="Income">{categories.filter(c => c.type === 'income').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</optgroup>}
                  {categories.filter(c => c.type === 'expense').length > 0 && <optgroup label="Expenses">{categories.filter(c => c.type === 'expense').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</optgroup>}
                </select>
                {errors.categoryId && <p className="mt-1 text-xs text-expense-500">{errors.categoryId.message}</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => { reset(); onClose(); }} disabled={isSubmitting} className="flex-1 h-11">Cancel</Button>
                <Button variant="accent" type="submit" loading={isSubmitting} className="flex-1 h-11">{isEditing ? 'Update' : 'Add'}</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ExpenseForm;