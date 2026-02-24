---
name: backup
description: Create timestamped backups of files and directories. Use when the user wants to backup important files, create archives, save snapshots of work, or protect against data loss.
metadata:
  {
    "clawdbot":
      {
        "emoji": "💾",
        "homepage": "",
        "requires": { "bins": ["tar", "date"] },
      },
  }
---

# Backup

Create timestamped backups of files and directories.

## Features

- Timestamped backups
- Compressed archives (.tar.gz)
- Easy restore process
- Backup history tracking

## Usage

```bash
# Backup current directory
./scripts/backup.sh

# Backup specific directory
./scripts/backup.sh /path/to/source

# Backup to specific location
./scripts/backup.sh /source /destination
```

## Backup Format

- **Filename:** `backup_YYYYMMDD_HHMMSS.tar.gz`
- **Compression:** gzip
- **Preserves:** File permissions and structure

## Restore

```bash
# Extract backup
tar -xzf backup_20260219_120000.tar.gz

# Extract to specific location
tar -xzf backup_20260219_120000.tar.gz -C /destination
```

## Examples

- "Backup my documents folder"
- "Create a backup of this project"
- "Archive these files"
- "Save a snapshot of my work"

## Tips

- Run regularly for important files
- Store backups on different drive
- Keep multiple backup versions
- Test restores periodically
