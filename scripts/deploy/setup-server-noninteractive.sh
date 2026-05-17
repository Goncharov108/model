#!/usr/bin/env bash
# Донастройка VPS после прерванного bootstrap (неинтерактивно).
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive
export NEEDRESTART_MODE=a

dpkg --configure -a -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" || true

apt-get update -y
apt-get install -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" \
  curl git nginx certbot python3-certbot-nginx ufw

if ! command -v node >/dev/null || ! node -v | grep -q '^v22'; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

id -u deploy &>/dev/null || useradd -m -s /bin/bash deploy
mkdir -p /var/www/model/web /opt/model/api
chown -R deploy:deploy /var/www/model /opt/model

ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable || true

echo "SETUP_OK node=$(node -v) nginx=$(nginx -v 2>&1)"
