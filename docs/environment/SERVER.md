# Сервер

**Без паролей и приватных ключей в этом файле.**

## Текущий prod (актуально)

| Поле | Значение |
|------|----------|
| IPv4 | **93.183.71.104** |
| Hostname | `vps1779949387` (уточнять в панели провайдера) |
| ОС | Ubuntu 24.04 x64 |
| Домен | **live-model.ru** (HTTPS) |
| SSH | `root@93.183.71.104` или `deploy@93.183.71.104` + ключ `~/.ssh/id_ed25519` |
| Пароль root | только `private/SERVER_ROOT.txt` (не в Git) |

Подключение:

```bash
ssh -i ~/.ssh/id_ed25519 root@93.183.71.104
```

## Архив (не использовать)

| Поле | Значение |
|------|----------|
| Старый NL VPS | **104.171.141.49**, `vps1778841729.tech0.ru` (ztv NL-8-NVMe) |
| Статус | DNS и деплой перенесены на RU VPS |

## Пути деплоя (v1)

| Назначение | Путь |
|------------|------|
| Статика SPA (`web/dist`) | `/var/www/model/web` |
| API (`api/server.mjs`) | `/opt/model/api` |
| Hermes (клон репо) | `/home/hermes/work/model` |

## API за nginx

Прокси `location /api/` → `http://127.0.0.1:3847`

## Firewall

Открыть: **22**, **80**, **443**

## Деплой с Mac

См. [DEPLOY.md](./DEPLOY.md) — `./scripts/deploy/deploy.sh`
