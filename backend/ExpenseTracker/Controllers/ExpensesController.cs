using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ExpenseTracker.Data;
using ExpenseTracker.Models;
using ExpenseTracker.Constants;
using ExpenseTracker.Services;
using ExpenseTracker.DTOs;

namespace ExpenseTracker.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ExpensesController : BaseController
{
    private readonly AppDbContext _context;
    private readonly IExpenseCalculator _calculator;
    private readonly ILogger<ExpensesController> _logger;

    public ExpensesController(
        AppDbContext context,
        IExpenseCalculator calculator,
        ILogger<ExpensesController> logger)
    {
        _context = context;
        _calculator = calculator;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResponse<ExpenseDto>>> GetExpenses(
        [FromQuery] Guid? categoryId,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] string? type,
        [FromQuery] string? searchTerm,
        [FromQuery] int page = ValidationConstants.MinPage,
        [FromQuery] int pageSize = ValidationConstants.DefaultPageSize)
    {
        ValidatePagination(page, pageSize);

        if (!string.IsNullOrEmpty(type) && !TransactionType.IsValid(type))
            return BadRequest(new { message = "Type must be 'income' or 'expense'" });

        var userId = GetUserId();
        var query = _context.Expenses
            .Include(e => e.Category)
            .Where(e => e.UserId == userId);

        if (categoryId.HasValue && categoryId.Value != Guid.Empty)
            query = query.Where(e => e.CategoryId == categoryId.Value);
        if (startDate.HasValue)
            query = query.Where(e => e.Date >= startDate.Value.Date);
        if (endDate.HasValue)
            query = query.Where(e => e.Date <= endDate.Value.Date.AddDays(1).AddTicks(-1));
        if (!string.IsNullOrEmpty(type))
            query = query.Where(e => e.Type == type.ToLower());
        if (!string.IsNullOrEmpty(searchTerm))
            query = query.Where(e => e.Description.Contains(searchTerm) || e.Category.Name.Contains(searchTerm));

        var totalCount = await query.CountAsync();
        var expenses = await query
            .OrderByDescending(e => e.Date)
            .ThenByDescending(e => e.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(e => MapToDto(e))
            .ToListAsync();

        return Ok(new PagedResponse<ExpenseDto>
        {
            Items = expenses,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        });
    }

    [HttpPost]
    public async Task<ActionResult<ExpenseDto>> CreateExpense([FromBody] CreateExpenseDto request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        if (request.Date.Date > DateTime.UtcNow.Date)
            return BadRequest(new { message = "Cannot add expenses with future dates" });

        var userId = GetUserId();
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == request.CategoryId && c.UserId == userId);
        if (category == null) return BadRequest(new { message = "Invalid category" });

        var expense = new Expense
        {
            Id = Guid.NewGuid(),
            Amount = request.Amount,
            Description = request.Description,
            Date = request.Date,
            Type = category.Type.ToLower(),
            CategoryId = request.CategoryId,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Expenses.Add(expense);
        await _context.SaveChangesAsync();
        await _context.Entry(expense).Reference(e => e.Category).LoadAsync();

        _logger.LogInformation("Expense {Id} created by user {UserId}", expense.Id, userId);

        return CreatedAtAction(nameof(GetExpense), new { id = expense.Id }, MapToDto(expense));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ExpenseDto>> UpdateExpense(Guid id, [FromBody] UpdateExpenseDto request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        if (request.Date.Date > DateTime.UtcNow.Date)
            return BadRequest(new { message = "Cannot set expenses to future dates" });

        var userId = GetUserId();
        var expense = await _context.Expenses
            .Include(e => e.Category)
            .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);
        if (expense == null) return NotFound(new { message = "Expense not found" });

        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == request.CategoryId && c.UserId == userId);
        if (category == null) return BadRequest(new { message = "Invalid category" });

        expense.Amount = request.Amount;
        expense.Description = request.Description;
        expense.Date = request.Date;
        expense.Type = category.Type.ToLower();
        expense.CategoryId = request.CategoryId;
        expense.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(MapToDto(expense));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteExpense(Guid id)
    {
        var userId = GetUserId();
        var expense = await _context.Expenses
            .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);
        if (expense == null) return NotFound(new { message = "Expense not found" });

        _context.Expenses.Remove(expense);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Expense {Id} deleted by user {UserId}", id, userId);

        return Ok(new { message = "Expense deleted successfully" });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ExpenseDto>> GetExpense(Guid id)
    {
        var userId = GetUserId();
        var expense = await _context.Expenses
            .Include(e => e.Category)
            .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);
        if (expense == null) return NotFound(new { message = "Expense not found" });
        return Ok(MapToDto(expense));
    }

    /// <summary>
    /// Get monthly summary. Uses ToLower() for case-insensitive comparison (EF Core compatible).
    /// </summary>
    [HttpGet("summary")]
    public async Task<ActionResult<MonthlySummaryDto>> GetMonthlySummary([FromQuery] int year, [FromQuery] int month)
    {
        ValidateMonth(month);
        var userId = GetUserId();

        var monthExpenses = await _context.Expenses
            .Include(e => e.Category)
            .Where(e => e.UserId == userId && e.Date.Year == year && e.Date.Month == month)
            .ToListAsync();

        // Use ToLower() which EF Core can translate to SQL
        var totalIncome = monthExpenses
            .Where(e => e.Type.ToLower() == TransactionType.Income)
            .Sum(e => e.Amount);

        var totalExpenses = monthExpenses
            .Where(e => e.Type.ToLower() == TransactionType.Expense)
            .Sum(e => e.Amount);

        var categoryBreakdown = monthExpenses
            .Where(e => e.Type.ToLower() == TransactionType.Expense)
            .GroupBy(e => new { e.Category.Name, e.Category.Icon })
            .Select(g => new CategorySummaryDto
            {
                CategoryName = g.Key.Name,
                CategoryIcon = g.Key.Icon,
                CategoryType = TransactionType.Expense,
                TotalAmount = g.Sum(e => e.Amount),
                Percentage = totalExpenses > 0 ? (double)(g.Sum(e => e.Amount) / totalExpenses * 100) : 0,
                TransactionCount = g.Count()
            })
            .OrderByDescending(c => c.TotalAmount)
            .ToList();

        return Ok(new MonthlySummaryDto
        {
            Year = year,
            Month = month,
            MonthName = new DateTime(year, month, 1).ToString("MMMM"),
            TotalIncome = totalIncome,
            TotalExpenses = totalExpenses,
            NetSavings = totalIncome - totalExpenses,
            SavingsRate = totalIncome > 0 ? (double)((totalIncome - totalExpenses) / totalIncome * 100) : 0,
            TransactionCount = monthExpenses.Count,
            CategoryBreakdown = categoryBreakdown
        });
    }

    [HttpGet("yearly-overview")]
    public async Task<ActionResult<List<YearlyOverviewDto>>> GetYearlyOverview([FromQuery] int year)
    {
        var userId = GetUserId();
        var overview = await _context.Expenses
            .Where(e => e.UserId == userId && e.Date.Year == year)
            .GroupBy(e => e.Date.Month)
            .Select(g => new YearlyOverviewDto
            {
                Month = g.Key,
                MonthName = new DateTime(year, g.Key, 1).ToString("MMMM"),
                Income = g.Where(e => e.Type.ToLower() == TransactionType.Income).Sum(e => e.Amount),
                Expenses = g.Where(e => e.Type.ToLower() == TransactionType.Expense).Sum(e => e.Amount),
                NetSavings = g.Where(e => e.Type.ToLower() == TransactionType.Income).Sum(e => e.Amount) -
                             g.Where(e => e.Type.ToLower() == TransactionType.Expense).Sum(e => e.Amount),
                TransactionCount = g.Count()
            })
            .OrderBy(o => o.Month)
            .ToListAsync();
        return Ok(overview);
    }

    private static ExpenseDto MapToDto(Expense e) => new()
    {
        Id = e.Id,
        Amount = e.Amount,
        Description = e.Description,
        Date = e.Date,
        Type = e.Type,
        CategoryId = e.CategoryId,
        CategoryName = e.Category?.Name ?? "",
        CategoryType = e.Category?.Type ?? "",
        CategoryIcon = e.Category?.Icon,
        CreatedAt = e.CreatedAt,
        UpdatedAt = e.UpdatedAt
    };
}