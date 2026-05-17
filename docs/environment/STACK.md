# Стек приложения

Monorepo **model**: `web/` + `api/`.

## Сейчас на сервере (прод)

| Слой | Технология | Версия | Где | Заметка |
|------|------------|--------|-----|---------|
| ОС | Ubuntu | 24.04 LTS | VPS ztv NL-8 | 104.171.141.49 |
| Web (статика) | Vite build → HTML/JS/CSS | из коммита main | `/var/www/model/web` | nginx |
| API | Node `http` placeholder | server.mjs | `/opt/model/api` | systemd, :3847 |
| Прокси | nginx | 1.24 | `/etc/nginx/sites-available/model` | `/api/` → backend |
| Node runtime | NodeSource | v22.x | сервер | |
| TLS | — | — | — | certbot после DNS |

## В репозитории (локально / CI)

| Слой | Технология | Версия | Где |
|------|------------|--------|-----|
| Web UI | Vite + React + TS | vite ^8, react ^19 | `web/` |
| Маршрутизация | react-router-dom | ^7.15 | `web/` |
| Состояние | zustand + persist | ^5.0 | `web/src/store/` |
| Стили | Tailwind CSS | ^4.3 | `web/` |
| API | Node placeholder | server.mjs | `api/` |
| Node | .nvmrc | 22 | корень |
| CI | GitHub Actions | CI workflow | `.github/workflows/ci.yml` |

## Запланировано (канон-3)

См. `CANON_PROJECT_MASTER.txt` — Keycloak, OpenFGA, PostgreSQL, MinIO, NestJS, … **не внедрять без плана**.
