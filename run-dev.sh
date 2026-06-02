#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

quote_for_shell() {
  printf "%s" "$1" | sed "s/'/'\\\\''/g; 1s/^/'/; \$s/\$/'/"
}

ROOT_DIR_QUOTED=$(quote_for_shell "$ROOT_DIR")

if command -v osascript >/dev/null 2>&1; then
  osascript <<EOF
tell application "Terminal"
  activate
  do script "cd $ROOT_DIR_QUOTED && npm run backend:dev"
  do script "cd $ROOT_DIR_QUOTED && npm run dev"
end tell
EOF
  exit 0
fi

printf "osascript is not available. Starting both services in this terminal instead.\n"
npm run backend:dev &
npm run dev
