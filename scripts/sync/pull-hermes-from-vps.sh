#!/usr/bin/env bash
# Скачивает с VPS состояние репо Hermes и журнал передачи для работы в Cursor.
set -euo pipefail

VPS="${HERMES_VPS:-root@104.171.141.49}"
SSH_KEY="${HERMES_SSH_KEY:-$HOME/.ssh/id_ed25519}"
REMOTE_REPO="/home/hermes/vault/Projects/model"
LOCAL_REPO="$(cd "$(dirname "$0")/../.." && pwd)"
OUT_DIR="$LOCAL_REPO/docs/sync"
SNAPSHOT="$OUT_DIR/hermes-vps-snapshot.txt"

mkdir -p "$OUT_DIR"

echo "→ Hermes на VPS: git и handoff"
ssh -i "$SSH_KEY" "$VPS" "sudo -u hermes bash -lc '
  set -e
  cd \"$REMOTE_REPO\"
  echo \"=== branch ===\"
  git branch -vv
  echo
  echo \"=== last 8 commits ===\"
  git log -8 --oneline --decorate
  echo
  echo \"=== vs origin/main (if fetch exists) ===\"
  git fetch origin 2>/dev/null || true
  git log origin/main..HEAD --oneline 2>/dev/null || echo \"(no origin/main or no ahead commits)\"
  echo
  echo \"=== working tree ===\"
  git status -sb
  echo
  echo \"=== diff stat vs HEAD (uncommitted) ===\"
  git diff --stat
  echo
  echo \"=== handoff file ===\"
  if [ -f docs/sync/HERMES_HANDOFF.md ]; then
    tail -n 80 docs/sync/HERMES_HANDOFF.md
  else
    echo \"(docs/sync/HERMES_HANDOFF.md на сервере ещё нет — только локально в Cursor)\"
  fi
'" | tee "$SNAPSHOT"

echo
echo "Снимок сохранён: $SNAPSHOT"
echo "Журнал передачи (локальный канон): $OUT_DIR/HERMES_HANDOFF.md"
