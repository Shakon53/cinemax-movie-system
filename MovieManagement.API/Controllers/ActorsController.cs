using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieManagement.API.Data;
using MovieManagement.API.DTOs;
using MovieManagement.API.Models;

namespace MovieManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ActorsController : ControllerBase
{
    private readonly MovieDbContext _context;
    public ActorsController(MovieDbContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ActorDto>>> GetActors()
    {
        var actors = await _context.Actors
            .Include(a => a.Country)
            .ToListAsync();

        return Ok(actors.Select(a => new ActorDto
        {
            ActorID = a.ActorID,
            FullName = a.FullName,
            Age = a.Age,
            Gender = a.Gender,
            CountryName = a.Country?.CountryName ?? "",
            OscarAwards = a.OscarAwards,
            Salary = a.Salary,
            PhotoUrl = a.PhotoUrl
        }));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ActorDto>> GetActor(int id)
    {
        var a = await _context.Actors.Include(x => x.Country).FirstOrDefaultAsync(x => x.ActorID == id);
        if (a == null) return NotFound();
        return Ok(new ActorDto
        {
            ActorID = a.ActorID, FullName = a.FullName, Age = a.Age, Gender = a.Gender,
            CountryName = a.Country?.CountryName ?? "", OscarAwards = a.OscarAwards,
            Salary = a.Salary, PhotoUrl = a.PhotoUrl
        });
    }

    [HttpPost]
    public async Task<ActionResult> CreateActor([FromBody] CreateActorDto dto)
    {
        var actor = new Actor
        {
            FullName = dto.FullName, Age = dto.Age, Gender = dto.Gender,
            CountryID = dto.CountryID, OscarAwards = dto.OscarAwards,
            Salary = dto.Salary, PhotoUrl = dto.PhotoUrl
        };
        _context.Actors.Add(actor);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetActor), new { id = actor.ActorID }, actor);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateActor(int id, [FromBody] CreateActorDto dto)
    {
        var actor = await _context.Actors.FindAsync(id);
        if (actor == null) return NotFound();
        actor.FullName = dto.FullName; actor.Age = dto.Age; actor.Gender = dto.Gender;
        actor.CountryID = dto.CountryID; actor.OscarAwards = dto.OscarAwards;
        actor.Salary = dto.Salary; actor.PhotoUrl = dto.PhotoUrl;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteActor(int id)
    {
        var actor = await _context.Actors.FindAsync(id);
        if (actor == null) return NotFound();
        _context.Actors.Remove(actor);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
