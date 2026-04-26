# Photo Manager — Smart Photo Management

A local application for managing, comparing and organizing photos with duplicate detection and face tagging.

> 🌐 Supports **English**, **Hebrew** (עברית) and **Russian** (Русский) — switchable in the top-right corner.

## Features

- **Folder scanning** — Background scan of photo folders with real-time progress bar
- **Duplicate detection** — Similarity scale 0–10 (0 = identical, 10 = same people/location)
- **Side-by-side comparison** — View similar photos together and choose what to keep or delete
- **Smart trash** — Deleted photos are kept for 30 days before permanent removal
- **Face tagging** — Identify people in photos and save their names
- **Gallery** — View all photos with pagination
- **Folder picker** — Browse and select folders visually (no manual path typing)
- **Multi-language** — English (default), Hebrew (RTL), Russian

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | C# ASP.NET Core 10, Entity Framework Core, SQLite |
| Image processing | SixLabors.ImageSharp, pHash, dHash |
| Metadata | MetadataExtractor (EXIF, GPS) |
| Real-time | SignalR |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| i18n | i18next, react-i18next |

## Requirements

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org)

## Installation & Running

### Windows

```bat
.\start.bat
```

### Mac / Linux

```bash
chmod +x start.sh
./start.sh
```

After starting:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

## First-time Usage

1. Open the app in your browser (`http://localhost:5173`)
2. Click 📂 and browse to your photos folder
3. Click **"Start Scan"** — the app will index all photos in the background
4. Go to the **"Similar Photos"** tab, adjust the slider and click **"Find"**
5. Choose which photos to keep and which to delete

## Project Structure

```
photo-manager/
├── backend/
│   └── PhotoManager.API/
│       ├── Controllers/     # Photos, Similarity, Persons, FileSystem
│       ├── Models/          # Photo, Person, PhotoFace, SimilarityGroup
│       ├── Services/        # IndexingService, SimilarityService
│       ├── Data/            # EF Core DbContext
│       └── Hubs/            # SignalR ProgressHub
├── frontend/
│   └── src/
│       ├── components/      # GalleryView, SimilarityView, FolderPicker, ...
│       ├── i18n/            # Translations: en, he, ru
│       └── api.ts           # API client
├── start.bat                # Windows startup script
└── start.sh                 # Mac / Linux startup script
```

## Similarity Scale

| Score | Meaning |
|-------|---------|
| 0 | Identical — pixel for pixel |
| 1–2 | Duplicates with minor edits (crop, resize) |
| 3–4 | Same photo, different compression |
| 5–6 | Same scene, different angle |
| 7–8 | Same event |
| 9–10 | Same people, similar location |
