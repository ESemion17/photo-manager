namespace PhotoManager.API.Models;

public class Person
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<PhotoFace> PhotoFaces { get; set; } = [];
}
