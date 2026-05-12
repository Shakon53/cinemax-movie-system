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

    [HttpPost]
    public async Task<IActionResult> CreateReview([FromBody] CreateReviewDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (user == null)
        {
            user = new User { Username = dto.Username, Email = dto.Email, CountryID = 1, RegistrationDate = DateTime.Now };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }

        var review = new Review
        {
            UserID = user.UserID,
            MovieID = dto.MovieID,
            CommentText = dto.CommentText,
            UserRating = dto.UserRating,
            ReviewDate = DateTime.Now
        };
        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Review added successfully" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteReview(int id)
    {
        var review = await _context.Reviews.FindAsync(id);
        if (review == null) return NotFound();
        _context.Reviews.Remove(review);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
