namespace MovieManagement.API.Models;

public class User
{
    public int UserID { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public int CountryID { get; set; }
    public DateTime RegistrationDate { get; set; }

    public Country? Country { get; set; }
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}
