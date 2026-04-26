using Microsoft.EntityFrameworkCore;
using PhotoManager.API.Data;
using PhotoManager.API.Models;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;

namespace PhotoManager.API.Services;

public class SimilarityService(IDbContextFactory<AppDbContext> dbFactory, ILogger<SimilarityService> logger)
{
    // Similarity level 0 = identical, 10 = same scene/people different angle
    // Internally: pHash hamming distance 0-64, mapped to user score 0-10
    private static readonly int[] LevelToMaxHammingDistance = [0, 2, 4, 8, 12, 18, 25, 33, 42, 52, 64];

    public string ComputePHash(Image image)
    {
        using var resized = image.CloneAs<L8>();
        resized.Mutate(x => x.Resize(32, 32).Grayscale());

        var pixels = new byte[32 * 32];
        resized.CopyPixelDataTo(pixels);

        var dct = ApplyDct(pixels);
        var topLeft = dct.Take(8).SelectMany((_, i) => dct.Skip(i * 8).Take(8)).Take(64).ToArray();
        var mean = topLeft.Average();

        var hash = new System.Text.StringBuilder();
        foreach (var val in topLeft)
            hash.Append(val >= mean ? '1' : '0');

        return BinaryToHex(hash.ToString());
    }

    public string ComputeDHash(Image image)
    {
        using var resized = image.CloneAs<L8>();
        resized.Mutate(x => x.Resize(9, 8).Grayscale());

        var pixels = new byte[9 * 8];
        resized.CopyPixelDataTo(pixels);

        var hash = new System.Text.StringBuilder();
        for (int row = 0; row < 8; row++)
            for (int col = 0; col < 8; col++)
                hash.Append(pixels[row * 9 + col] < pixels[row * 9 + col + 1] ? '1' : '0');

        return BinaryToHex(hash.ToString());
    }

    public int ComputeHammingDistance(string hash1, string hash2)
    {
        if (hash1.Length != hash2.Length) return int.MaxValue;

        var b1 = HexToBinary(hash1);
        var b2 = HexToBinary(hash2);

        return b1.Zip(b2).Count(pair => pair.First != pair.Second);
    }

    public float HammingToSimilarityScore(int hammingDistance)
    {
        for (int level = 0; level < LevelToMaxHammingDistance.Length - 1; level++)
        {
            if (hammingDistance <= LevelToMaxHammingDistance[level + 1])
                return level + (float)(hammingDistance - LevelToMaxHammingDistance[level]) /
                    (LevelToMaxHammingDistance[level + 1] - LevelToMaxHammingDistance[level]);
        }
        return 10f;
    }

    public async Task<List<SimilarityGroup>> FindSimilarGroupsAsync(float maxLevel, CancellationToken ct = default)
    {
        int maxHamming = LevelToMaxHammingDistance[(int)Math.Ceiling(maxLevel)];

        await using var db = await dbFactory.CreateDbContextAsync(ct);
        var photos = await db.Photos
            .Where(p => !p.IsDeleted && p.PHash != null)
            .Select(p => new { p.Id, p.PHash })
            .ToListAsync(ct);

        var groups = new List<(int id1, int id2, int distance)>();

        for (int i = 0; i < photos.Count; i++)
        {
            for (int j = i + 1; j < photos.Count; j++)
            {
                var dist = ComputeHammingDistance(photos[i].PHash!, photos[j].PHash!);
                if (dist <= maxHamming)
                    groups.Add((photos[i].Id, photos[j].Id, dist));
            }
        }

        return await BuildSimilarityGroupsAsync(db, groups, ct);
    }

    private static async Task<List<SimilarityGroup>> BuildSimilarityGroupsAsync(
        AppDbContext db,
        List<(int id1, int id2, int distance)> pairs,
        CancellationToken ct)
    {
        // Union-Find to cluster connected photos
        var parent = new Dictionary<int, int>();
        int Find(int x) => parent.TryGetValue(x, out var p) && p != x ? parent[x] = Find(p) : parent.TryAdd(x, x) ? x : parent[x];
        void Union(int x, int y) { parent[Find(x)] = Find(y); }

        foreach (var (id1, id2, _) in pairs)
            Union(id1, id2);

        var clusters = pairs
            .SelectMany(p => new[] { (photoId: p.id1, distance: p.distance), (photoId: p.id2, distance: p.distance) })
            .GroupBy(p => Find(p.photoId))
            .Where(g => g.Select(p => p.photoId).Distinct().Count() > 1)
            .ToList();

        var result = new List<SimilarityGroup>();
        foreach (var cluster in clusters)
        {
            var photoIds = cluster.Select(p => p.photoId).Distinct().ToList();
            var avgDist = cluster.Average(p => p.distance);

            var group = new SimilarityGroup
            {
                SimilarityScore = (float)(avgDist / 64.0 * 10),
                Photos = photoIds.Select(id => new SimilarityGroupPhoto { PhotoId = id }).ToList()
            };
            result.Add(group);
        }

        return result;
    }

    private static double[] ApplyDct(byte[] pixels)
    {
        int n = 32;
        var result = new double[n * n];
        for (int u = 0; u < n; u++)
            for (int v = 0; v < n; v++)
            {
                double sum = 0;
                for (int x = 0; x < n; x++)
                    for (int y = 0; y < n; y++)
                        sum += pixels[x * n + y]
                            * Math.Cos((2 * x + 1) * u * Math.PI / (2 * n))
                            * Math.Cos((2 * y + 1) * v * Math.PI / (2 * n));
                result[u * n + v] = sum;
            }
        return result;
    }

    private static string BinaryToHex(string binary)
    {
        var sb = new System.Text.StringBuilder();
        for (int i = 0; i < binary.Length; i += 4)
        {
            var nibble = binary.Substring(i, Math.Min(4, binary.Length - i)).PadRight(4, '0');
            sb.Append(Convert.ToInt32(nibble, 2).ToString("x"));
        }
        return sb.ToString();
    }

    private static string HexToBinary(string hex)
    {
        var sb = new System.Text.StringBuilder();
        foreach (var c in hex)
            sb.Append(Convert.ToString(Convert.ToInt32(c.ToString(), 16), 2).PadLeft(4, '0'));
        return sb.ToString();
    }
}
