using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieManagement.API.Data;

namespace MovieManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GenresController : ControllerBase
{
    private readonly MovieDbContext _context;
    public GenresController(MovieDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetGenres()
    {
        var genres = await _context.Genres.ToListAsync();
        return Ok(genres);
    }
}
