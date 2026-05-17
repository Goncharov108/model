# Статус окружения model (2026-05-15)

Обновлять после деплоя и смены DNS.

## Продакшен

| Проверка | Ожидание | Сейчас |
|----------|----------|--------|
| `curl -s -o /dev/null -w "%{http_code}" http://104.171.141.49/` | 200 | ✅ |
| `curl -s http://104.171.141.49/api/health` | `{"ok":true,...}` | ✅ |
| `dig +short live-model.ru @8.8.8.8` | 104.171.141.49 | ⏳ в панели reg.ru готово; публичный DNS ещё 31.31.198.113 |
| `curl -I https://live-model.ru` | 200/301 | ⏳ после распространения DNS + повтор certbot |

## Репозиторий

- URL: https://github.com/Goncharov108/model
- Ветка: `main`
- CI: зелёный на push

## Секреты (где лежат)

| Секрет | Где |
|--------|-----|
| root VPS | `private/SERVER_ROOT.txt` |
| GitHub token | keyring `gh`, scope repo+workflow |
| SSH на Mac | `~/.ssh/id_ed25519` |

## Следующий шаг

1. reg.ru: A-записи на **104.171.141.49**
2. `certbot --nginx -d live-model.ru -d www.live-model.ru` на сервере
3. Обновить SSL-поля во вкладке «Окружение» и в [DNS_REG_RU.md](./DNS_REG_RU.md)
