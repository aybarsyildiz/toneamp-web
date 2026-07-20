#!/usr/bin/env bash
# Deploy the built site to netnucleus-hetzner-1 behind the kimlix traefik.
# Usage: npm run build && ./scripts/deploy.sh
set -euo pipefail

HOST="root@89.167.97.94"
KEY="$HOME/.ssh/id_ed25519"
REMOTE="/opt/toneamp-site"
SSH=(ssh -o IdentityFile="$KEY" "$HOST")

if [ ! -d dist ]; then
  echo "dist/ not found — run 'npm run build' first." >&2
  exit 1
fi

echo "→ ensuring remote layout at $REMOTE"
"${SSH[@]}" "mkdir -p $REMOTE/dist"

echo "→ syncing compose + nginx config"
scp -o IdentityFile="$KEY" docker-compose.yml nginx.conf "$HOST:$REMOTE/"

echo "→ shipping dist (into dist/, preserving the bind mount)"
# IMPORTANT: extract INTO dist/ — replacing the directory itself breaks the
# container's bind mount (nginx then 403s until a restart).
"${SSH[@]}" "rm -rf $REMOTE/dist/*"
tar czf - -C dist . | "${SSH[@]}" "tar xzf - -C $REMOTE/dist"

echo "→ (re)starting the container"
"${SSH[@]}" "cd $REMOTE && docker compose up -d && docker compose restart site"

echo "✓ deployed → https://toneamp.netnucleus.solutions"
