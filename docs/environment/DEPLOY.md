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

## Деплой с VPS (Hermes, пользователь `hermes`)

Hermes работает **на том же сервере**, что и prod. SSH на `root@93.183.71.104` **не нужен** — нужен локальный скрипт и права на каталоги.

| Что | Значение |
|-----|----------|
| Клон репо | `/home/hermes/work/model` |
| Ветка | `hermes/work` |
| Prod UI | `/var/www/model/web` |
| Prod API | `/opt/model/api` |
| Проверка UI | `https://live-model.ru/` |

### Однократно (root на сервере)

После обновления репо или копирования скрипта:

```bash
bash /home/hermes/work/model/scripts/deploy/setup-hermes-deploy-access.sh
```

Делает: `hermes` → группа `deploy`, групповая запись в `/var/www/model` и `/opt/model/api`, ограниченный sudo для `model-api` и `nginx reload`.

**SSH-ключ Hermes → `deploy`** (один раз, root): публичный ключ `hermes` в `/home/deploy/.ssh/authorized_keys`. Проверка от пользователя `hermes`:

```bash
ssh -o BatchMode=yes deploy@93.183.71.104 'echo ok'
```

После `ok` Hermes может при необходимости вызывать `deploy.sh` с `DEPLOY_USER=deploy` и `SSH_KEY=~/.ssh/id_ed25519`; для UI на том же VPS проще **`deploy-on-vps.sh`** (без SSH).

### Каждая выкладка UI (от пользователя `hermes`)

```bash
cd /home/hermes/work/model
git pull origin hermes/work   # если нужны свежие коммиты
./scripts/deploy/deploy-on-vps.sh
```

Только статика (по умолчанию API не трогаем):

```bash
SKIP_API=1 ./scripts/deploy/deploy-on-vps.sh
```

С API (если менялся `api/`):

```bash
SKIP_API=0 ./scripts/deploy/deploy-on-vps.sh
```

**Задача по UI не закрыта**, пока скрипт не завершился успешно и в ответе есть URL `https://live-model.ru/`. Фразы «код готов, деплoy позже» без блокера доступа — только если `setup-hermes-deploy-access.sh` ещё не запускали.

### Чего Hermes не делает без root/Cursor

- `DEPLOY_NGINX=1` / certbot / правка `/etc/nginx` — только через Cursor или root
- `fix-hermes-codex-runtime.sh` — патчи пакета Hermes, обычно Cursor/root
- push в `main` без согласия владельца

## Google-вход (аккаунт владельца)

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → **OAuth client ID** (Web).
2. **Authorized JavaScript origins:** `https://live-model.ru`, `http://localhost:5173`
3. Скопируйте **Client ID** и **Client secret** в:
   - сервер `/opt/model/api/.env`: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET`, `OWNER_EMAILS=ваш@gmail.com`
   - локально `web/.env.local`: `VITE_GOOGLE_CLIENT_ID` (тот же ID)
4. В клиенте OAuth → **Authorized redirect URIs:** `https://live-model.ru` (без пути в конце)
5. Перезапуск API: `systemctl restart model-api`
6. Выкладка UI: `./scripts/deploy/deploy.sh` или Hermes `deploy-on-vps.sh`

Вход идёт **в том же окне** (redirect), без всплывающего `gsi/select`, который часто зависает.

Пока в `OWNER_EMAILS` только ваша почта — вы единственный владелец и разработчик. Список пользователей: **Админ-панель → Пользователи**.

## Проверка

```bash
curl -s https://live-model.ru/api/health
curl -s -X POST https://live-model.ru/api/v1/text/inspect \
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
| `scripts/deploy/setup-hermes-deploy-access.sh` | Права hermes на prod (один раз, root) |
| `scripts/deploy/deploy-on-vps.sh` | Выкладка с VPS без SSH |

## Hermes (Telegram) и Git

- На VPS клон: `/home/hermes/work/model`, ветка **`hermes/work`**
- Deploy key **hermes-vps-deploy** → push в `origin/hermes/work`
- В Cursor: `./scripts/sync/pull-hermes-from-vps.sh`, журнал `docs/sync/HERMES_HANDOFF.md`

## Не копировать

- `private/`, секреты в `.env` на сервере — отдельно
