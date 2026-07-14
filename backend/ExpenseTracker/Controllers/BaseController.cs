using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using ExpenseTracker.Constants;

namespace ExpenseTracker.Controllers;

/// <summary>
/// Base controller with shared helpers for all authenticated controllers.
/// Eliminates copy-pasted GetUserId() and validation logic.
/// </summary>
[ApiController]
public abstract class BaseController : ControllerBase
{
    //Extracts the authenticated user's ID from JWT claims.
    protected Guid GetUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(claim))
            throw new UnauthorizedAccessException("User ID not found in token");
        return Guid.Parse(claim);
    }

    // Validates pagination parameters and throws ArgumentException if invalid.
    protected void ValidatePagination(int page, int pageSize)
    {
        if (page < ValidationConstants.MinPage)
            throw new ArgumentException($"Page must be at least {ValidationConstants.MinPage}");
        if (pageSize < 1 || pageSize > ValidationConstants.MaxPageSize)
            throw new ArgumentException($"PageSize must be between 1 and {ValidationConstants.MaxPageSize}");
    }

    /// Validates month parameter (1-12).
    protected void ValidateMonth(int month)
    {
        if (month < ValidationConstants.MinMonth || month > ValidationConstants.MaxMonth)
            throw new ArgumentException($"Month must be between {ValidationConstants.MinMonth} and {ValidationConstants.MaxMonth}");
    }

    /// Returns a standardized error response.
    protected ActionResult Error(string message, int statusCode = 400)
    {
        return StatusCode(statusCode, new { message });
    }
}