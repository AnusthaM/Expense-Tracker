using System.Net;
using System.Text.Json;

namespace ExpenseTracker.Middleware;

/// <summary>
/// Global exception handling middleware.
/// Catches unhandled exceptions, logs them, and returns a clean 500 response.
/// Prevents raw stack traces from leaking to clients.
/// </summary>
public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (ArgumentException ex)
        {
            // Validation errors - return 400
            _logger.LogWarning(ex, "Validation error");
            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(JsonSerializer.Serialize(new { message = ex.Message }));
        }
        catch (Exception ex)
        {
            // Unexpected errors - return 500
            _logger.LogError(ex, "Unhandled exception occurred");
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(JsonSerializer.Serialize(new
            {
                message = "An unexpected error occurred. Please try again later."
            }));
        }
    }
}