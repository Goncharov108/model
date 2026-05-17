# Сервер

**Без паролей и приватных ключей в этом файле.**

| Поле | Значение |
|------|----------|
| Провайдер | [Z-Tv Hosting](https://ztv.su/) |
| Тариф | NL-8-NVMe (KVM NVMe, Нидерланды) |
| Hostname | `vps1778841729.tech0.ru` |
| Основной IPv4 | **104.171.141.49** |
| ОС | Ubuntu 24.04 x64 |
| SSH (сейчас) | `root@104.171.141.49` — пароль из **письма** или «Изменить пароль» в ЛК (см. ниже) |
| SSH (целевое) | пользователь `deploy` + ключ с Mac, без пароля root в проде |

## Как зайти в панель ztv (нет пункта «SSH-ключи»)

У Z-Tv **нет** отдельного меню для загрузки SSH-ключа. Доступ — **root + пароль** (письмо после оплаты) или сброс пароля:

1. Войти: https://ztv.su/clientarea.php  
2. Верхнее меню: **Услуги** → **Продукты/услуги**  
3. Строка VPS (NL-8-NVMe) → нажать **«Активный»** (синяя ссылка статуса)  
4. Слева: **«Изменить пароль»** → сгенерировать надёжный пароль → **Сохранить** → подождать **3–5 минут**  
5. Подключение: `ssh root@104.171.141.49`

На странице услуги же обычно есть **VNC-консоль** / перезагрузка (если SSH не пускает).

Публичный SSH-ключ с Mac добавляется **после первого входа** на сервере:

```bash
mkdir -p ~/.ssh && chmod 700 ~/.ssh
echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIPbXYPxdCNEL9QFs0DqQrTbGv71TcaVOaSXmzsArWHXQ mac108-model-deploy' >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

Инструкция ztv: [сброс пароля root](https://ztv.su/knowledgebase/73/sbros-parolia-administratora-na-vpsvds-servere.html), [загрузка файлов (SFTP)](https://ztv.su/knowledgebase/59/kak-zagruzit-faily-na-server-linux.html).

## Пути деплоя (v1)

| Назначение | Путь |
|------------|------|
| Статика SPA (`web/dist`) | `/var/www/model/web` |
| API (`api/server.mjs`) | `/opt/model/api` |

## API за nginx

Прокси `location /api/` → `http://127.0.0.1:3847`

## Firewall

- Открыть: **22**, **80**, **443** (в панели ztv, если есть файрвол)
