import React, { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, PiggyBank, Activity, Calendar } from "lucide-react";
import { useMonthlySummary, useYearlyOverview } from "../hooks/useExpenses";
import { useExpenses } from "../hooks/useExpenses";
import { formatCurrency, getMonthName } from "../lib/utils";
import { getIconElement, getCategoryColor } from "../lib/icons";
import { PageHeader } from "../components/reusable_parts/PageHeader";
import { SummaryCard } from "../components/reusable_parts/SummaryCard";
import { Card, CardTitle } from "../components/ui/Card";
import { EmptyState } from "../components/reusable_parts/EmptyState";
import { ListSkeleton, CardSkeleton } from "../components/reusable_parts/LoadingSkeleton";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area
} from "recharts";

const CHART_COLORS = [
  '#f43f5e', '#0ea5e9', '#a855f7', '#f97316', '#eab308',
  '#22c55e', '#ec4899', '#06b6d4', '#8b5cf6', '#84cc16'
];

const NOW = new Date();
const CURRENT_MONTH = NOW.getMonth() + 1;
const CURRENT_YEAR = NOW.getFullYear();

const Dashboard: React.FC = () => {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [month, setMonth] = useState(CURRENT_MONTH);
  const isCurrent = year === CURRENT_YEAR && month === CURRENT_MONTH;

  const { data: summary, isLoading } = useMonthlySummary(year, month);
  const { data: yearlyOverview } = useYearlyOverview(year);
  const { expenses: recent } = useExpenses({ page: 1, pageSize: 5 });

  const go = (dir: 'prev' | 'next') => {
    if (dir === 'prev') month === 1 ? (setMonth(12), setYear(y => y - 1)) : setMonth(m => m - 1);
    else if (!isCurrent) month === 12 ? (setMonth(1), setYear(y => y + 1)) : setMonth(m => m + 1);
  };

  const TooltipContent = ({ active, payload }: any) => {
    if (active && payload?.length) {
      const d = payload[0];
      return (
        <div className="px-3 py-2 text-sm border rounded-lg shadow-lg bg-surface border-surface-border">
          <p className="font-medium text-primary-700">{d.name}</p>
          <p className="text-primary-500">{formatCurrency(d.value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle={`${getMonthName(month)} ${year}${isCurrent ? ' · Current' : ''}`}>
        <div className="inline-flex items-center gap-0.5 bg-surface rounded-xl border border-surface-border p-1 shadow-sm">
          <button onClick={() => go('prev')} className="p-2 transition-colors rounded-lg hover:bg-primary-50 text-primary-400">←</button>
          <div className="flex items-center justify-center gap-2 px-3 min-w-35">
            <Calendar className="w-4 h-4 text-primary-400" />
            <span className="text-sm font-medium text-primary-600">{getMonthName(month)} {year}</span>
          </div>
          <button onClick={() => go('next')} disabled={isCurrent} className={`p-2 rounded-lg transition-colors ${isCurrent ? 'text-primary-200 cursor-not-allowed' : 'hover:bg-primary-50 text-primary-400'}`}>→</button>
        </div>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <SummaryCard label="Income" value={summary?.totalIncome || 0} icon={TrendingUp} color="income" delay={0} />
            <SummaryCard label="Expenses" value={summary?.totalExpenses || 0} icon={TrendingDown} color="expense" delay={0.08} />
            <SummaryCard label="Savings" value={summary?.netSavings || 0} icon={PiggyBank} color="accent" delay={0.16} />
            <SummaryCard label="Transactions" value={summary?.transactionCount || 0} icon={Activity} color="primary" delay={0.24} isCount />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Expense Breakdown */}
        <Card delay={0.15}>
          <CardTitle>Expense Breakdown</CardTitle>
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 rounded-full border-accent-500 border-t-transparent animate-spin" />
            </div>
          ) : summary?.categoryBreakdown?.length ? (
            <div>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={summary.categoryBreakdown.map(i => ({ name: i.categoryName, value: i.totalAmount }))}
                    cx="50%" cy="50%" innerRadius={55} outerRadius={95}
                    paddingAngle={0} dataKey="value" stroke="none" strokeWidth={0}
                  >
                    {summary.categoryBreakdown.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip content={<TooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
                {summary.categoryBreakdown.map((c, i) => (
                  <div key={c.categoryName} className="flex items-center gap-2 text-sm">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="truncate text-primary-600">{c.categoryName}</span>
                    <span className="ml-auto text-xs text-primary-400">{c.percentage.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState title="No expenses this month" description="Add expenses to see breakdown" />
          )}
        </Card>

        {/* Income vs Expenses */}
        <Card delay={0.2}>
          <CardTitle>Income vs Expenses</CardTitle>
          {yearlyOverview ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={yearlyOverview} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="monthName" tickFormatter={n => n.substring(0, 3)} stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip content={<TooltipContent />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="Loading data..." />
          )}
        </Card>

        {/* Savings Trend */}
        <Card delay={0.25}>
          <CardTitle>Savings Trend</CardTitle>
          {yearlyOverview ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={yearlyOverview}>
                <defs>
                  <linearGradient id="savings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="monthName" tickFormatter={n => n.substring(0, 3)} stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip content={<TooltipContent />} />
                <Area type="monotone" dataKey="netSavings" stroke="#0ea5e9" strokeWidth={2} fill="url(#savings)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="Loading data..." />
          )}
        </Card>

        {/* Recent Activity */}
        <Card delay={0.3}>
          <CardTitle>Recent Activity</CardTitle>
          <div className="space-y-1">
            {recent.length > 0 ? (
              recent.map((e, i) => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-primary-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${getCategoryColor(e.categoryType, e.categoryIcon)}`}>
                      {getIconElement(e.categoryIcon, "h-4 w-4")}
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
              ))
            ) : (
              <EmptyState title="No recent activity" />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;