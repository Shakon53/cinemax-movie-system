namespace MovieManagement.API.Models;

public class Actor
{
    public int ActorID { get; set; }
    public string FullName { get; set; } = string.Empty;
    public int Age { get; set; }
    public string Gender { get; set; } = string.Empty;
    public int CountryID { get; set; }
    public int OscarAwards { get; set; }
    public decimal Salary { get; set; }
    public string PhotoUrl { get; set; } = string.Empty;

    public Country? Country { get; set; }
    public ICollection<MovieActor> MovieActors { get; set; } = new List<MovieActor>();
}
