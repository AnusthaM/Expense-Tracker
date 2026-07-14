using System.ComponentModel.DataAnnotations;

namespace ExpenseTracker.Models;

/// <summary>
/// Represents a registered user of the expense tracker.
/// Core entity for authentication and data ownership.
/// </summary>
public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties - all expenses and categories belong to this user
    public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
    public ICollection<Category> Categories { get; set; } = new List<Category>();
}