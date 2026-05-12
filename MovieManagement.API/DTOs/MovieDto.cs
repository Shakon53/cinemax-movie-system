namespace MovieManagement.API.DTOs;

public class MovieDto
{
    public int MovieID { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int ReleaseYear { get; set; }
    public int DurationMinutes { get; set; }
    public string CountryName { get; set; } = string.Empty;
    public string DirectorName { get; set; } = string.Empty;
    public string GenreName { get; set; } = string.Empty;
    public string? MainActorName { get; set; }
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
    public string TrailerUrl { get; set; } = string.Empty;
    public double? IMDbRating { get; set; }
    public int? RottenTomatoes { get; set; }
    public List<ActorDto> Actors { get; set; } = new();
    public List<ReviewDto> Reviews { get; set; } = new();
}

public class CreateMovieDto
{
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
    public string TrailerUrl { get; set; } = string.Empty;
}
