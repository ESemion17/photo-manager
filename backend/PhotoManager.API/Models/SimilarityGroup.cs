namespace PhotoManager.API.Models;

public class SimilarityGroup
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public float SimilarityScore { get; set; }
    public bool IsResolved { get; set; } = false;

    public ICollection<SimilarityGroupPhoto> Photos { get; set; } = [];
}

public class SimilarityGroupPhoto
{
    public int Id { get; set; }
    public int GroupId { get; set; }
    public SimilarityGroup Group { get; set; } = null!;
    public int PhotoId { get; set; }
    public Photo Photo { get; set; } = null!;
    public bool IsKept { get; set; } = true;
}
