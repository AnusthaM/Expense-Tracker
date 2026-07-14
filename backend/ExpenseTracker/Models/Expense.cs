using ExpenseTracker.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpenseTracker.Models;
/// <summary>
/// Core transaction entity representing income or expense.
/// Connected to Category for grouping and User for ownership.
/// Supports full CRUD operations with validation.
/// </summary>
public class Expense
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    [Range(0.01, double.MaxValue)]
    public decimal Amount { get; set; }

    [Required]
    [MaxLength(200)]
    public string Description { get; set; } = string.Empty;

    [Required]
    public DateTime Date { get; set; } = DateTime.UtcNow;

    // Type directly on expense for easier filtering
    [Required]
    [MaxLength(10)]
    public string Type { get; set; } = "expense"; // "income" or "expense"

    // Foreign key to Category
    public Guid CategoryId { get; set; }

    [ForeignKey(nameof(CategoryId))]
    public Category Category { get; set; } = null!;

    // Foreign key to User
    public Guid UserId { get; set; }

    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}