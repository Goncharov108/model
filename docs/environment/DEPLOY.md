# Деплой v1

Цель: статика `web/dist` + health API `GET /api/health` (через nginx).

## Предусловия

- SSH-доступ по ключу (не пароль в репозитории)
- Node 22, nginx, certbot
- Пользователь `deploy` и каталоги из [SERVER.md](./SERVER.md)

## Шаги

1. Локально или в CI: `cd web && npm ci && npm run build`
2. Скопировать `web/dist/` на сервер → `/var/www/model/web`
3. Скопировать `api/` (без `private/`) → `/opt/model/api`
4. systemd unit для `node server.mjs` (слушать `127.0.0.1:3847`)
5. nginx: SPA `try_files` + proxy `/api/` → backend
6. DNS на reg.ru → [DNS_REG_RU.md](./DNS_REG_RU.md)
7. certbot → HTTPS (`live-model.ru`, `www.live-model.ru`)
8. Проверка: `curl -I https://live-model.ru` и `curl https://live-model.ru/api/health`

## Не копировать на сервер

- `private/`
- `.env` с секретами из репозитория (создать отдельный env на сервере)

## CI/CD v2 (опционально)

Workflow `deploy.yml` на `main`: build + rsync/scp через GitHub Secrets (`SSH_HOST`, `SSH_USER`, `SSH_KEY`) — после ручного деплоя v1 и по запросу владельца.
