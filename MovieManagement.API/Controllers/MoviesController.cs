using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieManagement.API.Data;
using MovieManagement.API.DTOs;
using MovieManagement.API.Models;

namespace MovieManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MoviesController : ControllerBase
{
    private readonly MovieDbContext _context;

    public MoviesController(MovieDbContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MovieDto>>> GetMovies(
        [FromQuery] string? search,
        [FromQuery] int? genreId,
        [FromQuery] string? sortBy,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var query = _context.Movies
            .Include(m => m.Genre)
            .Include(m => m.Director)
            .Include(m => m.Country)
            .Include(m => m.MainActor)
            .Include(m => m.RatingInfo)
            .AsQueryable();

        if (!string.IsNullOrEmpty(search))
            query = query.Where(m => m.Title.Contains(search) || m.Description.Contains(search));

        if (genreId.HasValue)
            query = query.Where(m => m.GenreID == genreId.Value);

        query = sortBy switch
        {
            "rating" => query.OrderByDescending(m => m.Rating),
            "year" => query.OrderByDescending(m => m.ReleaseYear),
            "title" => query.OrderBy(m => m.Title),
            _ => query.OrderByDescending(m => m.Rating)
        };

        var total = await query.CountAsync();
        var movies = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        var result = movies.Select(m => new MovieDto
        {
            MovieID = m.MovieID,
            Title = m.Title,
            Description = m.Description,
            ReleaseYear = m.ReleaseYear,
            DurationMinutes = m.DurationMinutes,
            CountryName = m.Country?.CountryName ?? "",
            DirectorName = m.Director?.FullName ?? "",
            GenreName = m.Genre?.GenreName ?? "",
            MainActorName = m.MainActor?.FullName,
            Budget = m.Budget,
            BoxOffice = m.BoxOffice,
            Rating = m.Rating,
            DiscountPercent = m.DiscountPercent,
            LanguageName = m.LanguageName,
            AgeRestriction = m.AgeRestriction,
            ProductionCompany = m.ProductionCompany,
            SubtitleAvailable = m.SubtitleAvailable,
            Is3D = m.Is3D,
            PosterUrl = m.PosterUrl,
            IMDbRating = m.RatingInfo?.IMDbRating,
            RottenTomatoes = m.RatingInfo?.RottenTomatoes
        }).ToList();

        Response.Headers.Append("X-Total-Count", total.ToString());
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<MovieDto>> GetMovie(int id)
    {
        var m = await _context.Movies
            .Include(m => m.Genre)
            .Include(m => m.Director).ThenInclude(d => d!.Country)
            .Include(m => m.Country)
            .Include(m => m.MainActor).ThenInclude(a => a!.Country)
            .Include(m => m.RatingInfo)
            .Include(m => m.MovieActors).ThenInclude(ma => ma.Actor).ThenInclude(a => a!.Country)
            .Include(m => m.Reviews).ThenInclude(r => r.User)
            .Include(m => m.Discounts)
            .Include(m => m.BoxOfficeRecord)
            .FirstOrDefaultAsync(m => m.MovieID == id);

        if (m == null) return NotFound();

        var dto = new MovieDto
        {
            MovieID = m.MovieID,
            Title = m.Title,
            Description = m.Description,
            ReleaseYear = m.ReleaseYear,
            DurationMinutes = m.DurationMinutes,
            CountryName = m.Country?.CountryName ?? "",
            DirectorName = m.Director?.FullName ?? "",
            GenreName = m.Genre?.GenreName ?? "",
            MainActorName = m.MainActor?.FullName,
            Budget = m.Budget,
            BoxOffice = m.BoxOffice,
            Rating = m.Rating,
            DiscountPercent = m.DiscountPercent,
            LanguageName = m.LanguageName,
            AgeRestriction = m.AgeRestriction,
            ProductionCompany = m.ProductionCompany,
            SubtitleAvailable = m.SubtitleAvailable,
            Is3D = m.Is3D,
            PosterUrl = m.PosterUrl,
            IMDbRating = m.RatingInfo?.IMDbRating,
            RottenTomatoes = m.RatingInfo?.RottenTomatoes,
            Actors = m.MovieActors.Select(ma => new ActorDto
            {
                ActorID = ma.Actor!.ActorID,
                FullName = ma.Actor.FullName,
                Age = ma.Actor.Age,
                Gender = ma.Actor.Gender,
                CountryName = ma.Actor.Country?.CountryName ?? "",
                OscarAwards = ma.Actor.OscarAwards,
                Salary = ma.Actor.Salary,
                PhotoUrl = ma.Actor.PhotoUrl,
                RoleName = ma.RoleName
            }).ToList(),
            Reviews = m.Reviews.Select(r => new ReviewDto
            {
                ReviewID = r.ReviewID,
                Username = r.User?.Username ?? "Anonymous",
                CommentText = r.CommentText,
                UserRating = r.UserRating,
                ReviewDate = r.ReviewDate
            }).ToList()
        };

        return Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult<MovieDto>> CreateMovie([FromBody] CreateMovieDto dto)
    {
        var movie = new Movie
        {
            Title = dto.Title,
            Description = dto.Description,
            ReleaseYear = dto.ReleaseYear,
            DurationMinutes = dto.DurationMinutes,
            CountryID = dto.CountryID,
            DirectorID = dto.DirectorID,
            GenreID = dto.GenreID,
            MainActorID = dto.MainActorID,
            Budget = dto.Budget,
            BoxOffice = dto.BoxOffice,
            Rating = dto.Rating,
            DiscountPercent = dto.DiscountPercent,
            LanguageName = dto.LanguageName,
            AgeRestriction = dto.AgeRestriction,
            ProductionCompany = dto.ProductionCompany,
            SubtitleAvailable = dto.SubtitleAvailable,
            Is3D = dto.Is3D,
            PosterUrl = dto.PosterUrl
        };

        _context.Movies.Add(movie);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetMovie), new { id = movie.MovieID }, movie);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateMovie(int id, [FromBody] CreateMovieDto dto)
    {
        var movie = await _context.Movies.FindAsync(id);
        if (movie == null) return NotFound();

        movie.Title = dto.Title;
        movie.Description = dto.Description;
        movie.ReleaseYear = dto.ReleaseYear;
        movie.DurationMinutes = dto.DurationMinutes;
        movie.CountryID = dto.CountryID;
        movie.DirectorID = dto.DirectorID;
        movie.GenreID = dto.GenreID;
        movie.MainActorID = dto.MainActorID;
        movie.Budget = dto.Budget;
        movie.BoxOffice = dto.BoxOffice;
        movie.Rating = dto.Rating;
        movie.DiscountPercent = dto.DiscountPercent;
        movie.LanguageName = dto.LanguageName;
        movie.AgeRestriction = dto.AgeRestriction;
        movie.ProductionCompany = dto.ProductionCompany;
        movie.SubtitleAvailable = dto.SubtitleAvailable;
        movie.Is3D = dto.Is3D;
        movie.PosterUrl = dto.PosterUrl;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMovie(int id)
    {
        var movie = await _context.Movies.FindAsync(id);
        if (movie == null) return NotFound();
        _context.Movies.Remove(movie);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
