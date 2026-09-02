# MedSpace

مكتبة دروس طبية Flask + HTML/CSS/JS، مع تتبع تقدم محلي، تخصصات ملونة، قارئ Google Drive، وبحث وتحميل تدريجي.

## تشغيل في Termux

```bash
termux-setup-storage
cd ~/storage/downloads/medspace
pip install -r requirements.txt
python app.py
```

ثم افتح:

`http://127.0.0.1:5000`

## التقدم الدراسي

يُحفظ تقدم الدراسة في `localStorage` داخل المتصفح تحت المفتاح:

`medspace.progress.v2`

البيانات تشمل الدروس المكتملة، النشاط الأخير، وآخر درس. يوجد داخل الموقع زر لتصدير واستيراد التقدم بصيغة JSON.

> ملاحظة: هذا التخزين محلي على نفس المتصفح/الجهاز. حذف بيانات الموقع أو المتصفح قد يحذف التقدم، لذلك استخدم التصدير كنسخة احتياطية.

## Google Drive

يتم تحويل روابط Drive إلى `/preview` للعرض داخل قارئ الموقع، مع زر احتياطي لفتح الملف الأصلي. صلاحيات Google Drive تظل مطبقة ولا يمكن تجاوزها.


## MedSpace v3 — Specialty Visual Asset System
- 29 local specialty illustrations under `static/assets/specialties/`.
- `data/specialties.json` is the source of truth for image, accent color, theme and alt text.
- `/api/modules` now exposes `image`, `accent`, `alt` and `id` without removing the existing module fields.
- Entering a specialty opens a dedicated in-page specialty view whose accent/soft background/borders are derived from that specialty's image palette.
- Lesson cards also show the specialty image.
- Run `python tools/validate-assets.py` to validate the 29 assets.

These are original local SVG medical illustrations for the prototype. The architecture is ready for replacement with licensed WebP artwork later without changing the frontend contract.

## v4 Image Asset System

- `data/image-manifest.json` is the visual source of truth.
- 29 specialty assets live under `static/assets/specialties/`.
- Every lesson in `lessons.csv` has a dedicated local course visual under `static/assets/courses/<specialty-id>/lesson-<id>.svg` (680 assets in this build).
- `static/js/image-system.js` resolves visuals by context: `specialty_card`, `specialty_hero`, `course_card`, `course_hero`, `reader_cover`.
- The same visual carries the specialty accent, so page accents stay visually close to the image's dominant color.
- `/api/images` exposes the manifest for future admin/CMS integration.
- Missing assets fall back to `static/assets/ui/image-fallback.svg`.
- Image frames intentionally change size by context: compact on cards, large on specialty pages, and expanded at the top of the reader before the PDF.
- The generated course visuals are local editorial placeholders/visual covers, not externally sourced medical photographs. They can be replaced one-by-one with licensed medical artwork without changing the frontend contract.
