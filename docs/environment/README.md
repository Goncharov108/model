# Документация окружения (репозиторий model)

Индекс инфраструктуры, деплоя и зеркала вкладки **Мастер-админ → Окружение**. **Без секретов.**

| Файл | Содержание |
|------|------------|
| [STATUS.md](./STATUS.md) | Актуальные проверки (IP, DNS, SSL) |
| [STACK.md](./STACK.md) | Стек: прод / репо / план |
| [GITHUB.md](./GITHUB.md) | Репозиторий, CI |
| [DNS_REG_RU.md](./DNS_REG_RU.md) | live-model.ru, A-записи |
| [SERVER.md](./SERVER.md) | VPS ztv, SSH, пути |
| [DEPLOY.md](./DEPLOY.md) | Деплой и скрипты |

**Журнал работ:** [../INFRASTRUCTURE_LOG.md](../INFRASTRUCTURE_LOG.md)

**Obsidian-vault (личные заметки в Git):** [../vault/README.md](../vault/README.md)

**UI (дизайн):** [../design/MASTER_ADMIN_DESIGNER_PROMPT.md](../design/MASTER_ADMIN_DESIGNER_PROMPT.md)

## UI ↔ Git

- Вкладка: `/master-admin/environment`
- Persist: `model-environment-docs-v1`
- Экспорт/импорт: JSON version 1 (`environmentDocsSnapshot.ts`)

## Кратко (2026-05-15)

- GitHub: **Goncharov108/model** (private), CI зелёный
- VPS: **104.171.141.49** (ztv NL-8-NVMe), сайт по IP работает
- Домен: **live-model.ru** — DNS на reg.ru ещё на старый IP
