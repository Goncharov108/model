#!/usr/bin/env bash
# WireGuard на VPS: wg0, NAT, один клиент (по умолчанию mac).
# Запуск на сервере: WG_CLIENT_NAME=mac bash setup-wireguard.sh
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive

WG_DIR=/etc/wireguard
CLIENT_NAME="${WG_CLIENT_NAME:-mac}"
WG_PORT="${WG_PORT:-51820}"
WG_NET="${WG_NET:-10.66.66}"
SERVER_IP="${WG_NET}.1"
CLIENT_IP="${WG_NET}.2"

apt-get update -y
apt-get install -y wireguard wireguard-tools curl

WAN="$(ip -4 route show default | awk '{print $5; exit}')"
[[ -n "$WAN" ]] || { echo "ERROR: не найден WAN-интерфейс" >&2; exit 1; }

umask 077
mkdir -p "$WG_DIR" /root/wireguard-clients

if [[ ! -f "$WG_DIR/server_private.key" ]]; then
  wg genkey | tee "$WG_DIR/server_private.key" | wg pubkey > "$WG_DIR/server_public.key"
fi
if [[ ! -f "$WG_DIR/${CLIENT_NAME}_private.key" ]]; then
  wg genkey | tee "$WG_DIR/${CLIENT_NAME}_private.key" | wg pubkey > "$WG_DIR/${CLIENT_NAME}_public.key"
fi

SERVER_PRIV="$(tr -d '\n' < "$WG_DIR/server_private.key")"
SERVER_PUB="$(tr -d '\n' < "$WG_DIR/server_public.key")"
CLIENT_PRIV="$(tr -d '\n' < "$WG_DIR/${CLIENT_NAME}_private.key")"
CLIENT_PUB="$(tr -d '\n' < "$WG_DIR/${CLIENT_NAME}_public.key")"

PUBLIC_IP="${WG_PUBLIC_IP:-}"
if [[ -z "$PUBLIC_IP" ]]; then
  PUBLIC_IP="$(curl -4 -fsS --max-time 5 ifconfig.me 2>/dev/null || true)"
fi
if [[ -z "$PUBLIC_IP" ]]; then
  PUBLIC_IP="$(hostname -I | awk '{print $1}')"
fi

cat > "$WG_DIR/wg0.conf" <<EOF
[Interface]
Address = ${SERVER_IP}/24
ListenPort = ${WG_PORT}
PrivateKey = ${SERVER_PRIV}
PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -A FORWARD -o %i -j ACCEPT; iptables -t nat -A POSTROUTING -o ${WAN} -j MASQUERADE
PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -D FORWARD -o %i -j ACCEPT; iptables -t nat -D POSTROUTING -o ${WAN} -j MASQUERADE

[Peer]
# ${CLIENT_NAME}
PublicKey = ${CLIENT_PUB}
AllowedIPs = ${CLIENT_IP}/32
EOF
chmod 600 "$WG_DIR/wg0.conf"

echo 'net.ipv4.ip_forward=1' > /etc/sysctl.d/99-wireguard.conf
sysctl -p /etc/sysctl.d/99-wireguard.conf >/dev/null

if command -v ufw >/dev/null; then
  ufw allow "${WG_PORT}/udp" comment 'WireGuard' >/dev/null 2>&1 || true
fi

systemctl enable wg-quick@wg0
systemctl restart wg-quick@wg0

cat > "/root/wireguard-clients/${CLIENT_NAME}.conf" <<EOF
[Interface]
PrivateKey = ${CLIENT_PRIV}
Address = ${CLIENT_IP}/32
DNS = 1.1.1.1, 8.8.8.8

[Peer]
PublicKey = ${SERVER_PUB}
Endpoint = ${PUBLIC_IP}:${WG_PORT}
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25
EOF
chmod 600 "/root/wireguard-clients/${CLIENT_NAME}.conf"

wg show wg0 2>/dev/null || true
echo "WIREGUARD_OK endpoint=${PUBLIC_IP}:${WG_PORT} client=/root/wireguard-clients/${CLIENT_NAME}.conf wan=${WAN}"
