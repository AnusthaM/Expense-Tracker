using Microsoft.EntityFrameworkCore.Migrations;

namespace ExpenseTracker.Migrations;

/// <summary>
/// Backfills empty Expense.Type values from parent Category.Type,
/// and adds CHECK constraints for data integrity.
/// </summary>
public partial class BackfillExpenseType : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Backfill empty Type values from parent category
        migrationBuilder.Sql(@"
            UPDATE e
            SET e.Type = c.Type
            FROM Expenses e
            INNER JOIN Categories c ON e.CategoryId = c.Id
            WHERE e.Type = '' OR e.Type IS NULL
        ");

        // Add CHECK constraint for Expense Type
        migrationBuilder.Sql(@"
            ALTER TABLE Expenses 
            ADD CONSTRAINT CK_Expenses_Type 
            CHECK (Type IN ('income', 'expense'))
        ");

        // Add CHECK constraint for Budget Month
        migrationBuilder.Sql(@"
            ALTER TABLE Budgets 
            ADD CONSTRAINT CK_Budgets_Month 
            CHECK (Month >= 1 AND Month <= 12)
        ");

        // Add CHECK constraint for Category Type
        migrationBuilder.Sql(@"
            ALTER TABLE Categories 
            ADD CONSTRAINT CK_Categories_Type 
            CHECK (Type IN ('income', 'expense'))
        ");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("ALTER TABLE Expenses DROP CONSTRAINT IF EXISTS CK_Expenses_Type");
        migrationBuilder.Sql("ALTER TABLE Budgets DROP CONSTRAINT IF EXISTS CK_Budgets_Month");
        migrationBuilder.Sql("ALTER TABLE Categories DROP CONSTRAINT IF EXISTS CK_Categories_Type");
    }
}