import {
  ORCHESTRA_STATUS_LABELS,
  type OrchestraAgent,
  type OrchestraTicket,
  type OrchestraTicketStatus,
} from '../../domain/orchestra'
import { AppButton } from '../../ui/AppButton'
import { SurfaceCard } from '../../ui/SurfaceCard'

type Props = {
  ticket: OrchestraTicket
  agents: OrchestraAgent[]
  onChange: (
    patch: Partial<Pick<OrchestraTicket, 'title' | 'brief' | 'agentId' | 'status'>>,
  ) => void
  onRemove: () => void
}

/** Одна карточка задачи дорожки с назначением на роль и статусом. */
export function OrchestraTicketRow({ ticket, agents, onChange, onRemove }: Props) {
  return (
    <SurfaceCard className="space-y-3 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="font-mono text-xs text-zinc-500">{ticket.id}</p>
        <AppButton type="button" variant="ghost" onClick={onRemove}>
          Удалить задачу
        </AppButton>
      </div>
      <label className="block space-y-1">
        <span className="text-xs text-zinc-500">Заголовок</span>
        <input
          value={ticket.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500/50"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-xs text-zinc-500">Контекст для агента</span>
        <textarea
          value={ticket.brief}
          onChange={(e) => onChange({ brief: e.target.value })}
          rows={3}
          spellCheck
          className="w-full resize-y rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500/50"
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-xs text-zinc-500">Роль</span>
          <select
            value={ticket.agentId ?? ''}
            onChange={(e) => onChange({ agentId: e.target.value === '' ? null : e.target.value })}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500/50"
          >
            <option value="">Не назначено</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-zinc-500">Статус</span>
          <select
            value={ticket.status}
            onChange={(e) => onChange({ status: e.target.value as OrchestraTicketStatus })}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500/50"
          >
            {(Object.keys(ORCHESTRA_STATUS_LABELS) as OrchestraTicketStatus[]).map((key) => (
              <option key={key} value={key}>
                {ORCHESTRA_STATUS_LABELS[key]}
              </option>
            ))}
          </select>
        </label>
      </div>
    </SurfaceCard>
  )
}
