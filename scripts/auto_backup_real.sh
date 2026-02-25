#!/usr/bin/env bash
set -euo pipefail
ROOT="/home/goodsmash/.openclaw/skills/soul-marketplace"
SRC="$ROOT/src"
OUT="$ROOT/data/backups_real"
mkdir -p "$OUT"
TS="$(date -u +%Y%m%dT%H%M%SZ)"
LOG="$OUT/auto_backup_${TS}.log"

{
  echo "[backup] start $TS"
  cd "$SRC"
  python3 soul_backup.py backup --ipfs
  cp -f /home/goodsmash/.openclaw/workspace/SOUL.md "$OUT/SOUL_${TS}.md" || true
  cp -f /home/goodsmash/.openclaw/workspace/MEMORY.md "$OUT/MEMORY_${TS}.md" || true
  sha256sum "$OUT"/*"${TS}"* 2>/dev/null || true
  /home/goodsmash/.openclaw/skills/soul-marketplace/scripts/encrypt_backup_bundle.sh "$OUT" || true
  echo "[backup] done"
} | tee "$LOG"
