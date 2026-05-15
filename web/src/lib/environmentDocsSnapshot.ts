import type { EnvironmentDocsData, EnvironmentStackRow, EnvironmentStackTier } from '../domain/environmentDocs'

const EXPORT_VERSION = 1 as const

const STACK_TIERS: EnvironmentStackTier[] = ['production', 'repository', 'planned']

export type EnvironmentDocsExportEnvelope = {
  version: typeof EXPORT_VERSION
  exportedAt: string
  docs: EnvironmentDocsData
}

function isStackTier(v: unknown): v is EnvironmentStackTier {
  return typeof v === 'string' && (STACK_TIERS as string[]).includes(v)
}

function isStackRow(v: unknown): v is EnvironmentStackRow {
  if (!v || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  return (
    typeof o.id === 'string' &&
    o.id.length > 0 &&
    isStackTier(o.tier) &&
    typeof o.layer === 'string' &&
    typeof o.technology === 'string' &&
    typeof o.version === 'string' &&
    typeof o.location === 'string' &&
    typeof o.note === 'string'
  )
}

function isStringRecord(v: unknown): v is Record<string, string> {
  if (!v || typeof v !== 'object') return false
  return Object.values(v as Record<string, unknown>).every((x) => typeof x === 'string')
}

function isVisibility(v: unknown): v is EnvironmentDocsData['github']['visibility'] {
  return v === '' || v === 'public' || v === 'private'
}

/** Проверяет объект документации окружения (импорт JSON). */
export function parseEnvironmentDocsData(v: unknown): EnvironmentDocsData | null {
  if (!v || typeof v !== 'object') return null
  const root = v as Record<string, unknown>
  const github = root.github
  const domain = root.domain
  const server = root.server
  const stack = root.stack
  const secrets = root.secrets
  if (!github || typeof github !== 'object' || !isStringRecord(github)) return null
  if (!isVisibility((github as Record<string, unknown>).visibility)) return null
  if (!domain || typeof domain !== 'object' || !isStringRecord(domain)) return null
  if (!server || typeof server !== 'object' || !isStringRecord(server)) return null
  if (!secrets || typeof secrets !== 'object' || !isStringRecord(secrets)) return null
  if (!stack || typeof stack !== 'object') return null
  const stackObj = stack as Record<string, unknown>
  if (typeof stackObj.plannedCanonRef !== 'string' || !Array.isArray(stackObj.rows)) return null
  const rows: EnvironmentStackRow[] = []
  for (let i = 0; i < stackObj.rows.length; i++) {
    if (!isStackRow(stackObj.rows[i])) return null
    rows.push({ ...(stackObj.rows[i] as EnvironmentStackRow) })
  }
  return {
    github: { ...(github as EnvironmentDocsData['github']) },
    domain: { ...(domain as EnvironmentDocsData['domain']) },
    server: { ...(server as EnvironmentDocsData['server']) },
    stack: { plannedCanonRef: stackObj.plannedCanonRef, rows },
    secrets: { ...(secrets as EnvironmentDocsData['secrets']) },
  }
}

/** Собирает JSON-конверт документации окружения для выгрузки. */
export function buildEnvironmentDocsExport(docs: EnvironmentDocsData): EnvironmentDocsExportEnvelope {
  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    docs: {
      github: { ...docs.github },
      domain: { ...docs.domain },
      server: { ...docs.server },
      stack: {
        plannedCanonRef: docs.stack.plannedCanonRef,
        rows: docs.stack.rows.map((r) => ({ ...r })),
      },
      secrets: { ...docs.secrets },
    },
  }
}

export type EnvironmentDocsImportResult =
  | { ok: true; docs: EnvironmentDocsData }
  | { ok: false; message: string }

/** Разбирает JSON импорта документации окружения (версия 1). */
export function parseEnvironmentDocsImport(jsonText: string): EnvironmentDocsImportResult {
  let data: unknown
  try {
    data = JSON.parse(jsonText) as unknown
  } catch {
    return { ok: false, message: 'Невалидный JSON' }
  }
  if (!data || typeof data !== 'object') return { ok: false, message: 'Ожидается объект' }
  const root = data as Record<string, unknown>
  if (root.version !== EXPORT_VERSION) return { ok: false, message: 'Ожидается version: 1' }
  const docs = parseEnvironmentDocsData(root.docs)
  if (!docs) return { ok: false, message: 'Некорректное поле docs' }
  return { ok: true, docs }
}

const TIER_LABEL: Record<EnvironmentStackTier, string> = {
  production: 'Сейчас на сервере / в проде',
  repository: 'В репозитории (локально)',
  planned: 'Запланировано (канон-3)',
}

/** Текст чеклиста деплоя v1 для буфера обмена. */
export function buildDeployChecklistText(docs: EnvironmentDocsData): string {
  const lines: string[] = [
    '# Чеклист деплоя model (v1)',
    '',
    '## Репозиторий и CI',
    `- URL: ${docs.github.repoUrl || '(указать)'}`,
    `- Ветка: ${docs.github.defaultBranch}`,
    `- Workflow: ${docs.github.ciWorkflow}`,
    '',
    '## Сервер',
    `- Хост: ${docs.server.host || '(указать)'}`,
    `- ОС: ${docs.server.os}`,
    `- SSH: ${docs.server.sshUser}@<host> (ключ, не пароль в репо)`,
    `- Статика: ${docs.server.deployWebPath}`,
    `- API: ${docs.server.deployApiPath}`,
    `- Node: ${docs.server.nodeVersion}`,
    '',
    '## Домен (reg.ru)',
    `- Домен: ${docs.domain.domainName || '(указать)'}`,
    `- DNS:\n${docs.domain.dnsRecords}`,
    `- SSL: ${docs.domain.sslStatus}`,
    '',
    '## Шаги',
    '1. ssh deploy@<host>',
    '2. Node 22 (nvm / .nvmrc), nginx, certbot',
    '3. npm run build в web/ → rsync web/dist на deployWebPath',
    '4. api/server.mjs → systemd, proxy /api/ → 127.0.0.1:3847',
    '5. certbot --nginx -d <domain> -d www.<domain>',
    '6. curl -I https://<domain> && curl https://<domain>/api/health',
    '',
    '## Не копировать на сервер',
    docs.secrets.neverCommit,
    '',
    `Документация в Git: docs/environment/ (см. DEPLOY.md)`,
  ]
  const stackByTier = STACK_TIERS.map((tier) => {
    const tierRows = docs.stack.rows.filter((r) => r.tier === tier)
    if (tierRows.length === 0) return ''
    const body = tierRows
      .map((r) => `  - ${r.layer}: ${r.technology} ${r.version} @ ${r.location}`)
      .join('\n')
    return `### ${TIER_LABEL[tier]}\n${body}`
  }).filter(Boolean)
  if (stackByTier.length > 0) {
    lines.push('', '## Стек (кратко)', ...stackByTier)
  }
  return lines.join('\n')
}
