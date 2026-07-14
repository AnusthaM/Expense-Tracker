using System.ComponentModel.DataAnnotations;

namespace ExpenseTracker.DTOs;

/// <summary>
/// DTOs for category management operations.
/// Includes validation and data transformation logic.
/// </summary>

// Category response with expense count
public class CategoryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public string? Description { get; set; }
    public int ExpenseCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

// Create category request with validation
public class CreateCategoryDto
{
    [Required(ErrorMessage = "Category name is required")]
    [MaxLength(100, ErrorMessage = "Name cannot exceed 100 characters")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Category type is required")]
    [RegularExpression("^(income|expense)$", ErrorMessage = "Type must be 'income' or 'expense'")]
    public string Type { get; set; } = "expense";

    [MaxLength(20)]
    public string? Icon { get; set; }

    [MaxLength(500)]
    public string? Description { get; set; }
}

// Update category request
public class UpdateCategoryDto
{
    [Required(ErrorMessage = "Category name is required")]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [RegularExpression("^(income|expense)$")]
    public string Type { get; set; } = "expense";

    [MaxLength(20)]
    public string? Icon { get; set; }

    [MaxLength(500)]
    public string? Description { get; set; }
}