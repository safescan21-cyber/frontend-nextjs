#!/usr/bin/env bash
# Puts a version of the website on the staging copy, https://next.foodpharmamachinery.com,
# so it can be checked before it goes live. Run on the server:
#   /var/www/frontend-next/scripts/stage.sh            latest main from GitHub
#   /var/www/frontend-next/scripts/stage.sh <branch>   a branch (or commit) pushed to GitHub
# Staging is its own checkout (/var/www/frontend-staging) and PM2 app (port 3002), but it
# uses the LIVE API and database: orders, enquiries and admin changes made there are real.
set -euo pipefail
DIR=/var/www/frontend-staging
REPO=https://github.com/safescan21-cyber/frontend-nextjs.git
REF="${1:-main}"

if [ ! -d "$DIR/.git" ]; then
  git clone -q "$REPO" "$DIR"
fi
cd "$DIR"
# Same settings as the live site (not in git)
cp /var/www/frontend-next/.env.production.local .env.production.local
chmod 600 .env.production.local

before=$(git rev-parse HEAD)
git fetch -q origin
if git rev-parse -q --verify "origin/$REF" >/dev/null; then
  git checkout -q -B "$REF" "origin/$REF"
else
  git checkout -q --detach "$REF"
fi
echo "Staging $(git log --oneline -1)"

if [ ! -d node_modules ] || ! git diff --quiet "$before" HEAD -- package-lock.json; then
  npm ci --no-audit --no-fund
fi

# Lower priority, so the build doesn't slow the live site
nice -n 10 npx next build

rm -rf .next/standalone/.next/static
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
cp .env.production.local .next/standalone/
chmod 600 .next/standalone/.env.production.local

if pm2 describe foodpharma-staging >/dev/null 2>&1; then
  pm2 restart foodpharma-staging
else
  pm2 start /var/www/frontend-next/ecosystem.staging.cjs
  pm2 save
fi

for i in $(seq 1 20); do
  code=$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3002/ || true)
  [ "$code" = 200 ] && break
  sleep 1
done
if [ "$code" = 200 ]; then
  echo "Staging: $(git log --oneline -1)  ->  https://next.foodpharmamachinery.com"
else
  echo "WARNING: staging answered $code. Check: pm2 logs foodpharma-staging --lines 50"
  exit 1
fi
