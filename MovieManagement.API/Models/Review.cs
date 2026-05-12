namespace MovieManagement.API.Models;

public class Review
{
    public int ReviewID { get; set; }
    public int UserID { get; set; }
    public int MovieID { get; set; }
    public string CommentText { get; set; } = string.Empty;
    public double UserRating { get; set; }
    public DateTime ReviewDate { get; set; }

    public User? User { get; set; }
    public Movie? Movie { get; set; }
}
