// ============================================
// AUTH TYPES
// ============================================

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: UserDto;
  expiresAt: string;
}

export interface UserDto {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
}

// ============================================
// CATEGORY TYPES
// ============================================

export interface CategoryDto {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  description?: string;
  expenseCount: number;
  createdAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  description?: string;
}

export interface UpdateCategoryRequest {
  name: string;
  type: 'income' | 'expense';
  icon?: string;
  description?: string;
}

// ============================================
// EXPENSE TYPES
// ============================================

export interface ExpenseDto {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: "income" | "expense";
  categoryId: string;
  categoryName: string;
  categoryType: "income" | "expense";
  categoryIcon?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateExpenseRequest {
  amount: number;
  description: string;
  date: string;
  categoryId: string;
}

export interface UpdateExpenseRequest {
  amount: number;
  description: string;
  date: string;
  categoryId: string;
}

export interface ExpenseFilter {
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  type?: 'income' | 'expense';
  searchTerm?: string;
  page: number;
  pageSize: number;
}

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================
// BUDGET TYPES
// ============================================
export interface BudgetDto {
  id: string;
  amount: number;
  month: number;
  year: number;
  categoryId: string;
  categoryName: string;
  categoryIcon?: string;
  spent: number;
  remaining: number;
  percentageUsed: number;
}

export interface CreateBudgetRequest {
  amount: number;
  month: number;
  year: number;
  categoryId: string;
}

export interface UpdateBudgetRequest {
  amount: number;
}

export interface BudgetNotificationDto {
  categoryName: string;
  budgetAmount: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
  status: "warning" | "critical";
  message: string;
}

// ============================================
// SUMMARY & REPORT TYPES
// ============================================

export interface MonthlySummaryDto {
  year: number;
  month: number;
  monthName: string;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  transactionCount: number;
  categoryBreakdown: CategorySummaryDto[];
  dailyTotals: DailyTotalDto[];
}

export interface CategorySummaryDto {
  categoryName: string;
  categoryIcon?: string;
  categoryType: string;
  totalAmount: number;
  percentage: number;
  transactionCount: number;
}

export interface DailyTotalDto {
  date: string;
  income: number;
  expenses: number;
}

export interface YearlyOverviewDto {
  month: number;
  monthName: string;
  income: number;
  expenses: number;
  netSavings: number;
  transactionCount: number;
}

export interface ExpenseTrendDto {
  period: string;
  currentAmount: number;
  previousAmount: number;
  changePercentage: number;
}