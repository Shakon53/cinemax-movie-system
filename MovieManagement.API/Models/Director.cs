namespace MovieManagement.API.Models;

public class Director
{
    public int DirectorID { get; set; }
    public string FullName { get; set; } = string.Empty;
    public DateTime BirthDate { get; set; }
    public int CountryID { get; set; }
    public int ExperienceYears { get; set; }
    public int AwardsCount { get; set; }

    public Country? Country { get; set; }
    public ICollection<Movie> Movies { get; set; } = new List<Movie>();
}
