#!/usr/bin/env bash
# Восстанавливает HTTPS в nginx после выката HTTP-only конфигов (certbot --nginx).
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

DEPLOY_HOST="${DEPLOY_HOST:-93.183.71.104}"
DEPLOY_USER="${DEPLOY_USER:-root}"
SSH_PORT="${SSH_PORT:-22}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-}"
DEPLOY_RESTORE_HTTPS="${DEPLOY_RESTORE_HTTPS:-1}"

SSH_OPTS=(-p "$SSH_PORT" -o BatchMode=yes)
[[ -f "$SSH_KEY" ]] && SSH_OPTS+=(-i "$SSH_KEY")
SSH_TARGET="${DEPLOY_USER}@${DEPLOY_HOST}"

if [[ "$DEPLOY_RESTORE_HTTPS" != "1" ]]; then
  echo "[https] пропуск (DEPLOY_RESTORE_HTTPS=$DEPLOY_RESTORE_HTTPS)"
  exit 0
fi

if [[ -z "$DEPLOY_HOST" ]]; then
  echo "ERROR: задайте DEPLOY_HOST" >&2
  exit 1
fi

echo "[https] certbot → nginx на $DEPLOY_HOST ..."

ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "CERTBOT_EMAIL='${CERTBOT_EMAIL}' bash -s" <<'REMOTE'
set -euo pipefail

if ! command -v certbot >/dev/null 2>&1; then
  echo "[https] certbot не установлен — пропуск (установите certbot на сервере)"
  exit 0
fi

# Повторно применяет сертификат к site-блокам nginx (после HTTP-only deploy).
apply_cert() {
  local cert_name="$1"
  shift
  local -a domains=("$@")
  local domain_args=()
  local d

  for d in "${domains[@]}"; do
    domain_args+=(-d "$d")
  done

  if certbot certificates 2>/dev/null | grep -q "Certificate Name: ${cert_name}"; then
    echo "[https] deploy cert: ${cert_name} (${domains[*]})"
    certbot --nginx "${domain_args[@]}" --cert-name "$cert_name" --non-interactive --redirect
    return 0
  fi

  if [[ -z "${CERTBOT_EMAIL:-}" ]]; then
    echo "[https] cert ${cert_name} не найден; задайте CERTBOT_EMAIL для первичного выпуска"
    return 0
  fi

  echo "[https] obtain cert: ${cert_name} (${domains[*]})"
  certbot --nginx "${domain_args[@]}" --cert-name "$cert_name" --non-interactive --redirect \
    --agree-tos -m "$CERTBOT_EMAIL"
}

apply_cert "live-model.ru" live-model.ru www.live-model.ru
apply_cert "hermes.live-model.ru" hermes.live-model.ru

nginx -t
systemctl reload nginx

if ss -tlnp 2>/dev/null | grep -q ':443'; then
  echo "[https] OK: nginx слушает 443"
else
  echo "[https] WARN: порт 443 не слушается — проверьте certbot и firewall" >&2
  exit 1
fi
REMOTE

echo "[https] готово → https://live-model.ru/"
