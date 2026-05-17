# Контекст для агентов (Hermes / Cursor)

Репозиторий **model** — веб-интерфейс (`web/`), API (`api/`), документация (`docs/`), свод законов `SWOD_ZAKONOV.txt`.

- **Секреты:** только `private/` локально у владельца, не в Git.
- **Деплой статики:** `web/dist` → VPS `/var/www/model/web/`.
- **Hermes на сервере:** рабочая копия кода — `/home/hermes/vault/Projects/model` (клон этого репо).

При аудите кода смотреть `web/src`, `api/`, `docs/environment/`, не ожидать содержимого `private/`.
