# DNS: live-model.ru (reg.ru)

**Актуальный prod IP:** **93.183.71.104** (RU-8 VPS).

Старый NL VPS **104.171.141.49** — архив, записи на него снять.

## Записи (reg.ru)

| Имя | Тип | Значение |
|-----|-----|----------|
| `@` | **A** | **93.183.71.104** |
| `www` | **A** | **93.183.71.104** |
| `hermes` | **A** | **93.183.71.104** *(опционально: `https://hermes.live-model.ru/`)* |

## Проверка

```bash
dig +short live-model.ru @8.8.8.8
dig +short www.live-model.ru @8.8.8.8
```

Ожидается: **93.183.71.104**

Если есть **AAAA** на старый хостинг — удалить или отключить, иначе Let's Encrypt может идти по IPv6 и certbot упадёт.

## HTTPS

После DNS:

```bash
ssh -i ~/.ssh/id_ed25519 root@93.183.71.104
certbot --nginx -d live-model.ru -d www.live-model.ru
```

Или автоматически при `./scripts/deploy/deploy.sh` с `DEPLOY_NGINX=1` (см. `DEPLOY.md`).
