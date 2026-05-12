using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieManagement.API.Data;

namespace MovieManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DirectorsController : ControllerBase
{
    private readonly MovieDbContext _context;
    public DirectorsController(MovieDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetDirectors()
    {
        var directors = await _context.Directors.Include(d => d.Country).ToListAsync();
        return Ok(directors.Select(d => new { d.DirectorID, d.FullName, d.ExperienceYears, d.AwardsCount, Country = d.Country?.CountryName }));
    }
}
