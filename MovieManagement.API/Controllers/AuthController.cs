using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieManagement.API.Data;
using MovieManagement.API.Models;
using System.Security.Cryptography;
using System.Text;

namespace MovieManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly MovieDbContext _context;
    private readonly PasswordHasher<User> _hasher = new();
    private readonly IConfiguration _config;
    public AuthController(MovieDbContext context, IConfiguration config) { _context = context; _config = config; }

    [HttpPost("register"), EnableRateLimiting("auth")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Username) || string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest(new { message = "Username, email and password are required." });

        dto = dto with { Email = dto.Email.Trim().ToLowerInvariant(), Username = dto.Username.Trim() };
        if (dto.Username.Length < 3 || dto.Username.Any(c => !char.IsLetterOrDigit(c) && c != '_' && c != '-')) return BadRequest(new { message = "Use 3-40 letters, numbers, _ or - for your username." });
        if (string.Equals(dto.Email, _config["Admin:Email"], StringComparison.OrdinalIgnoreCase)) return BadRequest(new { message = "This email is reserved." });
        if (await _context.Users.AnyAsync(u => u.Email.ToLower() == dto.Email))
            return Conflict(new { message = "Email already registered." });

        if (await _context.Users.AnyAsync(u => u.Username.ToLower() == dto.Username.ToLower()))
            return Conflict(new { message = "Username already taken." });

        var user = new User
        {
            Username = dto.Username,
            Email = dto.Email,
            PasswordHash = string.Empty,
            CountryID = await _context.Countries.OrderBy(c => c.CountryID).Select(c => c.CountryID).FirstAsync(),
            RegistrationDate = DateTime.UtcNow
        };

        user.PasswordHash = _hasher.HashPassword(user, dto.Password);
        _context.Users.Add(user);
        try { await _context.SaveChangesAsync(); }
        catch (DbUpdateException ex) when (ex.InnerException is Npgsql.PostgresException { SqlState: "23505" }) { return Conflict(new { message = "Email or username already registered." }); }

        return await SignInUser(user);
    }

    [HttpPost("login"), EnableRateLimiting("auth")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest(new { message = "Email and password are required." });

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.Trim().ToLowerInvariant());
        if (user == null)
            return Unauthorized(new { message = "Invalid email or password." });

        if (string.IsNullOrEmpty(user.PasswordHash))
            return Unauthorized(new { message = "Invalid email or password." });
        var legacy = user.PasswordHash.Length == 64 && user.PasswordHash.All(Uri.IsHexDigit);
        bool valid;
        try { valid = legacy ? CryptographicOperations.FixedTimeEquals(Convert.FromHexString(user.PasswordHash), SHA256.HashData(Encoding.UTF8.GetBytes(dto.Password))) : _hasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password) != PasswordVerificationResult.Failed; }
        catch (FormatException) { valid = false; }
        if (!valid) return Unauthorized(new { message = "Invalid email or password." });
        if (legacy) { user.PasswordHash = _hasher.HashPassword(user, dto.Password); await _context.SaveChangesAsync(); }

        return await SignInUser(user);
    }

    private async Task<IActionResult> SignInUser(User user)
    {
        var role = string.Equals(user.Email, _config["Admin:Email"], StringComparison.OrdinalIgnoreCase) ? "Admin" : "User";
        var claims = new[] { new Claim(ClaimTypes.NameIdentifier, user.UserID.ToString()), new Claim(ClaimTypes.Name, user.Username), new Claim(ClaimTypes.Email, user.Email), new Claim(ClaimTypes.Role, role) };
        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme)));
        return Ok(new { userID = user.UserID, username = user.Username, email = user.Email, role });
    }

    [Authorize, HttpGet("me")]
    public IActionResult Me() => Ok(new { userID = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!), username = User.Identity!.Name, email = User.FindFirstValue(ClaimTypes.Email), role = User.IsInRole("Admin") ? "Admin" : "User" });

    [HttpPost("logout")]
    public async Task<IActionResult> Logout() { await HttpContext.SignOutAsync(); return NoContent(); }

    [Authorize(Roles = "Admin"), HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _context.Users
            .Select(u => new { u.UserID, u.Username, u.Email, u.RegistrationDate,
                               ReviewCount = u.Reviews.Count })
            .OrderByDescending(u => u.RegistrationDate)
            .ToListAsync();
        return Ok(users);
    }

    [Authorize(Roles = "Admin"), HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();
        if (User.FindFirstValue(ClaimTypes.NameIdentifier) == id.ToString()) return BadRequest(new { message = "You cannot delete your current account here." });
        _context.Reviews.RemoveRange(_context.Reviews.Where(r => r.UserID == id));
        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

public record RegisterDto([Required, StringLength(40, MinimumLength = 3)] string Username, [Required, EmailAddress, StringLength(254)] string Email, [Required, StringLength(128, MinimumLength = 10)] string Password);
public record LoginDto([Required, EmailAddress, StringLength(254)] string Email, [Required, StringLength(128)] string Password);
