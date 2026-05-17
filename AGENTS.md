# Контекст для агентов (Hermes / Cursor)

Репозиторий **model** — веб-интерфейс (`web/`), API (`api/`), документация (`docs/`), свод законов `SWOD_ZAKONOV.txt`.

- **Секреты:** только `private/` локально у владельца, не в Git.
- **Деплой статики:** `web/dist` → VPS `/var/www/model/web/`.
- **Hermes на сервере:** рабочая копия — `/home/hermes/vault/Projects/model` (клон этого репо).

## Два агента, одна репа

| | **Hermes (TG)** | **Дас (Cursor)** |
|---|-----------------|------------------|
| Когда | Комп выключен, с телефона | Разработка UI, деплой, сложные правки |
| Где код | VPS, ветка **`hermes/work`** (или `hermes/*`) | Mac, обычно **`main`** + локальные правки |
| Синхрон | Пишет в **`docs/sync/HERMES_HANDOFF.md`**, коммитит | `scripts/sync/pull-hermes-from-vps.sh`, читает handoff |

**Hermes после сессии:** дописать блок в `docs/sync/HERMES_HANDOFF.md`, закоммитить; не пушить в `main` без слова владельца.

**Cursor:** по фразе «сверься с Hermes» — скрипт pull + handoff, потом предложить слияние или перенос патча.

При аудите кода смотреть `web/src`, `api/`, `docs/environment/`, не ожидать содержимого `private/`.
