namespace PhotoManager.API.Models;

public class Photo
{
    public int Id { get; set; }
    public string FilePath { get; set; } = "";
    public string FileName { get; set; } = "";
    public long FileSize { get; set; }
    public int Width { get; set; }
    public int Height { get; set; }
    public DateTime? DateTaken { get; set; }
    public DateTime DateIndexed { get; set; } = DateTime.UtcNow;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string? CameraModel { get; set; }
    public string? PHash { get; set; }
    public string? DHash { get; set; }
    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedAt { get; set; }
    public string? ThumbnailPath { get; set; }

    public ICollection<PhotoFace> PhotoFaces { get; set; } = [];
}
