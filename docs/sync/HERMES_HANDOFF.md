# Передача работы: Hermes (Telegram) → Дас (Cursor)

Единый журнал того, что сделано с **Hermes** на VPS, чтобы в Cursor не искать по чату TG.

## Как писать (Hermes на сервере)

После **значимой** сессии (коммит, деплой, правки в `api/` / `web/` / `docs/`, настройка сервиса):

1. Дописать блок ниже по шаблону.
2. Закоммитить в ветку **`hermes/work`** (не в `main` без согласия владельца).
3. По возможности: `git push origin hermes/work` (если настроен deploy key).

### Шаблон блока

```markdown
## YYYY-MM-DD HH:MM (MSK) — краткий заголовок

- **Ветка:** hermes/work @ <hash>
- **Сделано:** …
- **Файлы:** …
- **Деплой / сервисы:** да/нет, что именно
- **Нужно в Cursor:** что проверить / слить / откатить
- **Риски:** конфликты с локальной работой, секреты, не трогать …
```

---

## 2026-05-17 16:29 (MSK) — Этап 2 для «ТГ заметок»: умная чистка и быстрые действия

- **Ветка:** `hermes/work` @ `d8f8975`
- **Сделано:**
  - добавлена дедупликация заметок при импорте Telegram JSON;
  - добавлены авто-теги (по контенту и доменам ссылок);
  - добавлен авто-приоритет (`Важно / Обычно / Позже`);
  - добавлены статусы заметки (`Входящие / В работе / Архив`) и быстрые кнопки действий в UI;
  - добавлены фильтры по статусу + расширенный поиск (текст/ссылки/теги);
  - расширены unit-тесты на дедуп/теги/приоритет.
- **Файлы:**
  - `web/src/domain/telegramNotes.ts`
  - `web/src/lib/telegramNotes.ts`
  - `web/src/lib/telegramNotes.test.ts`
  - `web/src/store/telegramNotesStore.ts`
  - `web/src/routes/MasterAdminIncomingWorkspace.tsx`
- **Деплой / сервисы:** нет
- **Нужно в Cursor:**
  - проверить UX на реальном export JSON из Telegram;
  - решить отдельно старые TS-проблемы `HermesTerminalChat.tsx` (они по-прежнему ломают `npm run build`).
- **Риски:** возможны конфликты при одновременных правках admin-UI в Cursor; логику тегов/приоритета стоит откалибровать на живых данных.

## 2026-05-17 — начальная фиксация (Дас)

- **Ветка на VPS:** `feat/deploy-v1-and-api-inspect` @ `99376d1` (ещё не на GitHub — у `hermes` нет push).
- **Сделано Hermes:** `scripts/deploy_v1.sh`, доработки `api/server.mjs`, `openapi.yaml`, smoke, `docs/environment/DEPLOY.md` и др.
- **Нужно в Cursor:** при слиянии сравнить с локальными `scripts/deploy/` и незакоммиченным UI Hermes; решить одну линию деплоя.
- **Настройки Hermes:** русский язык (`SOUL.md`, `display.language=ru`, `channel_prompts` для TG).

---

## 2026-05-17 — deploy key + единый деплой (Дас)

- **GitHub:** deploy key `hermes-vps-deploy`, ветка **`hermes/work`** на origin (push с VPS работает).
- **Слияние:** API inspect, smoke, `scripts/deploy/deploy.sh` (вместо голого `deploy_v1.sh`), правка пути `/v1/text/inspect` под nginx.
- **main:** слито с `hermes/work`, выкат через `deploy.sh`.

---

<!-- Новые блоки — только ВЫШЕ этой строки, новые сверху -->
