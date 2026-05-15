# Стек приложения

Имя репозитория: **model**. Monorepo: `web/` + `api/`.

## Сейчас на сервере / в проде

| Слой | Технология | Версия | Где | Заметка |
|------|------------|--------|-----|---------|
| *(заполнить после деплоя)* | | | | |

## В репозитории (локально / CI)

| Слой | Технология | Версия | Где | Заметка |
|------|------------|--------|-----|---------|
| Web UI | Vite + React + TypeScript | vite ^8.0.12, react ^19.2.6, TS ~6.0.2 | `web/` | SWOD закон 6 |
| Маршрутизация | react-router-dom | ^7.15.1 | `web/` | |
| Состояние | zustand + persist | ^5.0.13 | `web/src/store/` | localStorage |
| Стили | Tailwind CSS | ^4.3.0 | `web/` | @tailwindcss/vite |
| API | Node `http` (placeholder) | `server.mjs` | `api/` | `GET /health`, PORT **3847** |
| Node (целевой) | — | **22** (`.nvmrc`) | корень | engines web: >=20 |
| CI | GitHub Actions | workflow `CI` | `.github/workflows/ci.yml` | lint, test, build, api-smoke |

## Запланировано по канону-3

См. `CANON_PROJECT_MASTER.txt` (продукт «Мастер», не имя репозитория). **Не внедрять всё сразу** — только документировать:

- Keycloak (IAM, OIDC)
- OpenFGA (ReBAC)
- PostgreSQL + RLS
- MinIO / Nextcloud
- NestJS backend (вместо placeholder)
- Matrix/Synapse, Ollama, Telegram Bot API — стратегический контур
