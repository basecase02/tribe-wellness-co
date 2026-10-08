#!/usr/bin/env bash
# Builds optimised WebP derivatives + JPEG Open Graph crops from the originals in assets/img/src.
# Requires: ffmpeg, cwebp (brew install ffmpeg webp). Run from the project root: bash tools/images.sh
set -euo pipefail
SRC=assets/img/src; OUT=assets/img; TMP="${TMPDIR:-/tmp}/twc-img"; mkdir -p "$TMP" "$OUT/og"
sizes_for() {
  case "$1" in
    hero-*|building-exterior-*|sled-push) echo "2000 1200" ;;
    team-hero|gym-floor) echo "1000" ;;
    logo|favicon) echo "" ;;
    *) echo "1000 600" ;;
  esac
}
for f in "$SRC"/*.png "$SRC"/*.jpg "$SRC"/*.jpeg "$SRC"/*.webp; do
  name=$(basename "$f"); base="${name%.*}"
  sizes=$(sizes_for "$base"); [ -z "$sizes" ] && continue
  ffmpeg -v error -y -i "$f" "$TMP/$base.png"
  for w in $sizes; do
    cwebp -quiet -q 80 -m 6 -af -mt -resize "$w" 0 "$TMP/$base.png" -o "$OUT/$base-$w.webp"
  done
  echo "✓ $base → $sizes"
done
# Logo: keep as PNG with transparency
ffmpeg -v error -y -i "$SRC/logo.png" "$OUT/logo.png"
# Open Graph images (1200×630 JPEG — Facebook/LinkedIn do not accept WebP)
og() { ffmpeg -v error -y -i "$SRC/$1" -vf "scale=1200:630:force_original_aspect_ratio=increase,crop=1200:630" -q:v 4 "$OUT/og/og-$2.jpg"; echo "✓ og-$2"; }
og hero-home.png home; og building-exterior-2.png about; og team-hero.webp team; og tile-group-classes.png timetable
og tile-one-on-one.png physio; og hero-memberships.png memberships; og hero-kickstarter.png kickstarter; og hero-join.png join
og hero-contact.png contact; og sled-push.jpg leaderboard; og group-smiling.jpeg community
rm -rf "$TMP"
