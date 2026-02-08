cat > scripts/run_daily.sh <<'SH'
#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"

source .venv/bin/activate

python scripts/build_data.py --force-refresh

git add public/data/*.json
git commit -m "Update portfolio data" || exit 0
git push
SH

chmod +x scripts/run_daily.sh
