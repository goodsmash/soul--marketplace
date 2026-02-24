---
name: file_organizer
description: Automatically organize files by type into folders. Use when the user wants to clean up downloads folder, organize documents, sort files by type, or manage file clutter.
metadata:
  {
    "clawdbot":
      {
        "emoji": "📁",
        "homepage": "",
        "requires": { "bins": ["mv", "mkdir"] },
      },
  }
---

# File Organizer

Automatically organize files by type into categorized folders.

## Features

- Organize by file extension
- Create category folders automatically
- Safe moving (won't overwrite)
- Supports common file types

## Categories

- **Documents** - pdf, doc, docx, txt, md, rtf
- **Images** - jpg, jpeg, png, gif, bmp, webp, svg
- **Videos** - mp4, avi, mov, mkv, webm, flv
- **Audio** - mp3, wav, flac, aac, ogg, m4a
- **Archives** - zip, rar, 7z, tar, gz, bz2
- **Other** - Everything else

## Usage

```bash
# Organize current directory
./scripts/organize.sh

# Organize specific directory
./scripts/organize.sh /path/to/directory
```

## Examples

- "Organize my downloads folder"
- "Clean up this directory"
- "Sort files by type"
- "Organize my documents"

## Safety

- Files are moved (not copied) to save space
- Existing files in destination won't be overwritten
- Original directory structure is preserved
