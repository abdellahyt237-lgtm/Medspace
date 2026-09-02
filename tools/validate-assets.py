from pathlib import Path
import csv
import json

root = Path(__file__).resolve().parents[1]
specialties = json.loads((root / "data/specialties.json").read_text(encoding="utf-8"))
manifest = json.loads((root / "data/image-manifest.json").read_text(encoding="utf-8"))
rows = list(csv.DictReader((root / "lessons.csv").open(encoding="utf-8-sig", newline="")))

missing_specialties = []
for item in specialties:
    rel = item["image"].lstrip("/")
    path = root / rel
    if not path.exists():
        missing_specialties.append((item["name"], str(path)))

missing_lessons = []
for lesson in rows:
    item = manifest.get("lessons", {}).get(str(rows.index(lesson) + 1), {})
    rel = item.get("image", "").lstrip("/")
    path = root / rel if rel else None
    if not path or not path.exists():
        missing_lessons.append((rows.index(lesson) + 1, lesson.get("Title", ""), str(path or "")))

print(f"Specialties: {len(specialties)}")
print(f"Missing specialty assets: {len(missing_specialties)}")
print(f"Lessons: {len(rows)}")
print(f"Lesson visual assets: {len(manifest.get('lessons', {}))}")
print(f"Missing lesson assets: {len(missing_lessons)}")
print(f"Contexts: {', '.join(manifest.get('contexts', {}).keys())}")

for name, path in missing_specialties:
    print("- SPECIALTY", name, path)
for lesson_id, title, path in missing_lessons[:30]:
    print("- LESSON", lesson_id, title, path)
if len(missing_lessons) > 30:
    print(f"... and {len(missing_lessons) - 30} more")

raise SystemExit(1 if missing_specialties or missing_lessons else 0)
