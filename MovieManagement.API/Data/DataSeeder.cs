using MovieManagement.API.Models;

namespace MovieManagement.API.Data;

public static class DataSeeder
{
    public static async Task SeedAsync(MovieDbContext context)
    {
        if (!context.Countries.Any())
        {
        var countries = new List<Country>
        {
            new() { CountryName = "USA", Capital = "Washington D.C.", Population = 331000000, LanguageName = "English" },
            new() { CountryName = "UK", Capital = "London", Population = 67000000, LanguageName = "English" },
            new() { CountryName = "France", Capital = "Paris", Population = 67000000, LanguageName = "French" },
            new() { CountryName = "Australia", Capital = "Canberra", Population = 25000000, LanguageName = "English" },
            new() { CountryName = "Canada", Capital = "Ottawa", Population = 38000000, LanguageName = "English" },
        };
        await context.Countries.AddRangeAsync(countries);
        await context.SaveChangesAsync();
        }

        if (!context.Genres.Any())
        {
        var genres = new List<Genre>
        {
            new() { GenreName = "Sci-Fi", Description = "Science fiction films exploring futuristic concepts" },
            new() { GenreName = "Drama", Description = "Dramatic narrative films" },
            new() { GenreName = "Action", Description = "High-energy action-packed films" },
            new() { GenreName = "Thriller", Description = "Suspenseful and exciting films" },
            new() { GenreName = "Adventure", Description = "Epic adventure and exploration films" },
        };
        await context.Genres.AddRangeAsync(genres);
        await context.SaveChangesAsync();
        }

        if (!context.Directors.Any())
        {
        var directors = new List<Director>
        {
            new() { FullName = "Christopher Nolan", BirthDate = new DateTime(1970, 7, 30, 0, 0, 0, DateTimeKind.Utc), CountryID = 2, ExperienceYears = 25, AwardsCount = 12 },
            new() { FullName = "James Cameron", BirthDate = new DateTime(1954, 8, 16, 0, 0, 0, DateTimeKind.Utc), CountryID = 5, ExperienceYears = 35, AwardsCount = 15 },
            new() { FullName = "Steven Spielberg", BirthDate = new DateTime(1946, 12, 18, 0, 0, 0, DateTimeKind.Utc), CountryID = 1, ExperienceYears = 50, AwardsCount = 20 },
            new() { FullName = "Denis Villeneuve", BirthDate = new DateTime(1967, 10, 3, 0, 0, 0, DateTimeKind.Utc), CountryID = 5, ExperienceYears = 25, AwardsCount = 8 },
            new() { FullName = "Martin Scorsese", BirthDate = new DateTime(1942, 11, 17, 0, 0, 0, DateTimeKind.Utc), CountryID = 1, ExperienceYears = 55, AwardsCount = 18 },
        };
        await context.Directors.AddRangeAsync(directors);
        await context.SaveChangesAsync();
        }

        if (!context.Actors.Any())
        {
        var actors = new List<Actor>
        {
            new() { FullName = "Leonardo DiCaprio", Age = 49, Gender = "Male", CountryID = 1, OscarAwards = 1, Salary = 25000000, PhotoUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Leonardo_DiCaprio_2014.jpg/440px-Leonardo_DiCaprio_2014.jpg" },
            new() { FullName = "Kate Winslet", Age = 48, Gender = "Female", CountryID = 2, OscarAwards = 1, Salary = 15000000, PhotoUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Kate_Winslet_2011.jpg/440px-Kate_Winslet_2011.jpg" },
            new() { FullName = "Matthew McConaughey", Age = 54, Gender = "Male", CountryID = 1, OscarAwards = 1, Salary = 20000000, PhotoUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Matthew_McConaughey_2019.jpg/440px-Matthew_McConaughey_2019.jpg" },
            new() { FullName = "Anne Hathaway", Age = 41, Gender = "Female", CountryID = 1, OscarAwards = 1, Salary = 12000000, PhotoUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Anne_Hathaway_Face_2009.jpg/440px-Anne_Hathaway_Face_2009.jpg" },
            new() { FullName = "Christian Bale", Age = 50, Gender = "Male", CountryID = 2, OscarAwards = 1, Salary = 18000000, PhotoUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Christian_Bale_2009.jpg/440px-Christian_Bale_2009.jpg" },
            new() { FullName = "Sam Worthington", Age = 47, Gender = "Male", CountryID = 4, OscarAwards = 0, Salary = 10000000, PhotoUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Sam_Worthington_2009.jpg/440px-Sam_Worthington_2009.jpg" },
            new() { FullName = "Zoe Saldana", Age = 46, Gender = "Female", CountryID = 1, OscarAwards = 0, Salary = 8000000, PhotoUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Zoesaldana.jpg/440px-Zoesaldana.jpg" },
            new() { FullName = "Tom Hardy", Age = 46, Gender = "Male", CountryID = 2, OscarAwards = 0, Salary = 15000000, PhotoUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Tom_Hardy_by_Gage_Skidmore.jpg/440px-Tom_Hardy_by_Gage_Skidmore.jpg" },
            new() { FullName = "Cillian Murphy", Age = 47, Gender = "Male", CountryID = 2, OscarAwards = 1, Salary = 12000000, PhotoUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Cillian_Murphy_2018.jpg/440px-Cillian_Murphy_2018.jpg" },
            new() { FullName = "Joseph Gordon-Levitt", Age = 43, Gender = "Male", CountryID = 1, OscarAwards = 0, Salary = 8000000, PhotoUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Joseph_Gordon-Levitt_2013.jpg/440px-Joseph_Gordon-Levitt_2013.jpg" },
        };
        await context.Actors.AddRangeAsync(actors);
        await context.SaveChangesAsync();
        }

        if (!context.Movies.Any())
        {
        var movies = new List<Movie>
        {
            new() { Title = "Inception", Description = "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.", ReleaseYear = 2010, DurationMinutes = 148, CountryID = 1, DirectorID = 1, GenreID = 1, MainActorID = 1, Budget = 160000000, BoxOffice = 836800000, Rating = 8.8, DiscountPercent = 20, LanguageName = "English", AgeRestriction = "PG-13", ProductionCompany = "Warner Bros.", SubtitleAvailable = true, Is3D = false, PosterUrl = "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg", TrailerUrl = "YoHD9XEInc0" },
            new() { Title = "Titanic", Description = "A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.", ReleaseYear = 1997, DurationMinutes = 194, CountryID = 1, DirectorID = 2, GenreID = 2, MainActorID = 1, Budget = 200000000, BoxOffice = 2187000000, Rating = 7.9, DiscountPercent = 15, LanguageName = "English", AgeRestriction = "PG-13", ProductionCompany = "Paramount Pictures", SubtitleAvailable = true, Is3D = true, PosterUrl = "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg", TrailerUrl = "2e-eXJ6HgkQ" },
            new() { Title = "Interstellar", Description = "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.", ReleaseYear = 2014, DurationMinutes = 169, CountryID = 1, DirectorID = 1, GenreID = 1, MainActorID = 3, Budget = 165000000, BoxOffice = 773000000, Rating = 8.6, DiscountPercent = 10, LanguageName = "English", AgeRestriction = "PG-13", ProductionCompany = "Paramount Pictures", SubtitleAvailable = true, Is3D = false, PosterUrl = "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", TrailerUrl = "zSWdZVtXT7E" },
            new() { Title = "Avatar", Description = "A paraplegic Marine dispatched to the moon Pandora on a unique mission becomes torn between following his orders and protecting the world he feels is his home.", ReleaseYear = 2009, DurationMinutes = 162, CountryID = 1, DirectorID = 2, GenreID = 5, MainActorID = 6, Budget = 237000000, BoxOffice = 2923000000, Rating = 7.9, DiscountPercent = 5, LanguageName = "English", AgeRestriction = "PG-13", ProductionCompany = "20th Century Fox", SubtitleAvailable = true, Is3D = true, PosterUrl = "https://image.tmdb.org/t/p/w500/jRXYjXNq0Cs2TcJjLkki24MLp7u.jpg", TrailerUrl = "5PSNL1qE6VY" },
            new() { Title = "The Dark Knight", Description = "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.", ReleaseYear = 2008, DurationMinutes = 152, CountryID = 1, DirectorID = 1, GenreID = 3, MainActorID = 5, Budget = 185000000, BoxOffice = 1005000000, Rating = 9.0, DiscountPercent = 0, LanguageName = "English", AgeRestriction = "PG-13", ProductionCompany = "Warner Bros.", SubtitleAvailable = true, Is3D = false, PosterUrl = "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg", TrailerUrl = "EXeTwQWrcwY" },
            new() { Title = "The Shawshank Redemption", Description = "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.", ReleaseYear = 1994, DurationMinutes = 142, CountryID = 1, DirectorID = 3, GenreID = 2, MainActorID = null, Budget = 25000000, BoxOffice = 58300000, Rating = 9.3, DiscountPercent = 30, LanguageName = "English", AgeRestriction = "R", ProductionCompany = "Castle Rock Entertainment", SubtitleAvailable = true, Is3D = false, PosterUrl = "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg", TrailerUrl = "6hB3S9bIaco" },
            new() { Title = "Oppenheimer", Description = "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.", ReleaseYear = 2023, DurationMinutes = 180, CountryID = 1, DirectorID = 1, GenreID = 2, MainActorID = 9, Budget = 100000000, BoxOffice = 952000000, Rating = 8.5, DiscountPercent = 0, LanguageName = "English", AgeRestriction = "R", ProductionCompany = "Universal Pictures", SubtitleAvailable = true, Is3D = false, PosterUrl = "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg", TrailerUrl = "uYPbbksJxIg" },
            new() { Title = "Dune", Description = "Feature adaptation of Frank Herbert's science fiction novel about the son of a noble family entrusted with the protection of the most valuable asset and most vital element in the galaxy.", ReleaseYear = 2021, DurationMinutes = 155, CountryID = 1, DirectorID = 4, GenreID = 1, MainActorID = null, Budget = 165000000, BoxOffice = 401800000, Rating = 8.0, DiscountPercent = 10, LanguageName = "English", AgeRestriction = "PG-13", ProductionCompany = "Warner Bros.", SubtitleAvailable = true, Is3D = true, PosterUrl = "https://image.tmdb.org/t/p/w500/d5NXSklpcKqgCghQ6o9PAN0m1gu.jpg", TrailerUrl = "8g18jFHCLXk" },
            new() { Title = "The Wolf of Wall Street", Description = "Based on the true story of Jordan Belfort, from his rise to a wealthy stock-broker living the high life to his fall involving crime, corruption and the federal government.", ReleaseYear = 2013, DurationMinutes = 180, CountryID = 1, DirectorID = 5, GenreID = 2, MainActorID = 1, Budget = 100000000, BoxOffice = 392000000, Rating = 8.2, DiscountPercent = 15, LanguageName = "English", AgeRestriction = "R", ProductionCompany = "Paramount Pictures", SubtitleAvailable = true, Is3D = false, PosterUrl = "https://image.tmdb.org/t/p/w500/pWHf4khOloNVfCxscsXFj3jj6gP.jpg", TrailerUrl = "iszwuX1AK6A" },
            new() { Title = "Mad Max: Fury Road", Description = "In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler in search for her homeland with the aid of a group of female prisoners, a psychotic worshipper and a drifter named Max.", ReleaseYear = 2015, DurationMinutes = 120, CountryID = 4, DirectorID = 3, GenreID = 3, MainActorID = 8, Budget = 185000000, BoxOffice = 375400000, Rating = 8.1, DiscountPercent = 20, LanguageName = "English", AgeRestriction = "R", ProductionCompany = "Warner Bros.", SubtitleAvailable = true, Is3D = false, PosterUrl = "https://image.tmdb.org/t/p/w500/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg", TrailerUrl = "hEJnMQG9ev8" },
        };
        await context.Movies.AddRangeAsync(movies);
        await context.SaveChangesAsync();
        }

        if (!context.Ratings.Any())
        {
        var ratings = new List<Rating>
        {
            new() { MovieID = 1, IMDbRating = 8.8, RottenTomatoes = 87, Metacritic = 74, ReviewCount = 2400000 },
            new() { MovieID = 2, IMDbRating = 7.9, RottenTomatoes = 89, Metacritic = 75, ReviewCount = 1200000 },
            new() { MovieID = 3, IMDbRating = 8.6, RottenTomatoes = 72, Metacritic = 74, ReviewCount = 1800000 },
            new() { MovieID = 4, IMDbRating = 7.9, RottenTomatoes = 82, Metacritic = 83, ReviewCount = 1300000 },
            new() { MovieID = 5, IMDbRating = 9.0, RottenTomatoes = 94, Metacritic = 84, ReviewCount = 2700000 },
            new() { MovieID = 6, IMDbRating = 9.3, RottenTomatoes = 91, Metacritic = 82, ReviewCount = 2900000 },
            new() { MovieID = 7, IMDbRating = 8.5, RottenTomatoes = 93, Metacritic = 88, ReviewCount = 700000 },
            new() { MovieID = 8, IMDbRating = 8.0, RottenTomatoes = 83, Metacritic = 74, ReviewCount = 900000 },
            new() { MovieID = 9, IMDbRating = 8.2, RottenTomatoes = 79, Metacritic = 75, ReviewCount = 1400000 },
            new() { MovieID = 10, IMDbRating = 8.1, RottenTomatoes = 97, Metacritic = 90, ReviewCount = 1000000 },
        };
        await context.Ratings.AddRangeAsync(ratings);
        await context.SaveChangesAsync();
        }

        if (!context.BoxOfficeRecords.Any())
        {
        var boxOffices = new List<BoxOfficeRecord>
        {
            new() { MovieID = 1, OpeningWeekend = 62785337, WorldwideGross = 836848102, TicketsSold = 60000000 },
            new() { MovieID = 2, OpeningWeekend = 28638131, WorldwideGross = 2187463944, TicketsSold = 180000000 },
            new() { MovieID = 3, OpeningWeekend = 47510360, WorldwideGross = 773342399, TicketsSold = 55000000 },
            new() { MovieID = 4, OpeningWeekend = 77025481, WorldwideGross = 2923706026, TicketsSold = 220000000 },
            new() { MovieID = 5, OpeningWeekend = 67165092, WorldwideGross = 1004558444, TicketsSold = 75000000 },
        };
        await context.BoxOfficeRecords.AddRangeAsync(boxOffices);
        await context.SaveChangesAsync();
        }

        if (!context.Users.Any())
        {
        var users = new List<User>
        {
            new() { Username = "john_doe", Email = "john@example.com", CountryID = 1, RegistrationDate = DateTime.UtcNow.AddDays(-100) },
            new() { Username = "jane_smith", Email = "jane@example.com", CountryID = 2, RegistrationDate = DateTime.UtcNow.AddDays(-80) },
            new() { Username = "mike_jones", Email = "mike@example.com", CountryID = 1, RegistrationDate = DateTime.UtcNow.AddDays(-60) },
        };
        await context.Users.AddRangeAsync(users);
        await context.SaveChangesAsync();
        }

        if (!context.Reviews.Any())
        {
        var reviews = new List<Review>
        {
            new() { UserID = 1, MovieID = 1, CommentText = "Mind-blowing film! The concept of dreams within dreams is executed perfectly.", UserRating = 9.5, ReviewDate = DateTime.UtcNow.AddDays(-10) },
            new() { UserID = 2, MovieID = 1, CommentText = "One of the best sci-fi movies ever made. Nolan at his finest!", UserRating = 10.0, ReviewDate = DateTime.UtcNow.AddDays(-8) },
            new() { UserID = 3, MovieID = 2, CommentText = "A timeless classic. The love story combined with historical disaster is breathtaking.", UserRating = 9.0, ReviewDate = DateTime.UtcNow.AddDays(-15) },
            new() { UserID = 1, MovieID = 3, CommentText = "Interstellar is a masterpiece. The science and emotion are beautifully intertwined.", UserRating = 9.5, ReviewDate = DateTime.UtcNow.AddDays(-5) },
            new() { UserID = 2, MovieID = 5, CommentText = "The Dark Knight is the greatest superhero film ever. Heath Ledger's Joker is iconic.", UserRating = 10.0, ReviewDate = DateTime.UtcNow.AddDays(-12) },
            new() { UserID = 3, MovieID = 7, CommentText = "Oppenheimer is a stunning achievement in filmmaking. Cillian Murphy deserved the Oscar.", UserRating = 9.0, ReviewDate = DateTime.UtcNow.AddDays(-3) },
        };
        await context.Reviews.AddRangeAsync(reviews);
        await context.SaveChangesAsync();
        }

        if (!context.MovieActors.Any())
        {
        var movieActors = new List<MovieActor>
        {
            new() { MovieID = 1, ActorID = 1, RoleName = "Dominic Cobb", ScreenTimeMinutes = 120 },
            new() { MovieID = 1, ActorID = 10, RoleName = "Arthur", ScreenTimeMinutes = 80 },
            new() { MovieID = 2, ActorID = 1, RoleName = "Jack Dawson", ScreenTimeMinutes = 150 },
            new() { MovieID = 2, ActorID = 2, RoleName = "Rose DeWitt Bukater", ScreenTimeMinutes = 160 },
            new() { MovieID = 3, ActorID = 3, RoleName = "Cooper", ScreenTimeMinutes = 140 },
            new() { MovieID = 3, ActorID = 4, RoleName = "Brand", ScreenTimeMinutes = 90 },
            new() { MovieID = 4, ActorID = 6, RoleName = "Jake Sully", ScreenTimeMinutes = 145 },
            new() { MovieID = 4, ActorID = 7, RoleName = "Neytiri", ScreenTimeMinutes = 130 },
            new() { MovieID = 5, ActorID = 5, RoleName = "Bruce Wayne / Batman", ScreenTimeMinutes = 120 },
            new() { MovieID = 5, ActorID = 8, RoleName = "Bane", ScreenTimeMinutes = 60 },
        };
        await context.MovieActors.AddRangeAsync(movieActors);
        await context.SaveChangesAsync();
        }

        if (!context.Discounts.Any())
        {
        var discounts = new List<Discount>
        {
            new() { MovieID = 1, DiscountName = "Weekend Special", DiscountPercent = 20, StartDate = DateTime.UtcNow, EndDate = DateTime.UtcNow.AddDays(7) },
            new() { MovieID = 2, DiscountName = "Classic Movie Deal", DiscountPercent = 15, StartDate = DateTime.UtcNow, EndDate = DateTime.UtcNow.AddDays(14) },
            new() { MovieID = 6, DiscountName = "All-Time Best Discount", DiscountPercent = 30, StartDate = DateTime.UtcNow, EndDate = DateTime.UtcNow.AddDays(30) },
        };
        await context.Discounts.AddRangeAsync(discounts);
        await context.SaveChangesAsync();
        }
    }
}

