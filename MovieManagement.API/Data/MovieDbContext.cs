using Microsoft.EntityFrameworkCore;
using MovieManagement.API.Models;

namespace MovieManagement.API.Data;

public class MovieDbContext : DbContext
{
    public MovieDbContext(DbContextOptions<MovieDbContext> options) : base(options) { }

    public DbSet<Country> Countries { get; set; }
    public DbSet<Director> Directors { get; set; }
    public DbSet<Actor> Actors { get; set; }
    public DbSet<Genre> Genres { get; set; }
    public DbSet<Movie> Movies { get; set; }
    public DbSet<MovieActor> MovieActors { get; set; }
    public DbSet<Rating> Ratings { get; set; }
    public DbSet<Discount> Discounts { get; set; }
    public DbSet<BoxOfficeRecord> BoxOfficeRecords { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Review> Reviews { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Movie>()
            .HasOne(m => m.Director)
            .WithMany(d => d.Movies)
            .HasForeignKey(m => m.DirectorID)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Movie>()
            .HasOne(m => m.Country)
            .WithMany(c => c.Movies)
            .HasForeignKey(m => m.CountryID)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Movie>()
            .HasOne(m => m.MainActor)
            .WithMany()
            .HasForeignKey(m => m.MainActorID)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Movie>()
            .HasOne(m => m.RatingInfo)
            .WithOne(r => r.Movie)
            .HasForeignKey<Rating>(r => r.MovieID);

        modelBuilder.Entity<Movie>()
            .HasOne(m => m.BoxOfficeRecord)
            .WithOne(b => b.Movie)
            .HasForeignKey<BoxOfficeRecord>(b => b.MovieID);

        modelBuilder.Entity<MovieActor>()
            .HasOne(ma => ma.Movie)
            .WithMany(m => m.MovieActors)
            .HasForeignKey(ma => ma.MovieID)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<MovieActor>()
            .HasOne(ma => ma.Actor)
            .WithMany(a => a.MovieActors)
            .HasForeignKey(ma => ma.ActorID)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Actor>()
            .HasOne(a => a.Country)
            .WithMany(c => c.Actors)
            .HasForeignKey(a => a.CountryID)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Director>()
            .HasOne(d => d.Country)
            .WithMany(c => c.Directors)
            .HasForeignKey(d => d.CountryID)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<User>()
            .HasOne(u => u.Country)
            .WithMany(c => c.Users)
            .HasForeignKey(u => u.CountryID)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Review>()
            .HasOne(r => r.Movie)
            .WithMany(m => m.Reviews)
            .HasForeignKey(r => r.MovieID)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Review>()
            .HasOne(r => r.User)
            .WithMany(u => u.Reviews)
            .HasForeignKey(r => r.UserID)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Movie>().Property(m => m.Budget).HasPrecision(18, 2);
        modelBuilder.Entity<Movie>().Property(m => m.BoxOffice).HasPrecision(18, 2);
        modelBuilder.Entity<Actor>().Property(a => a.Salary).HasPrecision(18, 2);
        modelBuilder.Entity<BoxOfficeRecord>().Property(b => b.OpeningWeekend).HasPrecision(18, 2);
        modelBuilder.Entity<BoxOfficeRecord>().Property(b => b.WorldwideGross).HasPrecision(18, 2);
    }
}
