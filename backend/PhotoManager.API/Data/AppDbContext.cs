using Microsoft.EntityFrameworkCore;
using PhotoManager.API.Models;

namespace PhotoManager.API.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Photo> Photos { get; set; }
    public DbSet<Person> Persons { get; set; }
    public DbSet<PhotoFace> PhotoFaces { get; set; }
    public DbSet<SimilarityGroup> SimilarityGroups { get; set; }
    public DbSet<SimilarityGroupPhoto> SimilarityGroupPhotos { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Photo>()
            .HasIndex(p => p.FilePath)
            .IsUnique();

        modelBuilder.Entity<Photo>()
            .HasIndex(p => p.PHash);

        modelBuilder.Entity<PhotoFace>()
            .HasOne(f => f.Photo)
            .WithMany(p => p.PhotoFaces)
            .HasForeignKey(f => f.PhotoId);

        modelBuilder.Entity<PhotoFace>()
            .HasOne(f => f.Person)
            .WithMany(p => p.PhotoFaces)
            .HasForeignKey(f => f.PersonId)
            .IsRequired(false);

        modelBuilder.Entity<SimilarityGroupPhoto>()
            .HasOne(gp => gp.Group)
            .WithMany(g => g.Photos)
            .HasForeignKey(gp => gp.GroupId);

        modelBuilder.Entity<SimilarityGroupPhoto>()
            .HasOne(gp => gp.Photo)
            .WithMany()
            .HasForeignKey(gp => gp.PhotoId);
    }
}
