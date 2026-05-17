/** Клиент к дашборду Hermes за префиксом /hermes (nginx → :9119). */

const HERMES_PREFIX = '/hermes'

const SESSION_TOKEN_RE = /__HERMES_SESSION_TOKEN__="([^"]+)"/

let cachedToken: { value: string; at: number } | null = null

/** Базовый URL Hermes на том же origin, что и UI model. */
export function getHermesHttpBase(): string {
  if (typeof window === 'undefined') return HERMES_PREFIX
  return `${window.location.origin}${HERMES_PREFIX}`
}

/** Считывает одноразовый токен сессии из HTML дашборда. */
export async function fetchHermesSessionToken(): Promise<string> {
  if (cachedToken && Date.now() - cachedToken.at < 60_000) {
    return cachedToken.value
  }
  const res = await fetch(`${getHermesHttpBase()}/`, { credentials: 'same-origin' })
  if (!res.ok) {
    throw new Error(`Hermes недоступен (HTTP ${res.status})`)
  }
  const html = await res.text()
  const match = SESSION_TOKEN_RE.exec(html)
  if (!match?.[1]) {
    throw new Error('Не найден токен сессии Hermes. Проверьте, что dashboard запущен с --tui.')
  }
  cachedToken = { value: match[1], at: Date.now() }
  return match[1]
}

/** Сбрасывает кэш токена (после перезапуска dashboard). */
export function invalidateHermesSessionToken(): void {
  cachedToken = null
}

/** WebSocket PTY — полный TUI Hermes (как вкладка Chat в дашборде). */
export function buildHermesPtyWebSocketUrl(
  token: string,
  channel: string,
  resumeSessionId?: string | null,
): string {
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const qs = new URLSearchParams({ token, channel })
  if (resumeSessionId) qs.set('resume', resumeSessionId)
  return `${proto}//${window.location.host}${HERMES_PREFIX}/api/pty?${qs.toString()}`
}

/** WebSocket событий инструментов (боковая панель). */
export function buildHermesEventsWebSocketUrl(token: string, channel: string): string {
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const qs = new URLSearchParams({ token, channel })
  return `${proto}//${window.location.host}${HERMES_PREFIX}/api/events?${qs.toString()}`
}

/** Запрос к REST API дашборда Hermes. */
export async function hermesApiFetch<T>(
  path: string,
  token: string,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers)
  headers.set('X-Hermes-Session-Token', token)
  const res = await fetch(`${getHermesHttpBase()}${path}`, {
    ...init,
    headers,
    credentials: 'same-origin',
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Hermes API ${res.status}`)
  }
  return res.json() as Promise<T>
}

export type HermesSessionRow = {
  /** Hermes API: поле `id` */
  id?: string
  session_id?: string
  title?: string | null
  preview?: string | null
  model?: string | null
  source?: string | null
  message_count?: number
  last_active?: number | null
}

/** Стабильный id сессии из ответа Hermes. */
export function getHermesSessionId(session: HermesSessionRow): string {
  return session.id ?? session.session_id ?? ''
}

/** Подпись сессии для списка. */
export function formatHermesSessionLabel(session: HermesSessionRow, maxLen = 48): string {
  const id = getHermesSessionId(session)
  const raw = session.title?.trim() || session.preview?.trim() || id || 'Сессия'
  return raw.length > maxLen ? `${raw.slice(0, maxLen - 1)}…` : raw
}

export type HermesSessionsResponse = {
  sessions: HermesSessionRow[]
  total?: number
}

export type HermesStatusResponse = {
  version?: string
  gateway?: { running?: boolean }
  active_sessions?: number
}

export type HermesModelInfoResponse = {
  provider?: string
  model?: string
  label?: string
}

/** Уникальный channel id для связки PTY и /api/events. */
export function createHermesChatChannelId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `model-chat-${Date.now().toString(36)}`
}

/** ESC-последовательность изменения размера PTY (протокол Hermes). */
export function encodeHermesPtyResize(cols: number, rows: number): string {
  return `\x1b[RESIZE:${cols};${rows}]`
}
