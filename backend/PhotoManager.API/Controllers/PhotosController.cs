using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PhotoManager.API.Data;
using PhotoManager.API.Models;
using PhotoManager.API.Services;

namespace PhotoManager.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PhotosController(AppDbContext db, IndexingService indexer) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetPhotos(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] string? search = null,
        [FromQuery] bool includeDeleted = false)
    {
        var query = db.Photos.AsQueryable();

        if (!includeDeleted) query = query.Where(p => !p.IsDeleted);
        if (!string.IsNullOrEmpty(search))
            query = query.Where(p => p.FileName.Contains(search));

        var total = await query.CountAsync();
        var photos = await query
            .OrderByDescending(p => p.DateTaken ?? p.DateIndexed)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(p => p.PhotoFaces)
            .ThenInclude(f => f.Person)
            .ToListAsync();

        return Ok(new { total, page, pageSize, photos = photos.Select(MapPhotoDto) });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPhoto(int id)
    {
        var photo = await db.Photos
            .Include(p => p.PhotoFaces)
            .ThenInclude(f => f.Person)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (photo == null) return NotFound();
        return Ok(MapPhotoDto(photo));
    }

    [HttpGet("{id}/image")]
    public IActionResult GetImage(int id, [FromQuery] bool thumbnail = false)
    {
        var photo = db.Photos.Find(id);
        if (photo == null) return NotFound();

        var path = thumbnail && photo.ThumbnailPath != null ? photo.ThumbnailPath : photo.FilePath;
        if (!System.IO.File.Exists(path)) return NotFound();

        var ext = Path.GetExtension(path).ToLowerInvariant();
        var mime = ext switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".webp" => "image/webp",
            _ => "application/octet-stream"
        };

        return PhysicalFile(path, mime);
    }

    [HttpPost("index")]
    public async Task<IActionResult> StartIndexing([FromBody] IndexRequest req, CancellationToken ct)
    {
        if (!Directory.Exists(req.FolderPath))
            return BadRequest($"Folder not found: {req.FolderPath}");

        if (indexer.IsIndexing)
            return Conflict("Indexing already in progress");

        _ = Task.Run(() => indexer.StartIndexingAsync(req.FolderPath, ct), ct);
        return Accepted(new { message = "Indexing started", folder = req.FolderPath });
    }

    [HttpGet("indexing-status")]
    public IActionResult GetIndexingStatus() =>
        Ok(new
        {
            isIndexing = indexer.IsIndexing,
            processed = indexer.ProcessedFiles,
            total = indexer.TotalFiles,
            currentFile = indexer.CurrentFile
        });

    [HttpDelete("{id}")]
    public async Task<IActionResult> SoftDeletePhoto(int id)
    {
        var photo = await db.Photos.FindAsync(id);
        if (photo == null) return NotFound();

        photo.IsDeleted = true;
        photo.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id}/restore")]
    public async Task<IActionResult> RestorePhoto(int id)
    {
        var photo = await db.Photos.FindAsync(id);
        if (photo == null) return NotFound();

        photo.IsDeleted = false;
        photo.DeletedAt = null;
        await db.SaveChangesAsync();
        return Ok(MapPhotoDto(photo));
    }

    [HttpDelete("purge-trash")]
    public async Task<IActionResult> PurgeTrash([FromQuery] int olderThanDays = 30)
    {
        var cutoff = DateTime.UtcNow.AddDays(-olderThanDays);
        var toDelete = await db.Photos
            .Where(p => p.IsDeleted && p.DeletedAt < cutoff)
            .ToListAsync();

        foreach (var photo in toDelete)
        {
            if (System.IO.File.Exists(photo.FilePath))
                System.IO.File.Delete(photo.FilePath);
            if (photo.ThumbnailPath != null && System.IO.File.Exists(photo.ThumbnailPath))
                System.IO.File.Delete(photo.ThumbnailPath);
        }

        db.Photos.RemoveRange(toDelete);
        await db.SaveChangesAsync();
        return Ok(new { deleted = toDelete.Count });
    }

    private static object MapPhotoDto(Photo p) => new
    {
        p.Id,
        p.FileName,
        p.FilePath,
        p.FileSize,
        p.Width,
        p.Height,
        p.DateTaken,
        p.DateIndexed,
        p.Latitude,
        p.Longitude,
        p.CameraModel,
        p.IsDeleted,
        p.DeletedAt,
        thumbnailUrl = $"/api/photos/{p.Id}/image?thumbnail=true",
        imageUrl = $"/api/photos/{p.Id}/image",
        faces = p.PhotoFaces.Select(f => new
        {
            f.Id,
            f.FaceX, f.FaceY, f.FaceWidth, f.FaceHeight,
            f.Confidence,
            personId = f.PersonId,
            personName = f.Person?.Name
        })
    };

    public record IndexRequest(string FolderPath);
}
