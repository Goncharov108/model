# Деплой

Цель: `web/dist` + API (`/api/health`, `/api/v1/text/inspect`) + nginx (SPA, `/api/`, `/hermes/`).

## Статус инфраструктуры

- [x] VPS **104.171.141.49**, Ubuntu 24.04, пользователь `deploy`
- [x] Node 22, nginx, **model-api** (порт 3847)
- [x] Hermes dashboard `:9119`, префикс `/hermes/`
- [ ] DNS **live-model.ru** → IP (проверить у регистратора)
- [ ] certbot HTTPS

## Деплой с Mac (рекомендуется)

Из корня репозитория:

```bash
# только web + api (как в законе 15 для UI)
./scripts/deploy/deploy.sh

# + обновить nginx (после правок scripts/deploy/nginx-model.conf)
DEPLOY_NGINX=1 ./scripts/deploy/deploy.sh

# только статика
SKIP_API=1 ./scripts/deploy/deploy.sh
```

Переменные:

| Переменная | По умолчанию | Назначение |
|------------|--------------|------------|
| `DEPLOY_HOST` | `104.171.141.49` | IP или хост |
| `DEPLOY_USER` | `root` | SSH-пользователь |
| `SSH_KEY` | `~/.ssh/id_ed25519` | Ключ |
| `DEPLOY_NGINX` | `0` | `1` — выкатить `nginx-model.conf` и reload |
| `SKIP_WEB` / `SKIP_API` | `0` | `1` — пропустить часть |

Алиас: `./scripts/deploy_v1.sh` → тот же скрипт.

После выкладки UI: **Cmd+Shift+R** в браузере.

## Проверка

```bash
curl -s http://104.171.141.49/api/health
curl -s -X POST http://104.171.141.49/api/v1/text/inspect \
  -H 'Content-Type: application/json' \
  -d '{"text":"проверка после деплоя"}'
```

## Скрипты первичной настройки сервера

| Файл | Назначение |
|------|------------|
| `scripts/deploy/bootstrap-ubuntu.sh` | Пакеты (может быть интерактивен) |
| `scripts/deploy/setup-server-noninteractive.sh` | Донастройка без вопросов |
| `scripts/deploy/nginx-model.conf` | Виртуальный хост |
| `scripts/deploy/model-api.service` | systemd unit API |
| `scripts/deploy/hermes-dashboard.service` | systemd Hermes |

## Hermes (Telegram) и Git

- На VPS клон: `/home/hermes/vault/Projects/model`, ветка **`hermes/work`**
- Deploy key **hermes-vps-deploy** → push в `origin/hermes/work`
- В Cursor: `./scripts/sync/pull-hermes-from-vps.sh`, журнал `docs/sync/HERMES_HANDOFF.md`

## Не копировать

- `private/`, секреты в `.env` на сервере — отдельно
