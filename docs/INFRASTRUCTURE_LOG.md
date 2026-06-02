# Журнал инфраструктуры и деплоя (май 2026)

Хроника работ по репозиторию **model**: GitHub, VPS, домен live-model.ru, вкладка «Окружение» в Мастер-админе. **Без секретов** — пароли только в `private/`.

## Актуально (prod, 2026-05)

| Компонент | Статус |
|-----------|--------|
| Prod VPS | **93.183.71.104** (RU-8), Ubuntu 24.04 |
| Сайт | https://live-model.ru/ — SPA + HTTPS |
| API | https://live-model.ru/api/health |
| Hermes клон | `/home/hermes/work/model`, ветка `hermes/work` |
| Деплой с Mac | `./scripts/deploy/deploy.sh` |

Старый NL VPS **104.171.141.49** — **архив** (ниже в журнале — исторические записи).

---

## Итоговое состояние (архив NL, май 2026)

| Компонент | Статус |
|-----------|--------|
| GitHub `Goncharov108/model` (private) | push на `main`, CI **success** |
| VPS ztv **NL-8-NVMe**, Ubuntu 24.04 | **104.171.141.49**, hostname `vps1778841729.tech0.ru` |
| Сайт по IP | http://104.171.141.49/ — **200**, SPA |
| API | http://104.171.141.49/api/health — **ok** |
| SSH | ключ `mac108-model-deploy` в `/root/.ssh/authorized_keys` |
| DNS live-model.ru | **ожидает** A → 104.171.141.49 (сейчас 31.31.198.113) |
| HTTPS | после DNS → `certbot` |

## UI и код (Мастер-админ)

- Маршруты: `web/src/lib/appPaths.ts`
- Вкладки верхнего уровня: **Обзор**, **Окружение**, **Пользователи**, **Продвинутые настройки**
- «Окружение»: `MasterAdminEnvironmentWorkspace.tsx`, persist `model-environment-docs-v1`
- Документация в Git: `docs/environment/*`
- Скрипты деплоя: `scripts/deploy/*`

## GitHub

1. Локальный коммит: Мастер-админ, `docs/environment/`, merge с Initial commit на GitHub.
2. `gh auth login` (device flow), scope **workflow** для `.github/workflows/ci.yml`.
3. `git push -u origin main` → https://github.com/Goncharov108/model

Workflow **CI**: lint, test, build (`web/`), api-smoke.

## VPS (ztv.su)

| Параметр | Значение |
|----------|----------|
| Тариф | NL-8-NVMe, KVM NVMe, Нидерланды |
| ОС | Ubuntu 24.04 x64 |
| Ресурсы | 4 vCPU, 8 GB RAM, NVMe |
| Панель услуги | https://ztv.su/clientarea.php?action=productdetails&id=52079 |

**Доступ:** root по паролю из письма ztv (в `private/SERVER_ROOT.txt`). Отдельного пункта «SSH-ключи» в ЛК ztv нет — ключ добавлен вручную на сервере.

**На сервере установлено:** Node 22, nginx, certbot, ufw (22, 80, 443).

**Пути:**

- `/var/www/model/web` — статика `web/dist`
- `/opt/model/api` — `server.mjs`, systemd `model-api`
- nginx: `/etc/nginx/sites-available/model`

## Домен

- Регистратор: **reg.ru**, домен **live-model.ru**
- Требуемые записи: `@` и `www` → A **104.171.141.49**

## Файлы для повторного деплоя

```bash
# с Mac (актуально)
./scripts/deploy/deploy.sh
# или см. docs/environment/DEPLOY.md
```

## Правила проекта

- Закон 1: `private/` не в Git
- Пароли root — только `private/SERVER_ROOT.txt`, не в чат и не в `docs/`
- Агент выполняет терминальные команды сам: `.cursor/rules/terminal-agent.mdc`

## Связанные документы

- [docs/environment/README.md](./environment/README.md) — индекс окружения
- [docs/environment/STATUS.md](./environment/STATUS.md) — актуальный чеклист
- [docs/design/MASTER_ADMIN_DESIGNER_PROMPT.md](./design/MASTER_ADMIN_DESIGNER_PROMPT.md) — промпт для агента-дизайнера
- [web/docs/UI_OVERVIEW.md](../web/docs/UI_OVERVIEW.md) — обзор UI
