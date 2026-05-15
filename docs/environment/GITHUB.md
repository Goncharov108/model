# GitHub

| Поле | Значение |
|------|----------|
| Владелец (slug) | `Goncharov108` *(уточнить, если на GitHub другое написание)* |
| Имя репозитория | `model` |
| Видимость | **private** |
| URL | https://github.com/Goncharov108/model |
| Ветка по умолчанию | `main` |
| Workflow CI | `.github/workflows/ci.yml` (имя workflow: **CI**) |

## Jobs CI

- **web:** `npm ci`, `lint`, `test`, `build` (каталог `web/`, Node из `.nvmrc`)
- **api-smoke:** запуск `api/server.mjs`, проверка `GET /health`

## Remote (локальная машина)

Проверка: `git remote -v`

Если remote ещё нет:

```bash
git remote add origin https://github.com/Goncharov108/model.git
git push -u origin main
```

Или через CLI (при авторизации `gh`):

```bash
gh repo create Goncharov108/model --private --source=. --remote=origin
git push -u origin main
```

**Push только по явному запросу владельца.** Force push в `main` — не без отдельного согласия.

После первого push — убедиться, что workflow **CI** зелёный на GitHub Actions.
