# Домен (reg.ru)

| Поле | Значение |
|------|----------|
| Домен | **live-model.ru** |
| Регистратор | reg.ru |
| SSL | не выпущен *(сервер пока не подключён)* |

## DNS (когда будет IP сервера)

| Имя | Тип | Значение |
|-----|-----|----------|
| `@` | A | IP VPS |
| `www` | CNAME → `live-model.ru` или A | на тот же IP |

TTL: до 24–48 ч (часто быстрее).

**Сейчас:** A-запись не выставлять, пока нет IP — иначе домен уйдёт в никуда.

## SSL (Let's Encrypt)

На сервере после nginx:

```bash
sudo certbot --nginx -d live-model.ru -d www.live-model.ru
```

Проверка:

```bash
curl -I https://live-model.ru
curl https://live-model.ru/api/health
```

API-ключ reg.ru **не хранить в Git** — только env на машине владельца.
