#!/usr/bin/env bash
# Деплой model с самого VPS (пользователь hermes): сборка в клоне → prod-каталоги без SSH.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
WEB_DIR="$ROOT_DIR/web"
API_DIR="$ROOT_DIR/api"

WEB_REMOTE_DIR="${WEB_REMOTE_DIR:-/var/www/model/web}"
API_REMOTE_DIR="${API_REMOTE_DIR:-/opt/model/api}"
API_SERVICE_NAME="${API_SERVICE_NAME:-model-api}"
SKIP_WEB="${SKIP_WEB:-0}"
SKIP_API="${SKIP_API:-1}"
DEPLOY_NGINX="${DEPLOY_NGINX:-0}"
PUBLIC_URL="${PUBLIC_URL:-https://live-model.ru}"

require_writable() {
  local dir="$1"
  local hint="$2"
  if [[ ! -d "$dir" ]]; then
    echo "ERROR: каталог не найден: $dir" >&2
    exit 1
  fi
  if [[ ! -w "$dir" ]]; then
    echo "ERROR: нет записи в $dir" >&2
    echo "       $hint" >&2
    exit 1
  fi
}

run_systemctl() {
  if [[ "$(id -un)" == "root" ]]; then
    systemctl "$@"
    return
  fi
  if sudo -n true 2>/dev/null; then
    sudo systemctl "$@"
    return
  fi
  echo "ERROR: нужен sudo для systemctl $* (см. setup-hermes-deploy-access.sh)" >&2
  exit 1
}

run_nginx_reload() {
  if [[ "$(id -un)" == "root" ]]; then
    nginx -t && systemctl reload nginx
    return
  fi
  if sudo -n nginx -t 2>/dev/null && sudo -n systemctl reload nginx 2>/dev/null; then
    return
  fi
  echo "ERROR: нужен sudo для nginx reload (DEPLOY_NGINX=1)" >&2
  exit 1
}

echo "[vps] деплой из $ROOT_DIR → prod"

if [[ "$SKIP_WEB" != "1" ]]; then
  echo "[1/4] сборка web..."
  cd "$WEB_DIR"
  npm ci
  npm run build

  require_writable "$WEB_REMOTE_DIR" \
    "Запустите от root: bash scripts/deploy/setup-hermes-deploy-access.sh"

  echo "[2/4] web/dist → $WEB_REMOTE_DIR"
  rsync -r --delete --no-owner --no-group --no-times --omit-dir-times \
    "$WEB_DIR/dist/" "$WEB_REMOTE_DIR/"
else
  echo "[1/4] web — пропуск (SKIP_WEB=1)"
  echo "[2/4] web — пропуск"
fi

if [[ "$SKIP_API" == "1" ]]; then
  echo "[3/4] api — пропуск (SKIP_API=1, для API: SKIP_API=0)"
  echo "[4/4] api — пропуск"
else
  require_writable "$API_REMOTE_DIR" \
    "Запустите от root: bash scripts/deploy/setup-hermes-deploy-access.sh"

  echo "[3/4] api/ → $API_REMOTE_DIR"
  rsync -r --delete --no-owner --no-group --no-times --omit-dir-times \
    --exclude 'node_modules' \
    --exclude '.env' \
    --exclude '*.log' \
    "$API_DIR/" "$API_REMOTE_DIR/"

  echo "[4/4] npm install (prod) + restart $API_SERVICE_NAME"
  cd "$API_REMOTE_DIR"
  if [[ -f package-lock.json ]]; then
    npm ci --omit=dev
  else
    npm install --omit=dev
  fi
  run_systemctl restart "$API_SERVICE_NAME"
  run_systemctl is-active "$API_SERVICE_NAME"
fi

if [[ "$DEPLOY_NGINX" == "1" ]]; then
  echo "[nginx] reload..."
  run_nginx_reload
fi

echo "DONE: UI → ${PUBLIC_URL}/ (жёсткое обновление в браузере: Cmd+Shift+R)"
