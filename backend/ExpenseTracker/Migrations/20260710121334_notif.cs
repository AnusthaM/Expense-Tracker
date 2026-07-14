using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ExpenseTracker.Migrations
{
    /// <inheritdoc />
    public partial class notif : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "Expenses",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_Type",
                table: "Expenses",
                column: "Type");

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_UserId_Type",
                table: "Expenses",
                columns: new[] { "UserId", "Type" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Expenses_Type",
                table: "Expenses");

            migrationBuilder.DropIndex(
                name: "IX_Expenses_UserId_Type",
                table: "Expenses");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Expenses");
        }
    }
}
