#!/usr/bin/env bash
# Deploys the website on the VPS with no downtime and no errors while it builds. On the server:
#   /var/www/frontend-next/scripts/deploy.sh             latest code from GitHub (main)
#   /var/www/frontend-next/scripts/deploy.sh <commit>    an earlier version (rebuilt)
#   /var/www/frontend-next/scripts/deploy.sh --rollback  back to the previous release (seconds)
# How: the build runs here in /var/www/frontend-next, which the live site doesn't read; the
# finished build is copied to its own folder in /var/www/frontend-releases, tested on a spare
# port, and only then /var/www/frontend-live (the folder PM2 runs, ecosystem.config.cjs) is
# switched to it and PM2 swaps the 2 copies one at a time. The last 3 releases are kept.
set -euo pipefail
REPO=/var/www/frontend-next
RELEASES=/var/www/frontend-releases
LIVE=/var/www/frontend-live
APP=foodpharma-next
PORT=3001
TEST_PORT=3009
KEEP=3

health() { # port -> waits up to 30 s for the home page to answer 200
  local code=000
  for i in $(seq 1 30); do
    code=$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$1/" || true)
    [ "$code" = 200 ] && return 0
    sleep 1
  done
  echo "port $1 answered $code"
  return 1
}

switch_to() { # release folder -> makes it live
  ln -sfn "$1" "$LIVE.new" && mv -T "$LIVE.new" "$LIVE" # atomic swap of the link
  if pm2 describe "$APP" >/dev/null 2>&1; then
    pm2 reload "$APP" --update-env >/dev/null
  else
    pm2 start "$REPO/ecosystem.config.cjs" >/dev/null
    pm2 save >/dev/null
  fi
  health "$PORT"
}

mkdir -p "$RELEASES"

if [ "${1:-}" = "--rollback" ]; then
  current=$(readlink -f "$LIVE")
  # the release just before the live one (folder names sort by time)
  previous=$(ls -1d "$RELEASES"/*/ | sed 's#/$##' | grep -B1 -xF "$current" | head -1 || true)
  [ "$previous" = "$current" ] && previous=""
  [ -n "$previous" ] || { echo "No earlier release to go back to"; exit 1; }
  echo "Going back to $(basename "$previous")"
  switch_to "$previous" && echo "Live: $(basename "$previous")"
  exit
fi

cd "$REPO"
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

# Lower priority, so the build doesn't slow the live site
nice -n 10 npx next build

# The release: Next.js standalone server plus the files it needs next to server.js
release="$RELEASES/$(date +%Y%m%d-%H%M%S)-$(git rev-parse --short HEAD)"
cp -a .next/standalone "$release"
rm -rf "$release/.next/static"
cp -a .next/static "$release/.next/static"
cp -a public "$release/"
cp .env.production.local "$release/"
chmod 600 "$release/.env.production.local"

# Try it on a spare port before visitors see it
(cd "$release" && PORT=$TEST_PORT HOSTNAME=127.0.0.1 NODE_ENV=production node server.js >/tmp/release-test.log 2>&1) &
tester=$!
if ! health "$TEST_PORT"; then
  kill "$tester" 2>/dev/null || true
  echo "The new build did not start (log: /tmp/release-test.log). The live site is unchanged."
  rm -rf "$release"
  exit 1
fi
kill "$tester" 2>/dev/null || true
wait "$tester" 2>/dev/null || true

previous=$(readlink -f "$LIVE" 2>/dev/null || true)
if switch_to "$release"; then
  echo "Live: $(git log --oneline -1)"
else
  echo "WARNING: the site did not answer after the switch: going back"
  [ -n "$previous" ] && switch_to "$previous"
  exit 1
fi

# Keep the newest releases (never the live one)
ls -1d "$RELEASES"/*/ | sed 's#/$##' | head -n -"$KEEP" | grep -vxF "$(readlink -f "$LIVE")" | xargs -r rm -rf
