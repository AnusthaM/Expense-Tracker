using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ExpenseTracker.Migrations
{
    /// <inheritdoc />
    public partial class update : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Budgets_UserId_CategoryId_Year_Month",
                table: "Budgets");

            migrationBuilder.CreateIndex(
                name: "IX_Budgets_UserId_Year_Month_CategoryId",
                table: "Budgets",
                columns: new[] { "UserId", "Year", "Month", "CategoryId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Budgets_UserId_Year_Month_CategoryId",
                table: "Budgets");

            migrationBuilder.CreateIndex(
                name: "IX_Budgets_UserId_CategoryId_Year_Month",
                table: "Budgets",
                columns: new[] { "UserId", "CategoryId", "Year", "Month" },
                unique: true);
        }
    }
}
