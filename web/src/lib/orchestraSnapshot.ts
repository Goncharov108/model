import type { OrchestraAgent, OrchestraTicket, OrchestraTicketStatus } from '../domain/orchestra'

const EXPORT_VERSION = 1 as const

const TICKET_STATUSES: OrchestraTicketStatus[] = ['backlog', 'in_progress', 'blocked', 'done']

export type OrchestraExportEnvelope = {
  version: typeof EXPORT_VERSION
  exportedAt: string
  agents: OrchestraAgent[]
  tickets: OrchestraTicket[]
  conductorNotes: string
}

function isTicketStatus(v: unknown): v is OrchestraTicketStatus {
  return typeof v === 'string' && (TICKET_STATUSES as string[]).includes(v)
}

function isAgent(v: unknown): v is OrchestraAgent {
  if (!v || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  return (
    typeof o.id === 'string' &&
    typeof o.label === 'string' &&
    typeof o.focus === 'string' &&
    o.id.length > 0
  )
}

function isTicket(v: unknown): v is OrchestraTicket {
  if (!v || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  if (typeof o.id !== 'string' || o.id.length === 0) return false
  if (typeof o.title !== 'string') return false
  if (typeof o.brief !== 'string') return false
  if (!isTicketStatus(o.status)) return false
  if (o.agentId !== null && typeof o.agentId !== 'string') return false
  return true
}

/** Собирает JSON-конверт состояния оркестра для выгрузки или вставки в чат. */
export function buildOrchestraExport(payload: {
  agents: OrchestraAgent[]
  tickets: OrchestraTicket[]
  conductorNotes: string
}): OrchestraExportEnvelope {
  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    agents: payload.agents.map((a) => ({ ...a })),
    tickets: payload.tickets.map((t) => ({ ...t })),
    conductorNotes: payload.conductorNotes,
  }
}

export type OrchestraImportResult =
  | { ok: true; agents: OrchestraAgent[]; tickets: OrchestraTicket[]; conductorNotes: string }
  | { ok: false; message: string }

/** Разбирает JSON импорта оркестра (версия 1). */
export function parseOrchestraImport(jsonText: string): OrchestraImportResult {
  let data: unknown
  try {
    data = JSON.parse(jsonText) as unknown
  } catch {
    return { ok: false, message: 'Невалидный JSON' }
  }
  if (!data || typeof data !== 'object') return { ok: false, message: 'Ожидается объект' }
  const root = data as Record<string, unknown>
  if (root.version !== EXPORT_VERSION) return { ok: false, message: 'Ожидается version: 1' }

  if (!Array.isArray(root.agents)) return { ok: false, message: 'Поле agents должно быть массивом' }
  const agents: OrchestraAgent[] = []
  for (let i = 0; i < root.agents.length; i++) {
    if (!isAgent(root.agents[i])) {
      return { ok: false, message: `Некорректный агент в agents[${i}]` }
    }
    agents.push({ ...(root.agents[i] as OrchestraAgent) })
  }

  if (!Array.isArray(root.tickets)) return { ok: false, message: 'Поле tickets должно быть массивом' }
  const tickets: OrchestraTicket[] = []
  for (let i = 0; i < root.tickets.length; i++) {
    if (!isTicket(root.tickets[i])) {
      return { ok: false, message: `Некорректная задача в tickets[${i}]` }
    }
    tickets.push({ ...(root.tickets[i] as OrchestraTicket) })
  }

  const conductorNotes =
    typeof root.conductorNotes === 'string' ? root.conductorNotes : ''

  return { ok: true, agents, tickets, conductorNotes }
}
