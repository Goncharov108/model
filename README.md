# model

Репозиторий проекта **model**: веб-интерфейс (`web/`) и API (`api/`) с базовой CI-проверкой.

## Структура

- `web/` — React + TypeScript + Vite (основной UI)
- `api/` — минимальный Node.js HTTP-сервис (placeholder)
- `docs/environment/` — операционные документы по окружению и деплою
- `private/` — локальные приватные файлы (не коммитить)

## Требования

- Node.js `>=20` (в репозитории зафиксировано `.nvmrc = 22`)
- npm `>=10`

## Быстрый старт

### 1) Web

```bash
cd web
npm ci
npm run dev
```

Полезные команды:

```bash
npm run lint
npm run test
npm run build
```

### 2) API

```bash
cd api
npm run start
```

По умолчанию API слушает `127.0.0.1:3847` и отдаёт:

- `GET /health` → `{ "ok": true, ... }`

Переменные окружения:

- `PORT` — порт API (по умолчанию `3847`)
- `HOST` — хост (по умолчанию `127.0.0.1`)

Если порт занят, сервис завершится с понятной ошибкой:

- `PORT_IN_USE <host>:<port>. Освободите порт или задайте PORT.`

Проверки API:

```bash
npm run check   # синтакс-проверка server.mjs и smoke-скрипта
npm run smoke   # поднимает API на случайном свободном порту и проверяет /health
npm run test    # check + smoke
```

## CI

GitHub Actions (`.github/workflows/ci.yml`) запускает:

- `web`: `npm ci`, `lint`, `test`, `build`
- `api`: `npm run check`, `npm run smoke`

## Деплой (кратко)

- Статика web: `web/dist` → `/var/www/model/web/` на VPS
- Детали: `docs/environment/DEPLOY.md`
