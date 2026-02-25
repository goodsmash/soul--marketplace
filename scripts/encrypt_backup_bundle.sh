#!/usr/bin/env bash
set -euo pipefail
# Encrypt backup artifacts at rest using openssl AES-256
# Requires BACKUP_PASSPHRASE in env

SRC_DIR="${1:-/home/goodsmash/.openclaw/skills/soul-marketplace/data/backups_real}"
PASS="${BACKUP_PASSPHRASE:-}"

if [ -z "$PASS" ]; then
  echo "BACKUP_PASSPHRASE missing; skipping encryption" >&2
  exit 0
fi

shopt -s nullglob
for f in "$SRC_DIR"/*; do
  [ -f "$f" ] || continue
  case "$f" in
    *.enc) continue ;;
  esac
  openssl enc -aes-256-cbc -salt -pbkdf2 -iter 100000 -in "$f" -out "$f.enc" -pass env:BACKUP_PASSPHRASE
  shred -u "$f" || rm -f "$f"
done

echo "encrypted backups in $SRC_DIR"
