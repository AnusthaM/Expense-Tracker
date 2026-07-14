using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ExpenseTracker.Data;
using ExpenseTracker.Models;
using ExpenseTracker.DTOs;

namespace ExpenseTracker.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CategoriesController : BaseController
{
    private readonly AppDbContext _context;

    public CategoriesController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<List<CategoryDto>>> GetCategories()
    {
        var userId = GetUserId();
        var categories = await _context.Categories
            .Where(c => c.UserId == userId)
            .OrderBy(c => c.Type).ThenBy(c => c.Name)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Type = c.Type,
                Icon = c.Icon,
                Description = c.Description,
                ExpenseCount = c.Expenses.Count,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync();
        return Ok(categories);
    }

    [HttpPost]
    public async Task<ActionResult<CategoryDto>> CreateCategory([FromBody] CreateCategoryDto request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var userId = GetUserId();
        if (await _context.Categories.AnyAsync(c => c.UserId == userId && c.Name == request.Name))
            return BadRequest(new { message = "Category name already exists" });

        var category = new Category
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Type = request.Type,
            Icon = request.Icon,
            Description = request.Description,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Type = category.Type,
            Icon = category.Icon,
            Description = category.Description,
            ExpenseCount = 0,
            CreatedAt = category.CreatedAt
        });
    }

    // Update category. If type changed, syncs all expenses under this category.
    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateCategory(Guid id, [FromBody] UpdateCategoryDto request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var userId = GetUserId();
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);
        if (category == null) return NotFound(new { message = "Category not found" });

        if (await _context.Categories.AnyAsync(c => c.UserId == userId && c.Name == request.Name && c.Id != id))
            return BadRequest(new { message = "Category name already exists" });

        var oldType = category.Type;
        category.Name = request.Name;
        category.Type = request.Type;
        category.Icon = request.Icon;
        category.Description = request.Description;

        // If category type changed, update all expenses under this category
        if (oldType != request.Type)
        {
            await _context.Expenses
                .Where(e => e.CategoryId == id && e.UserId == userId)
                .ExecuteUpdateAsync(s => s.SetProperty(e => e.Type, request.Type));
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Category updated successfully" });
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteCategory(Guid id)
    {
        var userId = GetUserId();
        var category = await _context.Categories
            .Include(c => c.Expenses)
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);
        if (category == null) return NotFound(new { message = "Category not found" });
        if (category.Expenses.Any())
            return BadRequest(new { message = "Cannot delete category with existing expenses" });

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Category deleted successfully" });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CategoryDto>> GetCategory(Guid id)
    {
        var userId = GetUserId();
        var category = await _context.Categories
            .Include(c => c.Expenses)
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);
        if (category == null) return NotFound(new { message = "Category not found" });

        return Ok(new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Type = category.Type,
            Icon = category.Icon,
            Description = category.Description,
            ExpenseCount = category.Expenses.Count,
            CreatedAt = category.CreatedAt
        });
    }
}