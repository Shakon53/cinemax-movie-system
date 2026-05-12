using Microsoft.EntityFrameworkCore;
using MovieManagement.API.Data;
using System.Linq;

var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

builder.Services.AddControllers().AddJsonOptions(o =>
    o.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Movie Management API", Version = "v1", Description = "Full-stack Movie Management System API" });
});

var dbUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
string connStr;
if (!string.IsNullOrEmpty(dbUrl))
{
    // Handles both Render (postgresql://user:pass@host:port/db) and Supabase formats
    if (dbUrl.StartsWith("postgresql://") || dbUrl.StartsWith("postgres://"))
    {
        var uri = new Uri(dbUrl);
        var userInfo = uri.UserInfo.Split(':');
        var password = Uri.UnescapeDataString(string.Join(":", userInfo.Skip(1)));
        connStr = $"Host={uri.Host};Port={(uri.Port == -1 ? 5432 : uri.Port)};" +
                  $"Database={uri.AbsolutePath.TrimStart('/')};" +
                  $"Username={userInfo[0]};Password={password};" +
                  $"SSL Mode=Require;Trust Server Certificate=true;" +
                  $"No Reset On Close=true;Pooling=false;";
    }
    else
    {
        connStr = dbUrl;
    }
}
else
{
    connStr = builder.Configuration.GetConnectionString("DefaultConnection")!;
}

builder.Services.AddDbContext<MovieDbContext>(options => options.UseNpgsql(connStr));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    try
    {
        var context = scope.ServiceProvider.GetRequiredService<MovieDbContext>();
        logger.LogInformation("Applying migrations...");
        await context.Database.MigrateAsync();
        logger.LogInformation("Seeding data...");
        await DataSeeder.SeedAsync(context);
        logger.LogInformation("Database ready.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Database initialization failed: {Message}", ex.Message);
    }
}

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Movie Management API v1");
    c.RoutePrefix = "swagger";
});

app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { status = "healthy", time = DateTime.UtcNow }));

app.Run();
