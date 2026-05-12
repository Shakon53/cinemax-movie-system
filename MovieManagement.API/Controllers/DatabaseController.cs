using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieManagement.API.Data;

namespace MovieManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DatabaseController : ControllerBase
{
    private readonly MovieDbContext _context;
    public DatabaseController(MovieDbContext context) => _context = context;

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _context.Users
            .Include(u => u.Country)
            .Select(u => new {
                u.UserID, u.Username, u.Email, u.PasswordHash,
                Country = u.Country != null ? u.Country.CountryName : "",
                u.RegistrationDate,
                ReviewCount = u.Reviews.Count
            })
            .OrderBy(u => u.UserID)
            .ToListAsync();
        return Ok(users);
    }

    [HttpGet("countries")]
    public async Task<IActionResult> GetCountries()
        => Ok(await _context.Countries.OrderBy(c => c.CountryID).ToListAsync());

    [HttpGet("genres")]
    public async Task<IActionResult> GetGenres()
        => Ok(await _context.Genres.OrderBy(g => g.GenreID).ToListAsync());

    [HttpGet("directors")]
    public async Task<IActionResult> GetDirectors()
    {
        var dirs = await _context.Directors.Include(d => d.Country)
            .OrderBy(d => d.DirectorID).ToListAsync();
        return Ok(dirs.Select(d => new {
            d.DirectorID, d.FullName, d.ExperienceYears, d.AwardsCount,
            Country = d.Country != null ? d.Country.CountryName : ""
        }));
    }

    [HttpGet("actors")]
    public async Task<IActionResult> GetActors()
    {
        var actors = await _context.Actors.Include(a => a.Country)
            .OrderBy(a => a.ActorID).ToListAsync();
        return Ok(actors.Select(a => new {
            a.ActorID, a.FullName, a.Age, a.Gender, a.OscarAwards, a.Salary,
            Country = a.Country != null ? a.Country.CountryName : "",
            a.PhotoUrl
        }));
    }

    [HttpGet("movies")]
    public async Task<IActionResult> GetMovies()
    {
        var movies = await _context.Movies
            .Include(m => m.Genre).Include(m => m.Director).Include(m => m.Country)
            .OrderBy(m => m.MovieID).ToListAsync();
        return Ok(movies.Select(m => new {
            m.MovieID, m.Title, m.ReleaseYear, m.DurationMinutes, m.Rating,
            Genre = m.Genre != null ? m.Genre.GenreName : "",
            Director = m.Director != null ? m.Director.FullName : "",
            Country = m.Country != null ? m.Country.CountryName : "",
            m.Budget, m.BoxOffice, m.DiscountPercent, m.LanguageName,
            m.AgeRestriction, m.Is3D, m.SubtitleAvailable, m.ProductionCompany, m.PosterUrl
        }));
    }

    [HttpGet("movieactors")]
    public async Task<IActionResult> GetMovieActors()
    {
        var ma = await _context.MovieActors
            .Include(x => x.Movie).Include(x => x.Actor)
            .OrderBy(x => x.MovieID).ToListAsync();
        return Ok(ma.Select(x => new {
            x.MovieActorID, x.MovieID,
            Movie = x.Movie != null ? x.Movie.Title : "",
            x.ActorID,
            Actor = x.Actor != null ? x.Actor.FullName : "",
            x.RoleName, x.ScreenTimeMinutes
        }));
    }

    [HttpGet("reviews")]
    public async Task<IActionResult> GetReviews()
    {
        var reviews = await _context.Reviews
            .Include(r => r.User).Include(r => r.Movie)
            .OrderBy(r => r.ReviewID).ToListAsync();
        return Ok(reviews.Select(r => new {
            r.ReviewID,
            User = r.User != null ? r.User.Username : "Anonymous",
            Movie = r.Movie != null ? r.Movie.Title : "",
            r.CommentText, r.UserRating, r.ReviewDate
        }));
    }

    [HttpGet("ratings")]
    public async Task<IActionResult> GetRatings()
    {
        var ratings = await _context.Ratings
            .Include(r => r.Movie)
            .OrderBy(r => r.RatingID).ToListAsync();
        return Ok(ratings.Select(r => new {
            r.RatingID,
            Movie = r.Movie != null ? r.Movie.Title : "",
            r.IMDbRating, r.RottenTomatoes, r.Metacritic, r.ReviewCount
        }));
    }

    [HttpGet("discounts")]
    public async Task<IActionResult> GetDiscounts()
    {
        var discounts = await _context.Discounts
            .Include(d => d.Movie)
            .OrderBy(d => d.DiscountID).ToListAsync();
        return Ok(discounts.Select(d => new {
            d.DiscountID,
            Movie = d.Movie != null ? d.Movie.Title : "",
            d.DiscountName, d.DiscountPercent, d.StartDate, d.EndDate
        }));
    }

    [HttpGet("boxoffice")]
    public async Task<IActionResult> GetBoxOffice()
    {
        var records = await _context.BoxOfficeRecords
            .Include(b => b.Movie)
            .OrderBy(b => b.BoxOfficeID).ToListAsync();
        return Ok(records.Select(b => new {
            b.BoxOfficeID,
            Movie = b.Movie != null ? b.Movie.Title : "",
            b.OpeningWeekend, b.WorldwideGross, b.TicketsSold
        }));
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        return Ok(new {
            Users = await _context.Users.CountAsync(),
            Countries = await _context.Countries.CountAsync(),
            Genres = await _context.Genres.CountAsync(),
            Directors = await _context.Directors.CountAsync(),
            Actors = await _context.Actors.CountAsync(),
            Movies = await _context.Movies.CountAsync(),
            MovieActors = await _context.MovieActors.CountAsync(),
            Reviews = await _context.Reviews.CountAsync(),
            Ratings = await _context.Ratings.CountAsync(),
            Discounts = await _context.Discounts.CountAsync(),
            BoxOfficeRecords = await _context.BoxOfficeRecords.CountAsync()
        });
    }
}
