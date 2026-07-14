using ExpenseTracker.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpenseTracker.Models;

/// <summary>
/// Expense/Income category for organizing transactions.
/// Examples: Food, Transport, Salary, Entertainment.
/// Green for income categories, Rose for expense categories.
/// </summary>
public class Category
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Name { get; set; } = string.Empty;

    // "income" or "expense" - determines color coding in frontend
    public string Type { get; set; } = "expense";

    // Icon identifier for UI (uses Lucide icons)
    public string? Icon { get; set; }

    public string? Description { get; set; }

    // Foreign key to User
    public Guid UserId { get; set; }

    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // One category can have many expenses
    public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
}