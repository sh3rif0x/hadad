#!/usr/bin/env python3
import os
import hashlib
from pathlib import Path
from collections import defaultdict

def hash_file(path):
    h = hashlib.md5()
    with open(path, 'rb') as f:
        while chunk := f.read(8192):
            h.update(chunk)
    return h.hexdigest()

# Supported image extensions
exts = {'.jpg', '.webp', '.png', '.webp', '.jpge', '.webp4', '.gif', '.bmp'}

hashes = defaultdict(list)
files_dir = Path('.')

# Collect all image files and their hashes
for file in sorted(files_dir.iterdir()):
    if file.is_file() and file.suffix.lower() in exts:
        try:
            h = hash_file(file)
            hashes[h].append(file)
        except Exception as e:
            print(f"Error: {file} - {e}")

# Find and remove duplicates
removed = 0
for h, files in sorted(hashes.items()):
    if len(files) > 1:
        files_sorted = sorted(files, key=lambda x: x.name)
        print(f"\nDuplicate group:")
        for f in files_sorted:
            print(f"  {f.name} ({f.stat().st_size} bytes)")
        
        # Keep first, delete rest
        for f in files_sorted[1:]:
            print(f"  ✓ Removing: {f.name}")
            f.unlink()
            removed += 1

print(f"\n{'='*60}")
print(f"Total files removed: {removed}")
