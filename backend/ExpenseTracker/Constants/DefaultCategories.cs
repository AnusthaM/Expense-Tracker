using ExpenseTracker.Models;

namespace ExpenseTracker.Constants;

/// <summary>
/// Single source of truth for default categories assigned to new users.
/// Used by AuthController only - no duplicate lists anywhere.
/// </summary>
public static class DefaultCategories
{
    public static List<Category> GetForUser(Guid userId) => new()
    {
        new() { Id = Guid.NewGuid(), Name = "Salary", Type = TransactionType.Income, Icon = "Briefcase", UserId = userId, CreatedAt = DateTime.UtcNow },
        new() { Id = Guid.NewGuid(), Name = "Freelance", Type = TransactionType.Income, Icon = "Laptop", UserId = userId, CreatedAt = DateTime.UtcNow },
        new() { Id = Guid.NewGuid(), Name = "Investments", Type = TransactionType.Income, Icon = "TrendingUp", UserId = userId, CreatedAt = DateTime.UtcNow },
        new() { Id = Guid.NewGuid(), Name = "Gifts", Type = TransactionType.Income, Icon = "Gift", UserId = userId, CreatedAt = DateTime.UtcNow },
        new() { Id = Guid.NewGuid(), Name = "Food & Dining", Type = TransactionType.Expense, Icon = "UtensilsCrossed", UserId = userId, CreatedAt = DateTime.UtcNow },
        new() { Id = Guid.NewGuid(), Name = "Transportation", Type = TransactionType.Expense, Icon = "Car", UserId = userId, CreatedAt = DateTime.UtcNow },
        new() { Id = Guid.NewGuid(), Name = "Shopping", Type = TransactionType.Expense, Icon = "ShoppingBag", UserId = userId, CreatedAt = DateTime.UtcNow },
        new() { Id = Guid.NewGuid(), Name = "Entertainment", Type = TransactionType.Expense, Icon = "Film", UserId = userId, CreatedAt = DateTime.UtcNow },
        new() { Id = Guid.NewGuid(), Name = "Utilities", Type = TransactionType.Expense, Icon = "Zap", UserId = userId, CreatedAt = DateTime.UtcNow },
        new() { Id = Guid.NewGuid(), Name = "Healthcare", Type = TransactionType.Expense, Icon = "Heart", UserId = userId, CreatedAt = DateTime.UtcNow },
        new() { Id = Guid.NewGuid(), Name = "Education", Type = TransactionType.Expense, Icon = "BookOpen", UserId = userId, CreatedAt = DateTime.UtcNow },
        new() { Id = Guid.NewGuid(), Name = "Housing", Type = TransactionType.Expense, Icon = "Home", UserId = userId, CreatedAt = DateTime.UtcNow },
        new() { Id = Guid.NewGuid(), Name = "Subscriptions", Type = TransactionType.Expense, Icon = "CreditCard", UserId = userId, CreatedAt = DateTime.UtcNow },
    };
}