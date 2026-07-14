using Microsoft.EntityFrameworkCore;
using ExpenseTracker.Models;

namespace ExpenseTracker.Data;

// Main database context for the expense tracker.
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<Budget> Budgets => Set<Budget>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.Email).IsRequired().HasMaxLength(100);
            entity.Property(u => u.FullName).IsRequired().HasMaxLength(100);
            entity.Property(u => u.PasswordHash).IsRequired();
        });

        // Category
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasIndex(c => new { c.UserId, c.Name }).IsUnique();
            entity.Property(c => c.Name).IsRequired().HasMaxLength(100);
            entity.Property(c => c.Type).IsRequired().HasMaxLength(50);

            entity.HasOne(c => c.User)
                  .WithMany(u => u.Categories)
                  .HasForeignKey(c => c.UserId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Expense
        modelBuilder.Entity<Expense>(entity =>
        {
            entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Description).HasMaxLength(200);
            entity.Property(e => e.Type).IsRequired().HasMaxLength(10);

            entity.HasIndex(e => e.Date);
            entity.HasIndex(e => e.Type);
            entity.HasIndex(e => new { e.UserId, e.Date });
            entity.HasIndex(e => new { e.UserId, e.Type });

            entity.HasOne(e => e.Category)
                  .WithMany(c => c.Expenses)
                  .HasForeignKey(e => e.CategoryId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.User)
                  .WithMany(u => u.Expenses)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Budget - Fixed index order to match query pattern
        modelBuilder.Entity<Budget>(entity =>
        {
            entity.Property(b => b.Amount).HasColumnType("decimal(18,2)");

            // Index matches query: WHERE UserId, Year, Month (then CategoryId for uniqueness)
            entity.HasIndex(b => new { b.UserId, b.Year, b.Month, b.CategoryId }).IsUnique();

            entity.HasOne(b => b.Category)
                  .WithMany()
                  .HasForeignKey(b => b.CategoryId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(b => b.User)
                  .WithMany()
                  .HasForeignKey(b => b.UserId)
                  .OnDelete(DeleteBehavior.Restrict);
        });
    }
}