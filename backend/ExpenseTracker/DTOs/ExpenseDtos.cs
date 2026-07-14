using System.ComponentModel.DataAnnotations;

namespace ExpenseTracker.DTOs;

/// <summary>
/// DTOs for expense operations including CRUD, filtering, and summaries.
/// All monetary values use decimal for precision.
/// </summary>

// Detailed expense response
public class ExpenseDto
{
    public Guid Id { get; set; }
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string Type { get; set; } = string.Empty; // "income" or "expense"
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string CategoryType { get; set; } = string.Empty;
    public string? CategoryIcon { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

// Create expense request with validation
public class CreateExpenseDto
{
    [Required(ErrorMessage = "Amount is required")]
    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
    public decimal Amount { get; set; }

    [Required(ErrorMessage = "Description is required")]
    [MaxLength(200, ErrorMessage = "Description cannot exceed 200 characters")]
    public string Description { get; set; } = string.Empty;

    [Required(ErrorMessage = "Date is required")]
    public DateTime Date { get; set; }

    [Required(ErrorMessage = "Category is required")]
    public Guid CategoryId { get; set; }
}

// Update expense request
public class UpdateExpenseDto
{
    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal Amount { get; set; }

    [Required]
    [MaxLength(200)]
    public string Description { get; set; } = string.Empty;

    [Required]
    public DateTime Date { get; set; }

    [Required]
    public Guid CategoryId { get; set; }
}

// Filter parameters for expense queries
public class ExpenseFilterDto
{
    public Guid? CategoryId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Type { get; set; }
    public string? SearchTerm { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

// Paginated response
public class PagedResponse<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
}

// Monthly summary for dashboard
public class MonthlySummaryDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public string MonthName { get; set; } = string.Empty;
    public decimal TotalIncome { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal NetSavings { get; set; }
    public double SavingsRate { get; set; } // Percentage of income saved
    public int TransactionCount { get; set; }
    public List<CategorySummaryDto> CategoryBreakdown { get; set; } = new();
    public List<DailyTotalDto> DailyTotals { get; set; } = new();
}

// Category breakdown for charts
public class CategorySummaryDto
{
    public string CategoryName { get; set; } = string.Empty;
    public string? CategoryIcon { get; set; }
    public string CategoryType { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public double Percentage { get; set; }
    public int TransactionCount { get; set; }
}

// Daily totals for trend analysis
public class DailyTotalDto
{
    public DateTime Date { get; set; }
    public decimal Income { get; set; }
    public decimal Expenses { get; set; }
}

// Yearly overview for trend charts
public class YearlyOverviewDto
{
    public int Month { get; set; }
    public string MonthName { get; set; } = string.Empty;
    public decimal Income { get; set; }
    public decimal Expenses { get; set; }
    public decimal NetSavings { get; set; }
    public int TransactionCount { get; set; }
}

// Expense trends comparison
public class ExpenseTrendDto
{
    public string Period { get; set; } = string.Empty;
    public decimal CurrentAmount { get; set; }
    public decimal PreviousAmount { get; set; }
    public double ChangePercentage { get; set; }
}