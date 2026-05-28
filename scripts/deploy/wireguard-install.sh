#!/usr/bin/env bash
# С Mac: ставит WireGuard на VPS и кладёт клиентский .conf в private/
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
SETUP="$ROOT_DIR/scripts/deploy/setup-wireguard.sh"
PRIVATE_DIR="$ROOT_DIR/private"
CLIENT_NAME="${WG_CLIENT_NAME:-mac}"
OUT_CONF="$PRIVATE_DIR/WIREGUARD_${CLIENT_NAME}.conf"

DEPLOY_HOST="${DEPLOY_HOST:-104.171.141.49}"
DEPLOY_USER="${DEPLOY_USER:-root}"
SSH_PORT="${SSH_PORT:-22}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519}"
SSH_OPTS=(-p "$SSH_PORT" -o BatchMode=yes -o ConnectTimeout=20)
SCP_OPTS=(-P "$SSH_PORT" -o BatchMode=yes -o ConnectTimeout=20)
[[ -f "$SSH_KEY" ]] && SSH_OPTS+=(-i "$SSH_KEY") && SCP_OPTS+=(-i "$SSH_KEY")

SSH_TARGET="${DEPLOY_USER}@${DEPLOY_HOST}"

mkdir -p "$PRIVATE_DIR"
chmod 700 "$PRIVATE_DIR" 2>/dev/null || true

echo "→ SSH ${SSH_TARGET} (WireGuard)..."
scp "${SCP_OPTS[@]}" "$SETUP" "$SSH_TARGET:/tmp/setup-wireguard.sh"
ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "chmod +x /tmp/setup-wireguard.sh && WG_CLIENT_NAME='${CLIENT_NAME}' WG_PUBLIC_IP='${DEPLOY_HOST}' bash /tmp/setup-wireguard.sh"
scp "${SCP_OPTS[@]}" "$SSH_TARGET:/root/wireguard-clients/${CLIENT_NAME}.conf" "$OUT_CONF"
chmod 600 "$OUT_CONF"

echo ""
echo "Готово. Клиентский конфиг: $OUT_CONF"
echo "Mac: WireGuard → Импорт туннелей из файла → выбрать этот .conf → Включить."
echo "Порт UDP на VPS: 51820 (откройте в панели хостинга, если есть отдельный firewall)."
