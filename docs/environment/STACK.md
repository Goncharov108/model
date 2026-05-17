# Стек приложения

Имя репозитория: **model**. Monorepo: `web/` + `api/`.

## Фактическое состояние (репозиторий / CI)

- Web UI: Vite + React + TypeScript (`web/`)
- State: Zustand + persist (данные в `localStorage` браузера)
- API: Node.js `http` (`api/server.mjs`)
  - `GET /health`
  - `POST /api/v1/text/inspect`
- Node target: 22 (`.nvmrc`), engines: `>=20`
- CI: `.github/workflows/ci.yml`
  - web: `npm ci`, `lint`, `test`, `build`
  - api: `check`, `smoke`

## Прод-слой (на текущий момент)

- Прод-сервер и финальный runtime-контур ещё не зафиксированы в репозитории.
- Этот раздел заполняется после подключения production-хоста.

## Запланировано по канону-3

См. `CANON_PROJECT_MASTER.txt` (стратегический контур):

- Keycloak (IAM/OIDC)
- OpenFGA (ReBAC)
- PostgreSQL + RLS
- MinIO / Nextcloud
- NestJS backend
- Matrix/Synapse, Ollama, Telegram Bot API

Важно: внедрение идёт поэтапно, не всё сразу.
