namespace MovieManagement.API.Models;

public class Rating
{
    public int RatingID { get; set; }
    public int MovieID { get; set; }
    public double IMDbRating { get; set; }
    public int RottenTomatoes { get; set; }
    public int Metacritic { get; set; }
    public int ReviewCount { get; set; }

    public Movie? Movie { get; set; }
}
