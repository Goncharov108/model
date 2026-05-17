# GitHub

| Поле | Значение |
|------|----------|
| Владелец | Goncharov108 |
| Репозиторий | **model** (private) |
| URL | https://github.com/Goncharov108/model |
| Ветка | `main` |
| Workflow | `.github/workflows/ci.yml` (**CI**) |

## CI

- **web:** `npm ci`, lint, test, build
- **api-smoke:** `node api/server.mjs`, `GET /health`

Статус: зелёный после push (2026-05-15).

## Локальный remote

```bash
git remote -v
# origin  https://github.com/Goncharov108/model.git
```

Авторизация: `gh auth` (scopes: `repo`, `workflow`, `gist`, `read:org`).
