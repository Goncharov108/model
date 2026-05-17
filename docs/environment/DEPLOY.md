# Деплой v1

Цель: выкладка `web/dist` и запуск API на сервере.

## Минимальные предусловия

- SSH-доступ по ключу
- На сервере установлены: Node 22, nginx, systemd
- Созданы каталоги:
  - `/var/www/model/web`
  - `/opt/model/api`

## Рекомендуемый способ (единый скрипт)

Из корня репозитория:

```bash
DEPLOY_HOST=<IP_ИЛИ_HOST> DEPLOY_USER=deploy ./scripts/deploy_v1.sh
```

Опциональные переменные:

- `SSH_PORT` (по умолчанию `22`)
- `WEB_REMOTE_DIR` (по умолчанию `/var/www/model/web`)
- `API_REMOTE_DIR` (по умолчанию `/opt/model/api`)
- `API_SERVICE_NAME` (по умолчанию `model-api`)

Скрипт делает:

1. `npm ci && npm run build` в `web/`
2. Копирование `web/dist` на сервер
3. Копирование `api/` на сервер
4. `npm ci --omit=dev` на сервере
5. `systemctl restart <API_SERVICE_NAME>`

## Проверка после деплоя

```bash
curl -I https://live-model.ru
curl -s https://live-model.ru/api/health
curl -s -X POST https://live-model.ru/api/v1/text/inspect \
  -H 'Content-Type: application/json' \
  -d '{"text":"проверка после деплоя"}'
```

## Важно

- Не копировать `private/`
- Не хранить секреты в репозитории
- `.env` сервера создавать отдельно
