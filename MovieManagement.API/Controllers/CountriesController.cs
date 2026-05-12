using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieManagement.API.Data;

namespace MovieManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CountriesController : ControllerBase
{
    private readonly MovieDbContext _context;
    public CountriesController(MovieDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetCountries()
    {
        return Ok(await _context.Countries.ToListAsync());
    }
}
