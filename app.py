from __future__ import annotations

import csv
import re
from pathlib import Path
from urllib.parse import quote

from flask import Flask, jsonify, render_template, request

BASE_DIR = Path(__file__).resolve().parent
CSV_FILE = BASE_DIR / "lessons.csv"

app = Flask(__name__)
app.json.ensure_ascii = False
_cache: list[dict] | None = None


def drive_preview_url(url: str) -> str:
    if not url:
        return ""
    match = re.search(r"/file/d/([^/]+)", url)
    if match:
        return f"https://drive.google.com/file/d/{match.group(1)}/preview"
    match = re.search(r"[?&]id=([^&]+)", url)
    if match:
        return f"https://drive.google.com/file/d/{match.group(1)}/preview"
    return f"https://docs.google.com/gview?embedded=1&url={quote(url, safe='')}"


def module_icon(module: str) -> str:
    m = module.lower()
    mapping = [
        (("cardio",), "heart"),
        (("pneumo",), "lungs"),
        (("neuro",), "brain"),
        (("dermato",), "skin"),
        (("hépato", "hepato", "gastro", "digest"), "stomach"),
        (("néphro", "nephro", "rein"), "kidney"),
        (("gynéco", "gyneco"), "female"),
        (("pédiatr", "pediatr"), "child"),
        (("ortho",), "bone"),
        (("urolo",), "bladder"),
        (("ophtal", "ophthal"), "eye"),
        (("hémato", "hemato"), "blood"),
        (("endocr",), "thyroid"),
        (("infect",), "virus"),
        (("psychi",), "brain"),
        (("rhumat",), "bone"),
        (("anesth",), "anesthesia"),
        (("urgence", "réanimation", "reanimation"), "emergency"),
        (("pharmaco",), "pill"),
        (("oncolog", "cancérolog", "cancer"), "cancer"),
        (("nutrition",), "nutrition"),
        (("gériatr", "geriatr"), "elder"),
        (("travail",), "work"),
        (("douleur", "palliat"), "care"),
        (("santé publique", "sante publique"), "public"),
        (("médecine interne", "medecine interne"), "internal"),
        (("mpr",), "rehab"),
        (("cmf", "orl"), "ent"),
        (("mise à jour", "mise a jour"), "update"),
    ]
    for needles, icon in mapping:
        if any(n in m for n in needles):
            return icon
    return "medical"


def module_theme(module: str) -> str:
    m = module.lower()
    mapping = [
        (("gynéco", "gyneco"), "rose"),
        (("dermato",), "sun"),
        (("cardio",), "coral"),
        (("pneumo",), "sky"),
        (("neuro",), "violet"),
        (("hépato", "hepato", "gastro", "digest"), "orange"),
        (("néphro", "nephro", "rein"), "cyan"),
        (("pédiatr", "pediatr"), "mint"),
        (("urolo",), "indigo"),
        (("ophtal", "ophthal"), "blue"),
        (("hémato", "hemato"), "ruby"),
        (("endocr",), "amber"),
        (("infect",), "lime"),
        (("psychi",), "lavender"),
        (("rhumat", "ortho"), "teal"),
        (("urgence", "réanimation", "reanimation"), "red"),
        (("pharmaco",), "purple"),
        (("oncolog", "cancérolog", "cancer"), "crimson"),
        (("nutrition",), "green"),
        (("gériatr", "geriatr"), "gold"),
        (("anesth",), "slate"),
        (("travail",), "steel"),
        (("douleur", "palliat"), "plum"),
        (("santé publique", "sante publique"), "aqua"),
        (("médecine interne", "medecine interne"), "navy"),
        (("mpr",), "mint"),
        (("cmf", "orl"), "indigo"),
        (("mise à jour", "mise a jour"), "gray"),
    ]
    for needles, theme in mapping:
        if any(n in m for n in needles):
            return theme
    return "medical"


def load_lessons() -> list[dict]:
    global _cache
    if _cache is not None:
        return _cache

    rows: list[dict] = []
    with CSV_FILE.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        for idx, row in enumerate(reader, start=1):
            module = (row.get("Module") or "").strip()
            title = (row.get("Title") or "").strip()
            lesson_type = (row.get("Type") or "").strip()
            link = (row.get("Link") or "").strip()
            if not title and not module:
                continue
            rows.append({
                "id": idx,
                "module": module,
                "title": title,
                "type": lesson_type,
                "link": link,
                "preview_url": drive_preview_url(link),
                "icon": module_icon(module),
                "theme": module_theme(module),
            })
    _cache = rows
    return rows


@app.get("/")
def index():
    lessons = load_lessons()
    modules = sorted({x["module"] for x in lessons}, key=str.casefold)
    return render_template("index.html", total=len(lessons), module_count=len(modules))


@app.get("/api/modules")
def api_modules():
    lessons = load_lessons()
    counts: dict[str, int] = {}
    for lesson in lessons:
        counts[lesson["module"]] = counts.get(lesson["module"], 0) + 1
    items = [
        {
            "name": name,
            "count": count,
            "icon": module_icon(name),
            "theme": module_theme(name),
        }
        for name, count in sorted(counts.items(), key=lambda x: x[0].casefold())
    ]
    return jsonify(items)


@app.get("/api/lessons")
def api_lessons():
    lessons = load_lessons()
    q = request.args.get("q", "").strip().casefold()
    module = request.args.get("module", "").strip().casefold()
    try:
        page = max(1, int(request.args.get("page", 1)))
    except ValueError:
        page = 1
    try:
        limit = min(60, max(1, int(request.args.get("limit", 24))))
    except ValueError:
        limit = 24

    filtered = lessons
    if module:
        filtered = [x for x in filtered if x["module"].casefold() == module]
    if q:
        filtered = [
            x for x in filtered
            if q in x["title"].casefold()
            or q in x["module"].casefold()
            or q in x["type"].casefold()
        ]

    total = len(filtered)
    start = (page - 1) * limit
    end = start + limit
    return jsonify({
        "items": filtered[start:end],
        "page": page,
        "limit": limit,
        "total": total,
        "has_more": end < total,
    })


@app.get("/api/lessons/<int:lesson_id>")
def api_lesson(lesson_id: int):
    lesson = next((x for x in load_lessons() if x["id"] == lesson_id), None)
    if not lesson:
        return jsonify({"error": "Lesson not found"}), 404
    return jsonify(lesson)


@app.get("/api/lessons/<int:lesson_id>/adjacent")
def api_adjacent(lesson_id: int):
    lessons = load_lessons()
    q = request.args.get("q", "").strip().casefold()
    module = request.args.get("module", "").strip().casefold()
    filtered = lessons
    if module:
        filtered = [x for x in filtered if x["module"].casefold() == module]
    if q:
        filtered = [x for x in filtered if q in x["title"].casefold() or q in x["module"].casefold() or q in x["type"].casefold()]
    pos = next((i for i, x in enumerate(filtered) if x["id"] == lesson_id), -1)
    if pos < 0:
        return jsonify({"error": "Lesson not found"}), 404
    return jsonify({
        "index": pos,
        "total": len(filtered),
        "prev": filtered[pos - 1] if pos > 0 else None,
        "next": filtered[pos + 1] if pos < len(filtered) - 1 else None,
    })


@app.get("/api/health")
def health():
    lessons = load_lessons()
    return jsonify({"ok": True, "lessons": len(lessons)})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
