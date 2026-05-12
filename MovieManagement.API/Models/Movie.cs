namespace MovieManagement.API.Models;

public class Movie
{
    public int MovieID { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int ReleaseYear { get; set; }
    public int DurationMinutes { get; set; }
    public int CountryID { get; set; }
    public int DirectorID { get; set; }
    public int GenreID { get; set; }
    public int? MainActorID { get; set; }
    public decimal Budget { get; set; }
    public decimal BoxOffice { get; set; }
    public double Rating { get; set; }
    public int DiscountPercent { get; set; }
    public string LanguageName { get; set; } = string.Empty;
    public string AgeRestriction { get; set; } = string.Empty;
    public string ProductionCompany { get; set; } = string.Empty;
    public bool SubtitleAvailable { get; set; }
    public bool Is3D { get; set; }
    public string PosterUrl { get; set; } = string.Empty;

    public Country? Country { get; set; }
    public Director? Director { get; set; }
    public Genre? Genre { get; set; }
    public Actor? MainActor { get; set; }
    public ICollection<MovieActor> MovieActors { get; set; } = new List<MovieActor>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public Rating? RatingInfo { get; set; }
    public ICollection<Discount> Discounts { get; set; } = new List<Discount>();
    public BoxOfficeRecord? BoxOfficeRecord { get; set; }
}
