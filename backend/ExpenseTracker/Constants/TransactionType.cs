namespace ExpenseTracker.Constants;

/// <summary>
/// Centralized constants for transaction types.
/// Eliminates magic strings throughout the codebase.
/// </summary>
public static class TransactionType
{
    public const string Income = "income";
    public const string Expense = "expense";

    public static readonly string[] All = { Income, Expense };

    public static bool IsValid(string type) =>
        !string.IsNullOrEmpty(type) && All.Contains(type.ToLower());
}

/// <summary>
/// Validation constants for query parameters.
/// </summary>
public static class ValidationConstants
{
    public const int MinPage = 1;
    public const int MaxPageSize = 100;
    public const int DefaultPageSize = 20;
    public const int MinMonth = 1;
    public const int MaxMonth = 12;
}