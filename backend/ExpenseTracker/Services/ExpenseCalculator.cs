using Microsoft.EntityFrameworkCore;
using ExpenseTracker.Data;
using ExpenseTracker.Constants;

namespace ExpenseTracker.Services;

public interface IExpenseCalculator
{
    decimal CalculateSpent(Guid userId, Guid categoryId, int year, int month);
    Task<decimal> CalculateSpentAsync(Guid userId, Guid categoryId, int year, int month);
}

public class ExpenseCalculator : IExpenseCalculator
{
    private readonly AppDbContext _context;

    public ExpenseCalculator(AppDbContext context)
    {
        _context = context;
    }

    public decimal CalculateSpent(Guid userId, Guid categoryId, int year, int month)
    {
        return _context.Expenses
            .Where(e => e.CategoryId == categoryId
                   && e.UserId == userId
                   && e.Type.ToLower() == TransactionType.Expense
                   && e.Date.Year == year
                   && e.Date.Month == month)
            .Sum(e => e.Amount);
    }

    public async Task<decimal> CalculateSpentAsync(Guid userId, Guid categoryId, int year, int month)
    {
        return await _context.Expenses
            .Where(e => e.CategoryId == categoryId
                   && e.UserId == userId
                   && e.Type.ToLower() == TransactionType.Expense
                   && e.Date.Year == year
                   && e.Date.Month == month)
            .SumAsync(e => e.Amount);
    }
}