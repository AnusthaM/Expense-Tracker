using System.ComponentModel.DataAnnotations;

namespace ExpenseTracker.DTOs;

public class BudgetDto
{
    public Guid Id { get; set; }
    public decimal Amount { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string? CategoryIcon { get; set; }
    public decimal Spent { get; set; }
    public decimal Remaining { get; set; }
    public double PercentageUsed { get; set; }
}

public class CreateBudgetDto
{
    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal Amount { get; set; }

    [Required]
    [Range(1, 12)]
    public int Month { get; set; }

    [Required]
    public int Year { get; set; }

    [Required]
    public Guid CategoryId { get; set; }
}

public class UpdateBudgetDto
{
    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal Amount { get; set; }
}

public class BudgetNotificationDto
{
    public string CategoryName { get; set; } = string.Empty;
    public decimal BudgetAmount { get; set; }
    public decimal Spent { get; set; }
    public decimal Remaining { get; set; }
    public double PercentageUsed { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}