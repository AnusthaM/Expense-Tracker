import axios from 'axios';
import type {
  UserDto, RegisterRequest,
  CategoryDto, CreateCategoryRequest, UpdateCategoryRequest,
  ExpenseDto, CreateExpenseRequest, UpdateExpenseRequest,
  ExpenseFilter, PagedResponse, MonthlySummaryDto,
  YearlyOverviewDto, BudgetDto,
  CreateBudgetRequest, UpdateBudgetRequest, BudgetNotificationDto
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7286/api';

class ApiClient {
  private api;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000,
      withCredentials: true // Send httpOnly cookies automatically
    });
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // No token handling needed - httpOnly cookie is sent automatically
    // Only handle 401 responses (expired/invalid cookie)
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('user');
          if (window.location.pathname !== '/auth') {
            window.location.href = '/auth';
          }
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: any): Error {
    if (error.response?.data?.message) return new Error(error.response.data.message);
    if (error.response?.data?.errors) {
      const messages = Object.values(error.response.data.errors).flat();
      return new Error(messages.join(', '));
    }
    if (error.request) return new Error('Network error. Please check your connection.');
    return new Error('An unexpected error occurred.');
  }

  // ============================================
  // AUTH - Returns UserDto only (no token in body)
  // ============================================
  async login(email: string, password: string): Promise<UserDto> {
    const { data } = await this.api.post('/auth/login', { email, password });
    return data;
  }

  async register(request: RegisterRequest): Promise<UserDto> {
    const { data } = await this.api.post('/auth/register', request);
    return data;
  }

  async logout(): Promise<void> {
    await this.api.post('/auth/logout');
  }

  async getCurrentUser(): Promise<UserDto> {
    const { data } = await this.api.get('/auth/me');
    return data;
  }

  // ============================================
  // CATEGORIES
  // ============================================
  async getCategories(): Promise<CategoryDto[]> {
    const { data } = await this.api.get('/categories');
    return data;
  }

  async createCategory(request: CreateCategoryRequest): Promise<CategoryDto> {
    const { data } = await this.api.post('/categories', request);
    return data;
  }

  async updateCategory(id: string, request: UpdateCategoryRequest): Promise<void> {
    await this.api.put(`/categories/${id}`, request);
  }

  async deleteCategory(id: string): Promise<void> {
    await this.api.delete(`/categories/${id}`);
  }

  // ============================================
  // EXPENSES
  // ============================================
  async getExpenses(filter?: ExpenseFilter): Promise<PagedResponse<ExpenseDto>> {
    const params = new URLSearchParams();
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    const { data } = await this.api.get(`/expenses?${params.toString()}`);
    return data;
  }

  async createExpense(request: CreateExpenseRequest): Promise<ExpenseDto> {
    const { data } = await this.api.post('/expenses', request);
    return data;
  }

  async updateExpense(id: string, request: UpdateExpenseRequest): Promise<ExpenseDto> {
    const { data } = await this.api.put(`/expenses/${id}`, request);
    return data;
  }

  async deleteExpense(id: string): Promise<void> {
    await this.api.delete(`/expenses/${id}`);
  }

  async getMonthlySummary(year: number, month: number): Promise<MonthlySummaryDto> {
    const { data } = await this.api.get('/expenses/summary', { params: { year, month } });
    return data;
  }

  async getYearlyOverview(year: number): Promise<YearlyOverviewDto[]> {
    const { data } = await this.api.get('/expenses/yearly-overview', { params: { year } });
    return data;
  }

  // ============================================
  // BUDGETS
  // ============================================
  async getBudgets(year?: number, month?: number): Promise<BudgetDto[]> {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());
    const { data } = await this.api.get(`/budgets?${params.toString()}`);
    return data;
  }

  async createBudget(request: CreateBudgetRequest): Promise<void> {
    await this.api.post('/budgets', request);
  }

  async updateBudget(id: string, request: UpdateBudgetRequest): Promise<void> {
    await this.api.put(`/budgets/${id}`, request);
  }

  async deleteBudget(id: string): Promise<void> {
    await this.api.delete(`/budgets/${id}`);
  }

  async getBudgetNotifications(): Promise<BudgetNotificationDto[]> {
    const { data } = await this.api.get('/budgets/notifications');
    return data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;