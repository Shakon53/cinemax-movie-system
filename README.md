# 🎬 CineMax — Movie Management System

Full-stack Movie Management System built with ASP.NET Core 8 + MSSQL + Bootstrap 5.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Bootstrap 5, Vanilla JS |
| Backend | ASP.NET Core 8 Web API |
| Database | MSSQL (LocalDB / Azure SQL) |
| ORM | Entity Framework Core 8 |
| Docs | Swagger / OpenAPI |

## Project Structure

```
Cinema/
├── MovieManagement.API/       ← ASP.NET Core 8 Backend
│   ├── Controllers/           ← REST API Controllers
│   ├── Data/                  ← DbContext + DataSeeder
│   ├── DTOs/                  ← Data Transfer Objects
│   ├── Models/                ← Entity Models
│   ├── Program.cs
│   └── appsettings.json
└── Frontend/                  ← Static HTML/CSS/JS
    ├── index.html             ← Movie list (home)
    ├── movie.html             ← Movie detail page
    ├── actors.html            ← Actors list
    ├── reviews.html           ← Reviews page
    ├── admin.html             ← Admin dashboard
    ├── css/style.css
    └── js/api.js
```

## 🚀 Quick Start

### 1. Prerequisites
- .NET 8 SDK → https://dotnet.microsoft.com/download
- SQL Server LocalDB (included with VS) OR SQL Server Express
- VS Code or Visual Studio 2022

### 2. Run the Backend

```bash
cd MovieManagement.API

# Restore packages
dotnet restore

# Create migration
dotnet ef migrations add InitialCreate

# Apply migration + seed data automatically
dotnet run
```

Backend runs at: **http://localhost:5000**  
Swagger UI: **http://localhost:5000/swagger**

### 3. Run the Frontend

Open `Frontend/index.html` in a browser, or use Live Server (VS Code extension):
```
Right-click index.html → Open with Live Server
```

---

## 🗄️ Database Schema

| Table | Description |
|-------|-------------|
| Countries | 5 countries with capital, population |
| Genres | 5 genres (Sci-Fi, Drama, Action, etc.) |
| Directors | 5 famous directors |
| Actors | 10 actors with Oscar awards |
| Movies | 10 movies (Inception, Titanic, etc.) |
| MovieActors | Movie-Actor relationship with roles |
| Ratings | IMDb, Rotten Tomatoes, Metacritic |
| Discounts | Movie discounts with date range |
| BoxOfficeRecords | Opening weekend, worldwide gross |
| Users | User accounts |
| Reviews | User reviews with rating |

---

## ☁️ Azure SQL Database (Cloud)

### 1. Create Azure SQL Database
1. Go to portal.azure.com
2. Create Resource → SQL Database
3. Free tier: DTU-based → Basic (5 DTU) — FREE for 12 months
4. Note your server name, admin login, password

### 2. Update Connection String

In `appsettings.json`:
```json
"DefaultConnection": "Server=tcp:YOUR_SERVER.database.windows.net,1433;Initial Catalog=MovieDB;Persist Security Info=False;User ID=YOUR_USER;Password=YOUR_PASSWORD;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;"
```

### 3. Migration Commands

```bash
# Add migration
dotnet ef migrations add InitialCreate --project MovieManagement.API

# Apply to Azure SQL
dotnet ef database update --project MovieManagement.API
```

---

## 📡 API Endpoints

### Movies
```
GET    /api/movies?search=&genreId=&sortBy=&page=&pageSize=
GET    /api/movies/{id}
POST   /api/movies
PUT    /api/movies/{id}
DELETE /api/movies/{id}
```

### Actors
```
GET    /api/actors
GET    /api/actors/{id}
POST   /api/actors
PUT    /api/actors/{id}
DELETE /api/actors/{id}
```

### Reviews
```
GET    /api/reviews?movieId=
POST   /api/reviews
DELETE /api/reviews/{id}
```

### Other
```
GET    /api/genres
GET    /api/directors
GET    /api/countries
```

---

## 🎬 Seed Data (Pre-loaded)

**Movies:** Inception, Titanic, Interstellar, Avatar, The Dark Knight, The Shawshank Redemption, Oppenheimer, Dune, The Wolf of Wall Street, Mad Max: Fury Road

**Actors:** Leonardo DiCaprio, Kate Winslet, Matthew McConaughey, Anne Hathaway, Christian Bale, Sam Worthington, Zoe Saldana, Tom Hardy, Cillian Murphy, Joseph Gordon-Levitt

**Directors:** Christopher Nolan, James Cameron, Steven Spielberg, Denis Villeneuve, Martin Scorsese

---

## 🎨 Features

- ✅ Netflix-style dark UI
- ✅ Movie cards with poster, rating, genre, discount badge
- ✅ Movie detail page with full info, cast, reviews
- ✅ Search + filter by genre + sort by rating/year/title
- ✅ Pagination
- ✅ Loading spinner
- ✅ Actors page with photos
- ✅ Reviews with star rating
- ✅ Admin dashboard with CRUD (add/edit/delete movies & actors)
- ✅ Admin stats cards
- ✅ Toast notifications
- ✅ Responsive design (Bootstrap 5)
- ✅ Swagger API documentation
- ✅ EF Core Code First with automatic migrations + seed
