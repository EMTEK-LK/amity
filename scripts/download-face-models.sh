#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/public/models"
BASE="https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights"

mkdir -p "$DEST"

FILES=(
  tiny_face_detector_model-weights_manifest.json
  tiny_face_detector_model-shard1
  face_expression_model-weights_manifest.json
  face_expression_model-shard1
)

for f in "${FILES[@]}"; do
  echo "Downloading $f..."
  curl -fsSL "$BASE/$f" -o "$DEST/$f"
done

echo "Done. Models saved to $DEST"
