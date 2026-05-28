# Деплой

Цель: `web/dist` + API (`/api/health`, `/api/v1/text/inspect`) + nginx (SPA, `/api/`, `/hermes/`).

## Статус инфраструктуры

- [x] VPS **93.183.71.104** (RU-8, prod `live-model.ru`), Ubuntu 24.04, пользователь `deploy`
- [x] Старый NL VPS **104.171.141.49** — архив, DNS больше не указывает
- [x] Node 22, nginx, **model-api** (порт 3847)
- [x] Hermes dashboard `:9119`, префикс `/hermes/` — **нативный URL:** `https://live-model.ru/hermes/` (не `/master-admin/hermes`)
- [x] DNS **live-model.ru** → IP (работает по HTTP/HTTPS)
- [x] certbot HTTPS (Let's Encrypt, автообновление; редирект http→https)

## Деплой с Mac (рекомендуется)

Из корня репозитория:

```bash
./scripts/deploy/deploy.sh
DEPLOY_NGINX=1 ./scripts/deploy/deploy.sh
SKIP_API=1 ./scripts/deploy/deploy.sh
./scripts/deploy/fix-hermes-codex-runtime.sh
```

| Переменная | По умолчанию | Назначение |
|------------|--------------|------------|
| `DEPLOY_HOST` | `93.183.71.104` | IP или хост (prod `live-model.ru`) |
| `DEPLOY_USER` | `root` | SSH-пользователь |
| `SSH_KEY` | `~/.ssh/id_ed25519` | Ключ |
| `DEPLOY_NGINX` | `0` | `1` — выкатить `nginx-model.conf`, reload и **авто-HTTPS** (certbot) |
| `DEPLOY_RESTORE_HTTPS` | `1` | `0` — не вызывать `restore-nginx-https.sh` после nginx |
| `CERTBOT_EMAIL` | — | e-mail для **первого** выпуска сертификата, если на сервере ещё нет cert |
| `SKIP_WEB` / `SKIP_API` | `0` | `1` — пропустить часть |

Алиас: `./scripts/deploy_v1.sh` → тот же скрипт.

После выкладки UI: **Cmd+Shift+R** в браузере.

При `DEPLOY_NGINX=1` после reload автоматически вызывается `scripts/deploy/restore-nginx-https.sh` (certbot повторно вешает TLS на `live-model.ru`, `www`, `hermes.live-model.ru`). Конфиг в репо — только HTTP:80; HTTPS восстанавливается на сервере.

## Hermes hotfix после обновлений

Если после обновления `hermes` снова появляются ошибки вида:
- `NoneType object is not iterable`
- `Invalid API response ... response.output is empty`
- `Auxiliary title generation failed ...`

запусти:

```bash
DEPLOY_HOST=93.183.71.104 ./scripts/deploy/fix-hermes-codex-runtime.sh
```

Скрипт:
- вносит патчи в `run_agent.py` и `agent/title_generator.py` на сервере;
- проверяет синтаксис (`py_compile`);
- перезапускает `hermes-gateway`;
- делает smoke-test от пользователя `hermes`.

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
