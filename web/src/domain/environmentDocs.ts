/** Уровень строки в таблице стека (прод / репозиторий / запланировано). */
export type EnvironmentStackTier = 'production' | 'repository' | 'planned'

/** Строка таблицы «Стек приложения». */
export type EnvironmentStackRow = {
  id: string
  tier: EnvironmentStackTier
  layer: string
  technology: string
  version: string
  location: string
  note: string
}

/** Документация окружения (редактируется во вкладке «Окружение»). */
export type EnvironmentDocsData = {
  github: {
    repoUrl: string
    repoName: string
    visibility: '' | 'public' | 'private'
    defaultBranch: string
    ciWorkflow: string
    ciStatus: string
    notes: string
  }
  domain: {
    domainName: string
    dnsRecords: string
    sslStatus: string
    sslCheckedAt: string
    notes: string
  }
  server: {
    host: string
    os: string
    sshUser: string
    deployWebPath: string
    deployApiPath: string
    nodeVersion: string
    notes: string
  }
  stack: {
    rows: EnvironmentStackRow[]
    plannedCanonRef: string
  }
  secrets: {
    neverCommit: string
    serverSecrets: string
    notes: string
  }
}
