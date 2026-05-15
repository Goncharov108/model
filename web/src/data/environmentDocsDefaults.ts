import type { EnvironmentDocsData, EnvironmentStackRow } from '../domain/environmentDocs'
import { newId } from '../lib/newId'

function row(
  tier: EnvironmentStackRow['tier'],
  layer: string,
  technology: string,
  version: string,
  location: string,
  note: string,
): EnvironmentStackRow {
  return { id: newId(), tier, layer, technology, version, location, note }
}

/** Начальное состояние документации окружения (синхронизируется с docs/environment/). */
export function createDefaultEnvironmentDocs(): EnvironmentDocsData {
  return {
    github: {
      repoUrl: 'https://github.com/Goncharov108/model',
      repoName: 'model',
      visibility: 'private',
      defaultBranch: 'main',
      ciWorkflow: '.github/workflows/ci.yml',
      ciStatus: 'после push — проверить вкладку Actions; локальный remote может быть ещё не настроен',
      notes:
        'Владелец: Goncharov108 (уточнить slug, если на GitHub иной). Приватный репозиторий model. Push — только по явной команде.',
    },
    domain: {
      domainName: 'live-model.ru',
      dnsRecords:
        '@ → A на IP сервера (после подключения)\nwww → CNAME live-model.ru или A на тот же IP',
      sslStatus: 'не выпущен (сервер пока не подключён)',
      sslCheckedAt: '',
      notes: 'Регистратор reg.ru. A-запись — когда будет IP VPS.',
    },
    server: {
      host: '',
      os: 'Ubuntu 22.04 LTS (целевое)',
      sshUser: 'deploy',
      deployWebPath: '/var/www/model/web',
      deployApiPath: '/opt/model/api',
      nodeVersion: '22 (.nvmrc в корне репозитория)',
      notes: 'Сервер пока не подключён. Пароли и ключи — только на сервере / в private/, не в UI.',
    },
    stack: {
      plannedCanonRef: 'CANON_PROJECT_MASTER.txt — Keycloak, OpenFGA, PostgreSQL, MinIO, Nextcloud, …',
      rows: [
        row('repository', 'Web UI', 'Vite + React + TypeScript', 'vite ^8, react ^19, TS ~6', 'web/', 'SWOD закон 6'),
        row('repository', 'Маршрутизация', 'react-router-dom', '^7.15', 'web/', ''),
        row('repository', 'Состояние', 'zustand + persist', '^5.0', 'web/src/store/', 'localStorage в браузере'),
        row('repository', 'Стили', 'Tailwind CSS', '^4.3', 'web/', '@tailwindcss/vite'),
        row('repository', 'API', 'Node http (placeholder)', 'server.mjs', 'api/', 'GET /health, PORT 3847'),
        row('repository', 'CI', 'GitHub Actions', 'workflow CI', '.github/workflows/ci.yml', 'lint, test, build, api-smoke'),
        row('production', 'Web (статика)', '—', '—', 'web/dist на сервере', 'заполнить после деплоя'),
        row('production', 'API', '—', '—', 'systemd + nginx proxy', 'заполнить после деплоя'),
        row('planned', 'IAM', 'Keycloak', 'канон-3', 'отдельный сервис', 'не внедрять без плана'),
        row('planned', 'AuthZ', 'OpenFGA', 'канон-3', 'отдельный сервис', 'ReBAC / делегирования'),
        row('planned', 'БД', 'PostgreSQL + RLS', 'канон-3', 'отдельный сервис', ''),
        row('planned', 'Файлы', 'MinIO / Nextcloud', 'канон-3', 'отдельный сервис', ''),
      ],
    },
    secrets: {
      neverCommit: 'private/\n.env, .env.*\n*.pem, id_rsa, SSH private keys\nтокены GitHub, reg.ru',
      serverSecrets: '/etc/model/.env (пример)\n~deploy/.ssh/authorized_keys\nGitHub Secrets: SSH_HOST, SSH_USER, SSH_KEY',
      notes: 'Закон 1 SWOD: private/ только локально у владельца.',
    },
  }
}
