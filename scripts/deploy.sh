#!/usr/bin/env bash
# Deploys the website on the VPS with no downtime. Run on the server:
#   /var/www/frontend-next/scripts/deploy.sh            latest code from GitHub (main)
#   /var/www/frontend-next/scripts/deploy.sh <commit>   an earlier version (going back)
# The old version keeps serving visitors until the new build is ready; PM2 then
# swaps the 2 copies one at a time (ecosystem.config.cjs).
set -euo pipefail
cd /var/www/frontend-next

before=$(git rev-parse HEAD)
if [ -n "${1:-}" ]; then
  git fetch -q origin
  git checkout -q "$1"
else
  git checkout -q main
  git pull -q --ff-only
fi
echo "Deploying $(git log --oneline -1)"

# New or changed packages
if ! git diff --quiet "$before" HEAD -- package-lock.json; then
  echo "package-lock.json changed: installing packages"
  npm ci --no-audit --no-fund
fi

npx next build

# Next.js standalone needs these next to server.js
rm -rf .next/standalone/.next/static
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
cp .env.production.local .next/standalone/
chmod 600 .next/standalone/.env.production.local

if pm2 describe foodpharma-next >/dev/null 2>&1; then
  pm2 reload foodpharma-next
else
  pm2 start ecosystem.config.cjs
  pm2 save
fi

# Health check
for i in $(seq 1 20); do
  code=$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3001/ || true)
  [ "$code" = 200 ] && break
  sleep 1
done
if [ "$code" = 200 ]; then
  echo "Live: $(git log --oneline -1)"
else
  echo "WARNING: the site answered $code after the deploy. Check: pm2 logs foodpharma-next --lines 50"
  echo "To go back: $0 $before"
  exit 1
fi
