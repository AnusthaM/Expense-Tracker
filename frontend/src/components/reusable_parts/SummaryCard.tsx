import React from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: "income" | "expense" | "accent" | "primary";
  delay?: number;
  isCount?: boolean;
}

const styles = {
  income: {
    accent: "border-l-income-500",
    bg: "bg-income-50",
    text: "text-income-500",
  },
  expense: {
    accent: "border-l-expense-500",
    bg: "bg-expense-50",
    text: "text-expense-500",
  },
  accent: {
    accent: "border-l-accent-500",
    bg: "bg-accent-50",
    text: "text-accent-500",
  },
  primary: {
    accent: "border-l-primary-400",
    bg: "bg-primary-50",
    text: "text-primary-500",
  },
};

export const SummaryCard: React.FC<SummaryCardProps> = ({
  label,
  value,
  icon: Icon,
  color,
  delay = 0,
  isCount,
}) => {
  const s = styles[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      className={`bg-surface rounded-xl border border-surface-border border-l-4 ${s.accent} p-5 shadow-sm
        hover:shadow-md transition-shadow duration-300`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium tracking-wider uppercase text-primary-400">
          {label}
        </span>
        <div className={`p-2 rounded-xl ${s.bg}`}>
          <Icon className={`h-4 w-4 ${s.text}`} />
        </div>
      </div>
      <div className="text-2xl font-bold tracking-tight text-primary-800">
        {isCount ? value : formatCurrency(value as number)}
      </div>
    </motion.div>
  );
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
