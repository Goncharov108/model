#!/usr/bin/env bash
# Единый деплой model: web/dist + api + (опционально) nginx + reload.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
WEB_DIR="$ROOT_DIR/web"
API_DIR="$ROOT_DIR/api"
NGINX_CONF="$ROOT_DIR/scripts/deploy/nginx-model.conf"

DEPLOY_HOST="${DEPLOY_HOST:-104.171.141.49}"
DEPLOY_USER="${DEPLOY_USER:-root}"
SSH_PORT="${SSH_PORT:-22}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519}"
SSH_OPTS=(-p "$SSH_PORT" -o BatchMode=yes)
SCP_OPTS=(-P "$SSH_PORT" -o BatchMode=yes)
[[ -f "$SSH_KEY" ]] && SSH_OPTS+=(-i "$SSH_KEY") && SCP_OPTS+=(-i "$SSH_KEY")

SSH_TARGET="${DEPLOY_USER}@${DEPLOY_HOST}"
RSYNC_SSH="ssh ${SSH_OPTS[*]}"

WEB_REMOTE_DIR="${WEB_REMOTE_DIR:-/var/www/model/web}"
API_REMOTE_DIR="${API_REMOTE_DIR:-/opt/model/api}"
API_SERVICE_NAME="${API_SERVICE_NAME:-model-api}"
DEPLOY_NGINX="${DEPLOY_NGINX:-0}"
SKIP_WEB="${SKIP_WEB:-0}"
SKIP_API="${SKIP_API:-0}"

if [[ -z "$DEPLOY_HOST" ]]; then
  echo "ERROR: задайте DEPLOY_HOST" >&2
  exit 1
fi

if [[ "$SKIP_WEB" != "1" ]]; then
  echo "[1/6] Сборка web..."
  cd "$WEB_DIR"
  npm ci
  npm run build
else
  echo "[1/6] Сборка web — пропуск (SKIP_WEB=1)"
fi

echo "[2/6] Каталоги на сервере..."
ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "mkdir -p '$WEB_REMOTE_DIR' '$API_REMOTE_DIR'"

if [[ "$SKIP_WEB" != "1" ]]; then
  echo "[3/6] web/dist → $WEB_REMOTE_DIR"
  rsync -az --delete -e "$RSYNC_SSH" "$WEB_DIR/dist/" "$SSH_TARGET:$WEB_REMOTE_DIR/"
else
  echo "[3/6] web — пропуск"
fi

if [[ "$SKIP_API" != "1" ]]; then
  echo "[4/6] api/ → $API_REMOTE_DIR"
  rsync -az --delete \
    --exclude 'node_modules' \
    --exclude '.env' \
    --exclude '*.log' \
    -e "$RSYNC_SSH" \
    "$API_DIR/" "$SSH_TARGET:$API_REMOTE_DIR/"

  echo "[5/6] npm install (prod) + restart $API_SERVICE_NAME"
  ssh "${SSH_OPTS[@]}" "$SSH_TARGET" \
    "cd '$API_REMOTE_DIR' && if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi && systemctl restart '$API_SERVICE_NAME' && systemctl is-active '$API_SERVICE_NAME'"
else
  echo "[4/6] api — пропуск"
  echo "[5/6] api — пропуск"
fi

echo "[6/6] Права deploy + nginx..."
NGINX_CMD="chown -R deploy:deploy /var/www/model /opt/model/api 2>/dev/null || true"
if [[ "$DEPLOY_NGINX" == "1" && -f "$NGINX_CONF" ]]; then
  scp "${SCP_OPTS[@]}" "$NGINX_CONF" "$SSH_TARGET:/etc/nginx/sites-available/model"
  NGINX_CMD="$NGINX_CMD && nginx -t && systemctl reload nginx"
fi
ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "$NGINX_CMD"

echo "DONE: deploy complete → http://${DEPLOY_HOST}/"
