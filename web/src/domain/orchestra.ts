/** Статус задачи в дорожке оркестра (внешние агенты в IDE). */
export type OrchestraTicketStatus = 'backlog' | 'in_progress' | 'blocked' | 'done'

/** Слот роли агента: подпись и фокус делегирования. */
export interface OrchestraAgent {
  id: string
  label: string
  focus: string
}

/** Единица работы, которую можно назначить агенту и отслеживать по статусу. */
export interface OrchestraTicket {
  id: string
  title: string
  brief: string
  agentId: string | null
  status: OrchestraTicketStatus
}

/** Подписи статусов задачи в UI и экспорте. */
export const ORCHESTRA_STATUS_LABELS: Record<OrchestraTicketStatus, string> = {
  backlog: 'Бэклог',
  in_progress: 'В работе',
  blocked: 'Блокер',
  done: 'Готово',
}
