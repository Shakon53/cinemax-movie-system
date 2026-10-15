using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieManagement.API.Data;
using MovieManagement.API.DTOs;
using MovieManagement.API.Models;

namespace MovieManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly MovieDbContext _context;
    public ReviewsController(MovieDbContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ReviewDto>>> GetReviews([FromQuery] int? movieId)
    {
        var query = _context.Reviews.Include(r => r.User).AsQueryable();
        if (movieId.HasValue) query = query.Where(r => r.MovieID == movieId.Value);
        var reviews = await query.OrderByDescending(r => r.ReviewDate).ToListAsync();
        return Ok(reviews.Select(r => new ReviewDto
        {
            ReviewID = r.ReviewID,
            Username = r.User?.Username ?? "Anonymous",
            CommentText = r.CommentText,
            UserRating = r.UserRating,
            ReviewDate = r.ReviewDate
        }));
    }

    [HttpPost, Authorize]
    public async Task<IActionResult> CreateReview([FromBody] CreateReviewDto dto)
    {
        var user = await _context.Users.FindAsync(int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!));
        if (user == null) return Unauthorized();
        if (string.IsNullOrWhiteSpace(dto.CommentText) || dto.CommentText.Length > 2000 || !double.IsFinite(dto.UserRating) || dto.UserRating < 1 || dto.UserRating > 10) return BadRequest(new { message = "Enter a review up to 2000 characters and a rating from 1 to 10." });
        if (!await _context.Movies.AnyAsync(m => m.MovieID == dto.MovieID)) return NotFound();

        var review = new Review
        {
            UserID = user.UserID,
            MovieID = dto.MovieID,
            CommentText = dto.CommentText,
            UserRating = dto.UserRating,
            ReviewDate = DateTime.UtcNow
        };
        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Review added successfully" });
    }

    [HttpDelete("{id}"), Authorize]
    public async Task<IActionResult> DeleteReview(int id)
    {
        var review = await _context.Reviews.FindAsync(id);
        if (review == null) return NotFound();
        if (!User.IsInRole("Admin") && review.UserID.ToString() != User.FindFirstValue(ClaimTypes.NameIdentifier)) return Forbid();
        _context.Reviews.Remove(review);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
