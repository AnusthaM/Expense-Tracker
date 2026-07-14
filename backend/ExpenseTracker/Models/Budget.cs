using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpenseTracker.Models;

public class Budget
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    [Range(0.01, double.MaxValue)]
    public decimal Amount { get; set; }

    public int Month { get; set; }

    public int Year { get; set; }

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