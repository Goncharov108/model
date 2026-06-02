# Статус окружения model

Обновлять после деплоя и смены DNS.

## Продакшен (актуально)

| Проверка | Ожидание | Сейчас |
|----------|----------|--------|
| `curl -s -o /dev/null -w "%{http_code}" https://live-model.ru/` | 200 | ✅ |
| `curl -s https://live-model.ru/api/health` | `{"ok":true,...}` | ✅ |
| `dig +short live-model.ru @8.8.8.8` | 93.183.71.104 | проверять при смене DNS |
| Prod VPS | **93.183.71.104** (RU-8), Ubuntu 24.04 | ✅ |

Старый NL VPS **104.171.141.49** — архив, не использовать.

## Репозиторий

- URL: https://github.com/Goncharov108/model
- Ветки: `main`, `hermes/work`, feature-ветки Cursor
- CI: зелёный на push

## Hermes на VPS

| Параметр | Значение |
|----------|----------|
| Клон | `/home/hermes/work/model` |
| Ветка | `hermes/work` |
| Handoff | `docs/sync/HERMES_HANDOFF.md` |

## Секреты (где лежат)

| Секрет | Где |
|--------|-----|
| root VPS | `private/SERVER_ROOT.txt` |
| GitHub token | keyring `gh`, scope repo+workflow |
| SSH на Mac | `~/.ssh/id_ed25519` |

## Следующий шаг

1. Деплой UI: `./scripts/deploy/deploy.sh` из корня репо
2. Синхронизация с Hermes: `./scripts/sync/pull-hermes-from-vps.sh`
3. Проверка в браузере: `https://live-model.ru/master-admin/` (**Cmd+Shift+R**)
