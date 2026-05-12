namespace MovieManagement.API.Models;

public class Country
{
    public int CountryID { get; set; }
    public string CountryName { get; set; } = string.Empty;
    public string Capital { get; set; } = string.Empty;
    public long Population { get; set; }
    public string LanguageName { get; set; } = string.Empty;

    public ICollection<Director> Directors { get; set; } = new List<Director>();
    public ICollection<Actor> Actors { get; set; } = new List<Actor>();
    public ICollection<Movie> Movies { get; set; } = new List<Movie>();
    public ICollection<User> Users { get; set; } = new List<User>();
}
