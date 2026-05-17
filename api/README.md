# API (v1 draft)

Минимальный Node.js API с двумя рабочими endpoint'ами:

- `GET /health` — проверка живости сервиса
- `POST /api/v1/text/inspect` — базовый анализ текста (`textLength`, `wordCount`, `preview`)

## Запуск

```bash
cd api
npm start
```

Проверка health:

```bash
curl -s http://127.0.0.1:3847/health
```

Проверка text/inspect:

```bash
curl -s -X POST http://127.0.0.1:3847/api/v1/text/inspect \
  -H 'Content-Type: application/json' \
  -d '{"text":"Привет, это тестовая строка"}'
```

Порт по умолчанию `3847`, переопределение: `PORT=4000 npm start`.

## Проверки

```bash
npm run check   # синтаксис
npm run smoke   # поднимает API на случайном порту и проверяет оба endpoint
npm run test    # check + smoke
```

Контракт: `openapi.yaml`.

Заготовка миграций и RLS: каталог `migrations/` и `docs/RLS_NOTES.md`.
