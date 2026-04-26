# Photo Manager — ניהול תמונות חכם

אפליקציה מקומית לניהול, השוואה וארגון תמונות עם זיהוי כפולות וזיהוי פנים.

## תכונות עיקריות

- **סריקת תיקיות** — סריקה רקעית של תיקיות עם progress bar בזמן אמת
- **זיהוי כפולות** — סקאלת דמיון 0–10 (0 = זהה לחלוטין, 10 = אותם אנשים/מקום)
- **השוואה צד-לצד** — תצוגת תמונות דומות עם בחירה ידנית מה לשמור/למחוק
- **אשפה חכמה** — תמונות "שנמחקו" נשמרות 30 יום לפני מחיקה סופית
- **תיוג פנים** — זיהוי אנשים בתמונות ושמירת שמות
- **גלריה** — תצוגת כל התמונות עם pagination
- **בחירת תיקייה** — ממשק גלישה בתיקיות (ללא הקלדה ידנית)

## טכנולוגיות

| חלק | טכנולוגיה |
|-----|-----------|
| Backend | C# ASP.NET Core 10, Entity Framework Core, SQLite |
| עיבוד תמונות | SixLabors.ImageSharp, pHash, dHash |
| Metadata | MetadataExtractor (EXIF, GPS) |
| Real-time | SignalR |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |

## דרישות מערכת

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org)

## התקנה והרצה

### Windows

```bat
.\start.bat
```

### Mac / Linux

```bash
chmod +x start.sh
./start.sh
```

לאחר ההפעלה:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

## שימוש ראשוני

1. פתח את האפליקציה בדפדפן (`http://localhost:5173`)
2. לחץ על 📂 ובחר את תיקיית התמונות שלך
3. לחץ **"התחל סריקה"** — האפליקציה תאנדקס את כל התמונות
4. עבור לטאב **"תמונות דומות"**, כוונן את הסליידר ולחץ **"חפש"**
5. בחר אילו תמונות לשמור ואילו למחוק

## מבנה הפרויקט

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
│       └── api.ts           # API client
├── start.bat                # הרצה על Windows
└── start.sh                 # הרצה על Mac/Linux
```

## סקאלת הדמיון

| ציון | משמעות |
|------|--------|
| 0 | זהות מוחלטת — פיקסל לפיקסל |
| 1–2 | כפול עם עיבוד קל (crop, resize) |
| 3–4 | אותה תמונה, דחיסה שונה |
| 5–6 | אותה סצנה, זווית שונה |
| 7–8 | אותו אירוע |
| 9–10 | אותם אנשים, מיקום דומה |
