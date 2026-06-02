#!/usr/bin/env bash
set -euo pipefail

# Re-encodes public/*.mp4 for faster web playback:
# - H.264 with CRF 23 (high quality, smaller files)
# - Max width 1280px (enough for mobile + desktop preview)
# - faststart moves metadata to the front for progressive playback
#
# Requires: ffmpeg (brew install ffmpeg)

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg is required. Install with: brew install ffmpeg"
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
INPUT_DIR="$ROOT/public"
BACKUP_DIR="$ROOT/public/originals"

mkdir -p "$BACKUP_DIR"

for input in "$INPUT_DIR"/video*.mp4; do
  [ -f "$input" ] || continue

  name="$(basename "$input")"
  backup="$BACKUP_DIR/$name"

  if [ ! -f "$backup" ]; then
    cp "$input" "$backup"
    echo "Backed up $name"
  fi

  tmp="${input}.optimized.tmp.mp4"

  ffmpeg -y -i "$input" \
    -c:v libx264 -preset slow -crf 23 \
    -vf "scale='min(1280,iw)':-2" \
    -movflags +faststart \
    -c:a aac -b:a 128k \
    "$tmp"

  mv "$tmp" "$input"
  echo "Optimized $name ($(du -h "$input" | cut -f1))"
done

echo "Done. Originals saved in public/originals/"
