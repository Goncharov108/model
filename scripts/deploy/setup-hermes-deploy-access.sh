#!/usr/bin/env bash
# Однократная настройка: пользователь hermes может выкатывать web (и опционально api) на prod VPS.
# Запуск только от root на сервере 93.183.71.104.
set -euo pipefail

HERMES_USER="${HERMES_USER:-hermes}"
DEPLOY_USER="${DEPLOY_USER:-deploy}"
WEB_ROOT="${WEB_ROOT:-/var/www/model}"
WEB_DIR="${WEB_DIR:-/var/www/model/web}"
API_DIR="${API_DIR:-/opt/model/api}"
SUDOERS_FILE="/etc/sudoers.d/hermes-model-deploy"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "ERROR: запускайте от root" >&2
  exit 1
fi

if ! id "$HERMES_USER" &>/dev/null; then
  echo "ERROR: пользователь $HERMES_USER не найден" >&2
  exit 1
fi

if ! id "$DEPLOY_USER" &>/dev/null; then
  echo "ERROR: пользователь $DEPLOY_USER не найден" >&2
  exit 1
fi

echo "[setup] группа deploy + hermes"
usermod -aG "$DEPLOY_USER" "$HERMES_USER"

echo "[setup] каталоги prod"
mkdir -p "$WEB_DIR" "$API_DIR"
chown -R "$DEPLOY_USER:$DEPLOY_USER" "$WEB_ROOT" "$API_DIR"
chmod -R g+rwX "$WEB_ROOT" "$API_DIR"
find "$WEB_ROOT" "$API_DIR" -type d -exec chmod g+s {} +

echo "[setup] sudoers (только systemctl model-api + nginx reload)"
cat >"$SUDOERS_FILE" <<EOF
# Hermes: выкладка API и reload nginx без полного root
${HERMES_USER} ALL=(root) NOPASSWD: /usr/bin/systemctl restart model-api
${HERMES_USER} ALL=(root) NOPASSWD: /usr/bin/systemctl is-active model-api
${HERMES_USER} ALL=(root) NOPASSWD: /usr/bin/nginx -t
${HERMES_USER} ALL=(root) NOPASSWD: /usr/bin/systemctl reload nginx
EOF
chmod 440 "$SUDOERS_FILE"
visudo -cf "$SUDOERS_FILE"

echo "[setup] smoke от $HERMES_USER"
sudo -u "$HERMES_USER" test -w "$WEB_DIR" && echo "  web: запись OK" || {
  echo "  web: запись FAIL" >&2
  exit 1
}

echo "SETUP_OK: hermes может ./scripts/deploy/deploy-on-vps.sh из /home/hermes/work/model"
