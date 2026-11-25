#!/bin/bash
# Analyse tous les rushes de rushes/ qui n'ont pas encore de blueprint.
# Usage : bash outils/analyser_lot.sh
cd "$(dirname "$0")/.." || exit 1
PY="${PYTHON:-python3}"
for f in rushes/*.mp4 rushes/*/*.mp4; do
  [ -e "$f" ] || continue
  n=$(basename "$f" .mp4)
  [ -f "recettes/projets/$n.blueprint.json" ] && { echo "deja fait: $n"; continue; }
  echo "=== $n ==="
  "$PY" outils/analyser_winner.py "$f" --modele small
done
echo "LOT TERMINE"
