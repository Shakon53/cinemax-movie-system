namespace MovieManagement.API.DTOs;

public class ReviewDto
{
    public int ReviewID { get; set; }
    public string Username { get; set; } = string.Empty;
    public string CommentText { get; set; } = string.Empty;
    public double UserRating { get; set; }
    public DateTime ReviewDate { get; set; }
}

public class CreateReviewDto
{
    public int MovieID { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string CommentText { get; set; } = string.Empty;
    public double UserRating { get; set; }
}
