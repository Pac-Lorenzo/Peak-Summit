#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="/Users/franciscolorenzo/Documents/PeakSummit/peak-summit-capital"
cd "$REPO_DIR" || exit 1

# Always operate on main
git checkout main

# Force local main to match remote main (no divergence ever)
git fetch origin
git reset --hard origin/main

# Activate environment
source .venv/bin/activate

# Rebuild portfolio data
python scripts/build_data.py

# Only commit if data changed
if git diff --quiet public/data; then
  echo "No changes in data. Skipping commit."
  exit 0
fi

git add public/data/*.json
git commit -m "Daily portfolio data update"
git push origin main