using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ExpenseTracker.Data;
using ExpenseTracker.Models;
using ExpenseTracker.Constants;
using ExpenseTracker.DTOs;

namespace ExpenseTracker.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : BaseController
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthController> _logger;

    public AuthController(AppDbContext context, IConfiguration configuration, ILogger<AuthController> logger)
    {
        _context = context;
        _configuration = configuration;
        _logger = logger;
    }

   // Register new user. Sets httpOnly auth cookie on success.
    [HttpPost("register")]
    public async Task<ActionResult<UserDto>> Register([FromBody] RegisterRequestDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email.ToLower().Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FullName = request.FullName.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        var defaultCategories = DefaultCategories.GetForUser(user.Id);
        _context.Categories.AddRange(defaultCategories);

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (ex.InnerException?.Message.Contains("IX_Users_Email") == true)
        {
            return Conflict(new { message = "Email already registered" });
        }

        _logger.LogInformation("User {UserId} registered successfully", user.Id);

        SetAuthCookie(user);

        return Ok(new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            CreatedAt = user.CreatedAt
        });
    }

    // Login user. Sets httpOnly auth cookie on success.
    
    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login([FromBody] LoginRequestDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email.ToLower().Trim());

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid email or password" });

        _logger.LogInformation("User {UserId} logged in", user.Id);

        SetAuthCookie(user);

        return Ok(new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            CreatedAt = user.CreatedAt
        });
    }

    // Logout - clears the auth cookie.
    [HttpPost("logout")]
    public ActionResult Logout()
    {
        Response.Cookies.Delete("auth_token", new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Path = "/"
        });

        return Ok(new { message = "Logged out successfully" });
    }

    /// <summary>
    /// Validates the current session and returns user info.
    /// Requires authentication - token comes from cookie.
    /// </summary>
    [HttpGet("me")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        var userId = GetUserId();
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        return Ok(new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            CreatedAt = user.CreatedAt
        });
    }
    // Creates JWT and sets it as httpOnly, Secure, SameSite Strict cookie.
    private void SetAuthCookie(User user)
    {
        var jwtKey = _configuration["Jwt:Key"]
            ?? Environment.GetEnvironmentVariable("JWT_SECRET_KEY")
            ?? throw new InvalidOperationException("JWT key not configured");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.FullName)
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: credentials
        );

        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

        // Set httpOnly cookie - inaccessible to JavaScript
        Response.Cookies.Append("auth_token", tokenString, new CookieOptions
        {
            HttpOnly = true,       // Not accessible via JavaScript
            Secure = true,         // Only sent over HTTPS
            SameSite = SameSiteMode.Strict, // CSRF protection
            Expires = DateTime.UtcNow.AddDays(7),
            Path = "/"
        });
    }
}