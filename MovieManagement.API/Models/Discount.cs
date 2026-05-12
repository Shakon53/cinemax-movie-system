namespace MovieManagement.API.Models;

public class Discount
{
    public int DiscountID { get; set; }
    public int MovieID { get; set; }
    public string DiscountName { get; set; } = string.Empty;
    public int DiscountPercent { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    public Movie? Movie { get; set; }
}
