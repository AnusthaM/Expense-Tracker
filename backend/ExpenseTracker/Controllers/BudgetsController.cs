using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ExpenseTracker.Data;
using ExpenseTracker.Models;
using ExpenseTracker.Constants;
using ExpenseTracker.DTOs;
using ExpenseTracker.Services;

namespace ExpenseTracker.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BudgetsController : BaseController
{
    private readonly AppDbContext _context;
    private readonly IExpenseCalculator _calculator;

    public BudgetsController(AppDbContext context, IExpenseCalculator calculator)
    {
        _context = context;
        _calculator = calculator;
    }

    // Get all budgets with real-time spent calculation.
    [HttpGet]
    public async Task<ActionResult<List<BudgetDto>>> GetBudgets([FromQuery] int? year, [FromQuery] int? month)
    {
        var userId = GetUserId();
        var currentYear = year ?? DateTime.UtcNow.Year;
        var currentMonth = month ?? DateTime.UtcNow.Month;
        ValidateMonth(currentMonth);

        var budgets = await _context.Budgets
            .Include(b => b.Category)
            .Where(b => b.UserId == userId && b.Year == currentYear && b.Month == currentMonth)
            .ToListAsync();

        var result = new List<BudgetDto>();
        foreach (var budget in budgets)
        {
            var spent = await _calculator.CalculateSpentAsync(userId, budget.CategoryId, budget.Year, budget.Month);
            result.Add(new BudgetDto
            {
                Id = budget.Id,
                Amount = budget.Amount,
                Month = budget.Month,
                Year = budget.Year,
                CategoryId = budget.CategoryId,
                CategoryName = budget.Category.Name,
                CategoryIcon = budget.Category.Icon,
                Spent = spent,
                Remaining = budget.Amount - spent,
                PercentageUsed = budget.Amount > 0 ? (double)((spent / budget.Amount) * 100) : 0
            });
        }

        return Ok(result);
    }

    // Create a new budget.
    [HttpPost]
    public async Task<ActionResult<BudgetDto>> CreateBudget([FromBody] CreateBudgetDto request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        ValidateMonth(request.Month);

        var userId = GetUserId();
        var existing = await _context.Budgets
            .FirstOrDefaultAsync(b => b.UserId == userId
                && b.CategoryId == request.CategoryId
                && b.Year == request.Year
                && b.Month == request.Month);

        if (existing != null)
            return BadRequest(new { message = "Budget already exists for this category and month" });

        var budget = new Budget
        {
            Id = Guid.NewGuid(),
            Amount = request.Amount,
            Month = request.Month,
            Year = request.Year,
            CategoryId = request.CategoryId,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Budgets.Add(budget);
        await _context.SaveChangesAsync();

        var spent = await _calculator.CalculateSpentAsync(userId, budget.CategoryId, budget.Year, budget.Month);
        var category = await _context.Categories.FindAsync(budget.CategoryId);

        return Ok(new BudgetDto
        {
            Id = budget.Id,
            Amount = budget.Amount,
            Month = budget.Month,
            Year = budget.Year,
            CategoryId = budget.CategoryId,
            CategoryName = category?.Name ?? "",
            Spent = spent,
            Remaining = budget.Amount - spent,
            PercentageUsed = budget.Amount > 0 ? (double)((spent / budget.Amount) * 100) : 0
        });
    }

    // Update budget amount.
    [HttpPut("{id}")]
    public async Task<ActionResult<BudgetDto>> UpdateBudget(Guid id, [FromBody] UpdateBudgetDto request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var userId = GetUserId();
        var budget = await _context.Budgets
            .Include(b => b.Category)
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);
        if (budget == null) return NotFound(new { message = "Budget not found" });

        budget.Amount = request.Amount;
        budget.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var spent = await _calculator.CalculateSpentAsync(userId, budget.CategoryId, budget.Year, budget.Month);

        return Ok(new BudgetDto
        {
            Id = budget.Id,
            Amount = budget.Amount,
            Month = budget.Month,
            Year = budget.Year,
            CategoryId = budget.CategoryId,
            CategoryName = budget.Category.Name,
            CategoryIcon = budget.Category.Icon,
            Spent = spent,
            Remaining = budget.Amount - spent,
            PercentageUsed = budget.Amount > 0 ? (double)((spent / budget.Amount) * 100) : 0
        });
    }

    // Delete budget.
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteBudget(Guid id)
    {
        var userId = GetUserId();
        var budget = await _context.Budgets
            .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);
        if (budget == null) return NotFound(new { message = "Budget not found" });

        _context.Budgets.Remove(budget);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Budget deleted successfully" });
    }

    // Get budget notifications for current month.
    [HttpGet("notifications")]
    public async Task<ActionResult<List<BudgetNotificationDto>>> GetNotifications()
    {
        var userId = GetUserId();
        var now = DateTime.UtcNow;

        var budgets = await _context.Budgets
            .Include(b => b.Category)
            .Where(b => b.UserId == userId && b.Year == now.Year && b.Month == now.Month)
            .ToListAsync();

        var notifications = new List<BudgetNotificationDto>();

        foreach (var budget in budgets)
        {
            var spent = await _calculator.CalculateSpentAsync(userId, budget.CategoryId, budget.Year, budget.Month);
            var percentageUsed = budget.Amount > 0 ? (double)((spent / budget.Amount) * 100) : 0;
            var remaining = budget.Amount - spent;

            if (percentageUsed >= 90)
            {
                notifications.Add(new BudgetNotificationDto
                {
                    CategoryName = budget.Category.Name,
                    BudgetAmount = budget.Amount,
                    Spent = spent,
                    Remaining = remaining,
                    PercentageUsed = percentageUsed,
                    Status = "critical",
                    Message = $"Budget almost depleted: {percentageUsed:F0}% used"
                });
            }
            else if (percentageUsed >= 75)
            {
                notifications.Add(new BudgetNotificationDto
                {
                    CategoryName = budget.Category.Name,
                    BudgetAmount = budget.Amount,
                    Spent = spent,
                    Remaining = remaining,
                    PercentageUsed = percentageUsed,
                    Status = "warning",
                    Message = $"Budget running low: {percentageUsed:F0}% used"
                });
            }
        }

        return Ok(notifications.OrderByDescending(n => n.PercentageUsed).ToList());
    }
}