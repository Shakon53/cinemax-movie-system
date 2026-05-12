using System.ComponentModel.DataAnnotations;

namespace MovieManagement.API.Models;

public class BoxOfficeRecord
{
    [Key]
    public int BoxOfficeID { get; set; }
    public int MovieID { get; set; }
    public decimal OpeningWeekend { get; set; }
    public decimal WorldwideGross { get; set; }
    public long TicketsSold { get; set; }

    public Movie? Movie { get; set; }
}
