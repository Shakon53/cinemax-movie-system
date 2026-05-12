namespace MovieManagement.API.Models;

public class Genre
{
    public int GenreID { get; set; }
    public string GenreName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    public ICollection<Movie> Movies { get; set; } = new List<Movie>();
}
