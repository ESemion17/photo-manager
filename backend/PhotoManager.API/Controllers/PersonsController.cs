using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PhotoManager.API.Data;
using PhotoManager.API.Models;

namespace PhotoManager.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PersonsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetPersons()
    {
        var persons = await db.Persons
            .Select(p => new
            {
                p.Id,
                p.Name,
                p.CreatedAt,
                photoCount = p.PhotoFaces.Select(f => f.PhotoId).Distinct().Count()
            })
            .OrderByDescending(p => p.photoCount)
            .ToListAsync();

        return Ok(persons);
    }

    [HttpPost]
    public async Task<IActionResult> CreatePerson([FromBody] CreatePersonRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Name))
            return BadRequest("Name is required");

        var person = new Person { Name = req.Name.Trim() };
        db.Persons.Add(person);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetPersons), new { id = person.Id }, new { person.Id, person.Name });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> RenamePerson(int id, [FromBody] CreatePersonRequest req)
    {
        var person = await db.Persons.FindAsync(id);
        if (person == null) return NotFound();

        person.Name = req.Name.Trim();
        await db.SaveChangesAsync();
        return Ok(new { person.Id, person.Name });
    }

    [HttpGet("{id}/photos")]
    public async Task<IActionResult> GetPersonPhotos(int id, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        var total = await db.PhotoFaces.CountAsync(f => f.PersonId == id && !f.Photo.IsDeleted);
        var photos = await db.PhotoFaces
            .Where(f => f.PersonId == id && !f.Photo.IsDeleted)
            .Select(f => new
            {
                f.Photo.Id,
                f.Photo.FileName,
                f.Photo.DateTaken,
                thumbnailUrl = $"/api/photos/{f.Photo.Id}/image?thumbnail=true",
                faceX = f.FaceX, faceY = f.FaceY,
                faceWidth = f.FaceWidth, faceHeight = f.FaceHeight
            })
            .Distinct()
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new { total, page, pageSize, photos });
    }

    [HttpPost("assign-face")]
    public async Task<IActionResult> AssignFace([FromBody] AssignFaceRequest req)
    {
        var face = await db.PhotoFaces.FindAsync(req.FaceId);
        if (face == null) return NotFound();

        face.PersonId = req.PersonId;
        await db.SaveChangesAsync();
        return Ok();
    }

    public record CreatePersonRequest(string Name);
    public record AssignFaceRequest(int FaceId, int PersonId);
}
