# Домен (reg.ru)

| Поле | Значение |
|------|----------|
| Домен | **live-model.ru** |
| Регистратор | reg.ru |
| SSL | после certbot (DNS ещё не на VPS — см. STATUS.md) |

## DNS (записать в панели reg.ru)

| Имя | Тип | Значение |
|-----|-----|----------|
| `@` | **A** | **104.171.141.49** |
| `www` | **A** | **104.171.141.49** |

*(или `www` → CNAME → `live-model.ru`)*

TTL: 300–3600; обновление обычно от нескольких минут до 24 ч.

Проверка с Mac:

```bash
dig +short live-model.ru A
dig +short www.live-model.ru A
```

Ожидается: `104.171.141.49`

**2026-05-15:** A-записи `@` и `www` → `104.171.141.49` **выставлены в reg.ru** (подтверждено владельцем). Распространение: пока у резолверов 8.8.8.8 / 1.1.1.1 ещё `31.31.198.113` — подождать 15 мин–24 ч. Если есть **AAAA** на старый хостинг — удалить или отключить, иначе Let's Encrypt может идти по IPv6 и certbot упадёт.

## SSL (Let's Encrypt)

На сервере после nginx (см. [DEPLOY.md](./DEPLOY.md)):

```bash
sudo certbot --nginx -d live-model.ru -d www.live-model.ru
```

Проверка:

```bash
curl -I https://live-model.ru
curl https://live-model.ru/api/health
```
