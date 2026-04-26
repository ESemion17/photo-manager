namespace PhotoManager.API.Models;

public class PhotoFace
{
    public int Id { get; set; }
    public int PhotoId { get; set; }
    public Photo Photo { get; set; } = null!;
    public int? PersonId { get; set; }
    public Person? Person { get; set; }

    // Face bounding box (normalized 0-1)
    public float FaceX { get; set; }
    public float FaceY { get; set; }
    public float FaceWidth { get; set; }
    public float FaceHeight { get; set; }

    // Face embedding stored as JSON array of floats
    public string? EmbeddingJson { get; set; }
    public float Confidence { get; set; }
}
