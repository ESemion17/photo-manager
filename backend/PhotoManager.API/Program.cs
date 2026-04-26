using Microsoft.EntityFrameworkCore;
using PhotoManager.API.Data;
using PhotoManager.API.Hubs;
using PhotoManager.API.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddSignalR();

var dbPath = Path.Combine(AppContext.BaseDirectory, "photomanager.db");
// AddDbContextFactory registers both the factory (singleton) and the DbContext (transient)
builder.Services.AddDbContextFactory<AppDbContext>(opt => opt.UseSqlite($"Data Source={dbPath}"));

// Scoped so controllers can inject AppDbContext directly via the factory
builder.Services.AddScoped<AppDbContext>(sp =>
    sp.GetRequiredService<IDbContextFactory<AppDbContext>>().CreateDbContext());

builder.Services.AddSingleton<SimilarityService>();
builder.Services.AddSingleton<IndexingService>();

builder.Services.AddCors(opt =>
    opt.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials()));

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

app.UseCors();
app.MapControllers();
app.MapHub<ProgressHub>("/hubs/progress");

app.Run();
