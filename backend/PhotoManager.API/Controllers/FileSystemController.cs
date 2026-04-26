using Microsoft.AspNetCore.Mvc;
using System.Runtime.InteropServices;

namespace PhotoManager.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FileSystemController : ControllerBase
{
    [HttpGet("browse")]
    public IActionResult Browse([FromQuery] string? path)
    {
        if (string.IsNullOrEmpty(path))
        {
            var roots = GetRootEntries();
            return Ok(new { current = "", parent = (string?)null, entries = roots });
        }

        if (!Directory.Exists(path))
            return NotFound($"Path not found: {path}");

        var dir = new DirectoryInfo(path);

        var entries = dir.EnumerateDirectories()
            .Where(d => !IsHiddenOrSystem(d))
            .OrderBy(d => d.Name)
            .Select(d => new FsEntry(d.FullName, d.Name, HasSubdirectories(d)))
            .ToList();

        // On Mac/Linux, parent of "/" is null — stop there
        var parent = dir.Parent?.FullName;

        return Ok(new { current = path, parent, entries });
    }

    private static List<FsEntry> GetRootEntries()
    {
        if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
        {
            return DriveInfo.GetDrives()
                .Where(d => d.IsReady)
                .Select(d => new FsEntry(d.RootDirectory.FullName, d.Name.TrimEnd('\\'), true))
                .ToList();
        }

        // Mac / Linux — start at home directory and show root + /Volumes
        var roots = new List<FsEntry>
        {
            new(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile),
                "Home (~)", true),
            new("/", "/ (Root)", true),
        };

        // Mac external drives live in /Volumes
        if (Directory.Exists("/Volumes"))
        {
            var volumes = Directory.GetDirectories("/Volumes")
                .Select(v => new FsEntry(v, $"💾 {Path.GetFileName(v)}", true));
            roots.AddRange(volumes);
        }

        return roots;
    }

    private static bool IsHiddenOrSystem(DirectoryInfo d)
    {
        if (d.Attributes.HasFlag(FileAttributes.System)) return true;
        // On Mac/Linux, hidden = starts with dot
        if (!RuntimeInformation.IsOSPlatform(OSPlatform.Windows) && d.Name.StartsWith('.')) return true;
        if (d.Attributes.HasFlag(FileAttributes.Hidden)) return true;
        return false;
    }

    private static bool HasSubdirectories(DirectoryInfo d)
    {
        try { return d.EnumerateDirectories().Any(sub => !IsHiddenOrSystem(sub)); }
        catch { return false; }
    }

    record FsEntry(string Path, string Name, bool HasChildren);
}
