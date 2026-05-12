namespace MovieManagement.API.Models;

public class MovieActor
{
    public int MovieActorID { get; set; }
    public int MovieID { get; set; }
    public int ActorID { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public int ScreenTimeMinutes { get; set; }

    public Movie? Movie { get; set; }
    public Actor? Actor { get; set; }
}
