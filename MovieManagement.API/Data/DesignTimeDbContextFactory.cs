using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace MovieManagement.API.Data;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<MovieDbContext>
{
    public MovieDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<MovieDbContext>();
        optionsBuilder.UseNpgsql("Host=localhost;Port=5432;Database=moviedb;Username=postgres;Password=postgres");
        return new MovieDbContext(optionsBuilder.Options);
    }
}
