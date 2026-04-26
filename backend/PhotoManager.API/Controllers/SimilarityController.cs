using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PhotoManager.API.Data;
using PhotoManager.API.Services;

namespace PhotoManager.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SimilarityController(AppDbContext db, SimilarityService similarity) : ControllerBase
{
    [HttpGet("groups")]
    public async Task<IActionResult> GetSimilarGroups(
        [FromQuery] float level = 3,
        [FromQuery] bool includeResolved = false,
        CancellationToken ct = default)
    {
        level = Math.Clamp(level, 0, 10);
        var groups = await similarity.FindSimilarGroupsAsync(level, ct);

        return Ok(new
        {
            level,
            groupCount = groups.Count,
            groups = groups.Select(g => new
            {
                g.Id,
                g.SimilarityScore,
                g.IsResolved,
                photos = g.Photos.Select(gp => new
                {
                    gp.PhotoId,
                    gp.Photo?.FileName,
                    gp.Photo?.FileSize,
                    gp.Photo?.DateTaken,
                    thumbnailUrl = $"/api/photos/{gp.PhotoId}/image?thumbnail=true",
                    imageUrl = $"/api/photos/{gp.PhotoId}/image",
                    gp.IsKept
                })
            })
        });
    }

    [HttpPost("groups/{groupId}/resolve")]
    public async Task<IActionResult> ResolveGroup(
        int groupId,
        [FromBody] ResolveGroupRequest req)
    {
        var group = await db.SimilarityGroups
            .Include(g => g.Photos)
            .FirstOrDefaultAsync(g => g.Id == groupId);

        if (group == null) return NotFound();

        foreach (var gp in group.Photos)
        {
            gp.IsKept = req.KeepPhotoIds.Contains(gp.PhotoId);

            if (!gp.IsKept)
            {
                var photo = await db.Photos.FindAsync(gp.PhotoId);
                if (photo != null)
                {
                    photo.IsDeleted = true;
                    photo.DeletedAt = DateTime.UtcNow;
                }
            }
        }

        group.IsResolved = true;
        await db.SaveChangesAsync();
        return Ok(new { resolved = true });
    }

    [HttpPost("bulk-resolve")]
    public async Task<IActionResult> BulkResolve([FromBody] BulkResolveRequest req, CancellationToken ct)
    {
        var groups = await db.SimilarityGroups
            .Include(g => g.Photos)
            .Where(g => req.GroupIds.Contains(g.Id) && !g.IsResolved)
            .ToListAsync(ct);

        int deletedCount = 0;
        foreach (var group in groups)
        {
            // Auto-keep the largest file in each group
            var photosWithSize = await db.Photos
                .Where(p => group.Photos.Select(gp => gp.PhotoId).Contains(p.Id))
                .OrderByDescending(p => p.FileSize)
                .ToListAsync(ct);

            var keepId = photosWithSize.First().Id;
            foreach (var gp in group.Photos)
            {
                gp.IsKept = gp.PhotoId == keepId;
                if (!gp.IsKept)
                {
                    var photo = photosWithSize.First(p => p.Id == gp.PhotoId);
                    photo.IsDeleted = true;
                    photo.DeletedAt = DateTime.UtcNow;
                    deletedCount++;
                }
            }
            group.IsResolved = true;
        }

        await db.SaveChangesAsync(ct);
        return Ok(new { resolvedGroups = groups.Count, deletedPhotos = deletedCount });
    }

    public record ResolveGroupRequest(List<int> KeepPhotoIds);
    public record BulkResolveRequest(List<int> GroupIds);
}
