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
    public AuthController(MovieDbContext context) => _context = context;

    private static string HashPassword(string password)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password));
        return Convert.ToHexString(bytes).ToLower();
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Username) || string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest(new { message = "Username, email and password are required." });

        if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            return Conflict(new { message = "Email already registered." });

        if (await _context.Users.AnyAsync(u => u.Username == dto.Username))
            return Conflict(new { message = "Username already taken." });

        var user = new User
        {
            Username = dto.Username,
            Email = dto.Email,
            PasswordHash = HashPassword(dto.Password),
            CountryID = 1,
            RegistrationDate = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new { userID = user.UserID, username = user.Username, email = user.Email });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest(new { message = "Email and password are required." });

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (user == null)
            return Unauthorized(new { message = "Invalid email or password." });

        if (string.IsNullOrEmpty(user.PasswordHash))
        {
            user.PasswordHash = HashPassword(dto.Password);
            await _context.SaveChangesAsync();
            return Ok(new { userID = user.UserID, username = user.Username, email = user.Email });
        }

        if (user.PasswordHash != HashPassword(dto.Password))
            return Unauthorized(new { message = "Invalid email or password." });

        return Ok(new { userID = user.UserID, username = user.Username, email = user.Email });
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _context.Users
            .Select(u => new { u.UserID, u.Username, u.Email, u.RegistrationDate,
                               ReviewCount = u.Reviews.Count })
            .OrderByDescending(u => u.RegistrationDate)
            .ToListAsync();
        return Ok(users);
    }

    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();
        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

public record RegisterDto(string Username, string Email, string Password);
public record LoginDto(string Email, string Password);
