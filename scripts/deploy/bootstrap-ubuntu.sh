#!/usr/bin/env bash
# Первичная настройка Ubuntu на VPS (model v1). Запуск на сервере: sudo bash bootstrap-ubuntu.sh
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive

apt-get update -y
apt-get upgrade -y
apt-get install -y curl git nginx certbot python3-certbot-nginx ufw

# Node 22 (NodeSource)
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

id -u deploy &>/dev/null || useradd -m -s /bin/bash deploy

mkdir -p /var/www/model/web /opt/model/api
chown -R deploy:deploy /var/www/model /opt/model

ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "OK: node $(node -v), nginx $(nginx -v 2>&1 | head -1)"
echo "Дальше: положить web/dist и api/, настроить nginx — см. docs/environment/DEPLOY.md"
