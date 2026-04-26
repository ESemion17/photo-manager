using MetadataExtractor;
using MetadataExtractor.Formats.Exif;
using Microsoft.EntityFrameworkCore;
using PhotoManager.API.Data;
using PhotoManager.API.Hubs;
using PhotoManager.API.Models;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using Microsoft.AspNetCore.SignalR;

namespace PhotoManager.API.Services;

public class IndexingService(
    IDbContextFactory<AppDbContext> dbFactory,
    SimilarityService similarityService,
    IHubContext<ProgressHub> hub,
    ILogger<IndexingService> logger)
{
    private static readonly string[] ImageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".heic", ".tiff", ".tif"];
    private static readonly string ThumbnailDir = Path.Combine(AppContext.BaseDirectory, "thumbnails");

    public bool IsIndexing { get; private set; }
    public int TotalFiles { get; private set; }
    public int ProcessedFiles { get; private set; }
    public string CurrentFile { get; private set; } = "";

    public async Task StartIndexingAsync(string folderPath, CancellationToken ct = default)
    {
        if (IsIndexing) return;

        IsIndexing = true;
        ProcessedFiles = 0;
        System.IO.Directory.CreateDirectory(ThumbnailDir);

        try
        {
            var files = GetImageFiles(folderPath);
            TotalFiles = files.Count;
            await hub.Clients.All.SendAsync("IndexingStarted", TotalFiles, ct);

            await using var db = await dbFactory.CreateDbContextAsync(ct);
            var existingPaths = await db.Photos.Select(p => p.FilePath).ToHashSetAsync(ct);

            foreach (var filePath in files)
            {
                if (ct.IsCancellationRequested) break;

                CurrentFile = Path.GetFileName(filePath);

                if (!existingPaths.Contains(filePath))
                {
                    await IndexPhotoAsync(db, filePath, ct);
                }

                ProcessedFiles++;
                await hub.Clients.All.SendAsync("IndexingProgress", ProcessedFiles, TotalFiles, CurrentFile, ct);
            }

            await db.SaveChangesAsync(ct);
            await hub.Clients.All.SendAsync("IndexingComplete", ProcessedFiles, ct);
        }
        finally
        {
            IsIndexing = false;
        }
    }

    private async Task IndexPhotoAsync(AppDbContext db, string filePath, CancellationToken ct)
    {
        try
        {
            var info = new FileInfo(filePath);
            var photo = new Photo
            {
                FilePath = filePath,
                FileName = info.Name,
                FileSize = info.Length,
                DateIndexed = DateTime.UtcNow
            };

            using var image = await Image.LoadAsync(filePath, ct);
            photo.Width = image.Width;
            photo.Height = image.Height;

            photo.PHash = similarityService.ComputePHash(image);
            photo.DHash = similarityService.ComputeDHash(image);
            photo.ThumbnailPath = await CreateThumbnailAsync(image, filePath, ct);

            ExtractMetadata(filePath, photo);

            db.Photos.Add(photo);
        }
        catch (Exception ex)
        {
            logger.LogWarning("Failed to index {File}: {Error}", filePath, ex.Message);
        }
    }

    private static async Task<string?> CreateThumbnailAsync(Image image, string originalPath, CancellationToken ct)
    {
        try
        {
            var thumbName = $"{Path.GetFileNameWithoutExtension(originalPath)}_{Guid.NewGuid():N}.jpg";
            var thumbPath = Path.Combine(ThumbnailDir, thumbName);

            using var thumb = image.Clone(ctx => ctx.Resize(new ResizeOptions
            {
                Size = new Size(300, 300),
                Mode = ResizeMode.Max
            }));

            await thumb.SaveAsJpegAsync(thumbPath, ct);
            return thumbPath;
        }
        catch
        {
            return null;
        }
    }

    private static void ExtractMetadata(string filePath, Photo photo)
    {
        try
        {
            var directories = ImageMetadataReader.ReadMetadata(filePath);

            var exifSub = directories.OfType<ExifSubIfdDirectory>().FirstOrDefault();
            if (exifSub != null)
            {
                if (exifSub.TryGetDateTime(ExifSubIfdDirectory.TagDateTimeOriginal, out var dateTaken))
                    photo.DateTaken = dateTaken;
            }

            var exifIfd0 = directories.OfType<ExifIfd0Directory>().FirstOrDefault();
            if (exifIfd0 != null)
            {
                photo.CameraModel = exifIfd0.GetString(ExifIfd0Directory.TagModel);
                if (photo.DateTaken == null && exifIfd0.TryGetDateTime(ExifIfd0Directory.TagDateTime, out var dt))
                    photo.DateTaken = dt;
            }

            var gps = directories.OfType<GpsDirectory>().FirstOrDefault();
            if (gps != null)
            {
                var location = gps.GetGeoLocation();
                if (location != null)
                {
                    photo.Latitude = location.Latitude;
                    photo.Longitude = location.Longitude;
                }
            }
        }
        catch { }
    }

    private static List<string> GetImageFiles(string folderPath) =>
        System.IO.Directory.EnumerateFiles(folderPath, "*.*", SearchOption.AllDirectories)
            .Where(f => ImageExtensions.Contains(Path.GetExtension(f).ToLowerInvariant()))
            .ToList();
}
