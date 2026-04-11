"""
Update image paths from /assets/images/posts/X to the correct subfolder:
  - thumbnails: /assets/images/posts/thumbnails/X
  - body:       /assets/images/posts/body/X
"""
import os
import re
from pathlib import Path

SITE_ROOT = Path(__file__).resolve().parent.parent
THUMBS_DIR = SITE_ROOT / "assets" / "images" / "posts" / "thumbnails"
BODY_DIR = SITE_ROOT / "assets" / "images" / "posts" / "body"

# Build lookup sets from actual files on disk
thumb_files = {f.name for f in THUMBS_DIR.iterdir() if f.is_file()}
body_files = {f.name for f in BODY_DIR.iterdir() if f.is_file()}

print(f"Thumbnails: {len(thumb_files)} files")
print(f"Body: {len(body_files)} files\n")

SCAN_DIRS = [
    SITE_ROOT / "collections",
    SITE_ROOT / "pages",
    SITE_ROOT / "_layouts",
    SITE_ROOT / "_includes",
    SITE_ROOT / "_data",
    SITE_ROOT / "blog",
]
SCAN_FILES = [SITE_ROOT / "_config.yml"]

EXTENSIONS = {".html", ".md", ".yml", ".yaml", ".json", ".xml"}

# Match /assets/images/posts/FILENAME (not already in a subfolder)
PATTERN = re.compile(r'(/assets/images/posts/)([^/\s"\'<>]+)')

changes = []


def process_file(fpath):
    try:
        text = fpath.read_text(encoding="utf-8")
    except (UnicodeDecodeError, PermissionError):
        return

    original = text
    rel = fpath.relative_to(SITE_ROOT)

    def replacer(m):
        prefix = m.group(1)  # /assets/images/posts/
        fname = m.group(2)   # filename.webp
        if fname in thumb_files:
            changes.append((str(rel), fname, "thumbnails"))
            return f"{prefix}thumbnails/{fname}"
        elif fname in body_files:
            changes.append((str(rel), fname, "body"))
            return f"{prefix}body/{fname}"
        else:
            # Not in either folder, leave unchanged
            return m.group(0)

    text = PATTERN.sub(replacer, text)

    if text != original:
        fpath.write_text(text, encoding="utf-8")


for d in SCAN_DIRS:
    if not d.exists():
        continue
    for root, _dirs, files in os.walk(d):
        for fname in sorted(files):
            fpath = Path(root) / fname
            if fpath.suffix.lower() in EXTENSIONS:
                process_file(fpath)

for f in SCAN_FILES:
    if f.exists():
        process_file(f)

# Summary
thumb_count = sum(1 for _, _, t in changes if t == "thumbnails")
body_count = sum(1 for _, _, t in changes if t == "body")
files_changed = len(set(c[0] for c in changes))
print(f"Done: {len(changes)} refs updated ({thumb_count} thumbnail, {body_count} body) in {files_changed} files")
