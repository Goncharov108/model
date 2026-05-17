#!/usr/bin/env bash
set -euo pipefail

# Простой повторяемый деплой v1 для model.
# Что делает:
# 1) собирает web
# 2) копирует web/dist на сервер
# 3) копирует api/ на сервер (без node_modules)
# 4) перезапускает systemd-сервис API
#
# Пример:
# DEPLOY_HOST=1.2.3.4 DEPLOY_USER=deploy ./scripts/deploy_v1.sh

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
WEB_DIR="$ROOT_DIR/web"
API_DIR="$ROOT_DIR/api"

DEPLOY_HOST="${DEPLOY_HOST:-}"
DEPLOY_USER="${DEPLOY_USER:-deploy}"
SSH_PORT="${SSH_PORT:-22}"
SSH_TARGET="${DEPLOY_USER}@${DEPLOY_HOST}"

WEB_REMOTE_DIR="${WEB_REMOTE_DIR:-/var/www/model/web}"
API_REMOTE_DIR="${API_REMOTE_DIR:-/opt/model/api}"
API_SERVICE_NAME="${API_SERVICE_NAME:-model-api}"

if [[ -z "$DEPLOY_HOST" ]]; then
  echo "ERROR: задайте DEPLOY_HOST (пример: DEPLOY_HOST=1.2.3.4)" >&2
  exit 1
fi

echo "[1/5] Build web..."
cd "$WEB_DIR"
npm ci
npm run build

echo "[2/5] Ensure remote directories..."
ssh -p "$SSH_PORT" "$SSH_TARGET" "mkdir -p '$WEB_REMOTE_DIR' '$API_REMOTE_DIR'"

echo "[3/5] Upload web/dist -> $WEB_REMOTE_DIR"
rsync -az --delete -e "ssh -p $SSH_PORT" "$WEB_DIR/dist/" "$SSH_TARGET:$WEB_REMOTE_DIR/"

echo "[4/5] Upload api -> $API_REMOTE_DIR"
rsync -az --delete \
  --exclude 'node_modules' \
  --exclude '.env' \
  --exclude '*.log' \
  -e "ssh -p $SSH_PORT" \
  "$API_DIR/" "$SSH_TARGET:$API_REMOTE_DIR/"

echo "[5/5] Install prod deps + restart $API_SERVICE_NAME"
ssh -p "$SSH_PORT" "$SSH_TARGET" "cd '$API_REMOTE_DIR' && npm ci --omit=dev && sudo systemctl restart '$API_SERVICE_NAME' && sudo systemctl status '$API_SERVICE_NAME' --no-pager"

echo "DONE: deploy v1 complete"
