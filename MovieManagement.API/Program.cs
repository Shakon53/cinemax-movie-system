using Microsoft.EntityFrameworkCore;
using MovieManagement.API.Data;

var builder = WebApplication.CreateBuilder(args);

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
        connStr = $"Host={uri.Host};Port={uri.Port == -1 ? 5432 : uri.Port};" +
                  $"Database={uri.AbsolutePath.TrimStart('/')};" +
                  $"Username={userInfo[0]};Password={Uri.UnescapeDataString(userInfo[1])};" +
                  $"SSL Mode=Require;Trust Server Certificate=true";
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
    var context = scope.ServiceProvider.GetRequiredService<MovieDbContext>();
    await context.Database.MigrateAsync();
    await DataSeeder.SeedAsync(context);
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

app.Run();
