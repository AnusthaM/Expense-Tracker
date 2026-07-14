import React from "react";
import { motion } from "framer-motion";
import { Edit2, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "../ui/Button";
import { formatCurrency, formatDate } from "../../lib/utils";
import type { ExpenseDto } from "../../types";

interface ExpenseItemProps {
  expense: ExpenseDto;
  onEdit: (expense: ExpenseDto) => void;
  onDelete: (id: string) => void;
}

const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense, onEdit, onDelete }) => {
  const isIncome = expense.categoryType === 'income';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex items-center justify-between p-4 transition-all duration-200 border rounded-xl group border-slate-100 hover:border-slate-200 hover:bg-slate-50"
    >
      <div className="flex items-center min-w-0 gap-4">
        <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isIncome ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'
        }`}>
          {isIncome ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
        </div>
        <div className="min-w-0">
          <p className="font-medium truncate text-slate-800">{expense.description}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              isIncome ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {expense.categoryName}
            </span>
            <span className="text-xs text-slate-400">{formatDate(expense.date)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className={`font-semibold whitespace-nowrap ${isIncome ? 'text-green-500' : 'text-red-500'}`}>
          {isIncome ? '+' : '-'}{formatCurrency(expense.amount)}
        </span>
        <div className="flex gap-1 transition-opacity duration-200 opacity-0 group-hover:opacity-100">
          <Button variant="ghost" size="icon" onClick={() => onEdit(expense)}>
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(expense.id)}>
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ExpenseItem;