using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using MovieManagement.API.Models;
using System.Threading.RateLimiting;
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
    var uri = new Uri(dbUrl.Replace("postgres://", "postgresql://"));
    var userInfo = uri.UserInfo.Split(':', 2);
    var username = Uri.UnescapeDataString(userInfo[0]);
    var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
    var host = uri.Host;
    var dbPort = uri.Port > 0 ? uri.Port : 5432;
    var database = uri.AbsolutePath.TrimStart('/');
    connStr = $"Host={host};Port={dbPort};Database={database};" +
              $"Username={username};Password={password};" +
              $"SSL Mode=Require;Trust Server Certificate=true;" +
              $"Include Error Detail=true;Timeout=30;Command Timeout=30;";
}
else
{
    connStr = builder.Configuration.GetConnectionString("DefaultConnection")!;
}

builder.Services.AddDbContext<MovieDbContext>(options => options.UseNpgsql(connStr));

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme).AddCookie(o => {
    o.Cookie.Name = "cinemax_session";
    o.Cookie.HttpOnly = true;
    o.Cookie.SameSite = SameSiteMode.Strict;
    o.Cookie.SecurePolicy = builder.Environment.IsDevelopment() ? CookieSecurePolicy.SameAsRequest : CookieSecurePolicy.Always;
    o.ExpireTimeSpan = TimeSpan.FromDays(7);
    o.Events.OnValidatePrincipal = async c => {
        var id = c.Principal?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(id, out var userId)) { c.RejectPrincipal(); return; }
        var db = c.HttpContext.RequestServices.GetRequiredService<MovieDbContext>();
        var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.UserID == userId);
        var adminEmail = c.HttpContext.RequestServices.GetRequiredService<IConfiguration>()["Admin:Email"];
        var isAdmin = user != null && string.Equals(user.Email, adminEmail, StringComparison.OrdinalIgnoreCase);
        if (user == null || isAdmin != (c.Principal?.IsInRole("Admin") == true)) c.RejectPrincipal();
    };
    o.Events.OnRedirectToLogin = c => { c.Response.StatusCode = 401; return Task.CompletedTask; };
    o.Events.OnRedirectToAccessDenied = c => { c.Response.StatusCode = 403; return Task.CompletedTask; };
});
builder.Services.AddAuthorization();
builder.Services.AddDataProtection().PersistKeysToFileSystem(new DirectoryInfo(builder.Configuration["DataProtection:Path"] ?? Path.Combine(builder.Environment.ContentRootPath, "keys")));
builder.Services.AddRateLimiter(o => {
    o.RejectionStatusCode = 429;
    o.AddPolicy("auth", c => RateLimitPartition.GetFixedWindowLimiter(c.Connection.RemoteIpAddress?.ToString() ?? "unknown", _ => new FixedWindowRateLimiterOptions { PermitLimit = 20, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));
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
        var adminEmail = builder.Configuration["Admin:Email"]?.Trim().ToLowerInvariant();
        var adminPassword = builder.Configuration["Admin:Password"];
        if (!string.IsNullOrEmpty(adminEmail) && !string.IsNullOrEmpty(adminPassword)) {
            if (adminPassword.Length < 16) throw new InvalidOperationException("Admin password must contain at least 16 characters.");
            if (!await context.Users.AnyAsync(u => u.Email.ToLower() == adminEmail)) {
                var country = await context.Countries.OrderBy(c => c.CountryID).FirstAsync();
                var admin = new User { Username = "administrator", Email = adminEmail, CountryID = country.CountryID, RegistrationDate = DateTime.UtcNow };
                admin.PasswordHash = new PasswordHasher<User>().HashPassword(admin, adminPassword);
                context.Users.Add(admin); await context.SaveChangesAsync();
            }
        }
        logger.LogInformation("Database ready.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Database initialization failed.");
        throw;
    }
}

if (app.Environment.IsDevelopment()) {
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.Use(async (context, next) => {
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    if (context.Request.Method is not ("GET" or "HEAD" or "OPTIONS") && context.Request.Headers["Sec-Fetch-Site"] == "cross-site") { context.Response.StatusCode = 403; return; }
    await next();
});
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapMethods("/health", ["GET", "HEAD"], () => Results.Ok(new { status = "healthy", time = DateTime.UtcNow }));

app.Run();
