namespace MovieManagement.API.DTOs;

public class ActorDto
{
    public int ActorID { get; set; }
    public string FullName { get; set; } = string.Empty;
    public int Age { get; set; }
    public string Gender { get; set; } = string.Empty;
    public string CountryName { get; set; } = string.Empty;
    public int OscarAwards { get; set; }
    public decimal Salary { get; set; }
    public string PhotoUrl { get; set; } = string.Empty;
    public string? RoleName { get; set; }
}

public class CreateActorDto
{
    public string FullName { get; set; } = string.Empty;
    public int Age { get; set; }
    public string Gender { get; set; } = string.Empty;
    public int CountryID { get; set; }
    public int OscarAwards { get; set; }
    public decimal Salary { get; set; }
    public string PhotoUrl { get; set; } = string.Empty;
}
