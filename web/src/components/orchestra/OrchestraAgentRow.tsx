import type { OrchestraAgent } from '../../domain/orchestra'
import { AppButton } from '../../ui/AppButton'
import { SurfaceCard } from '../../ui/SurfaceCard'

type Props = {
  agent: OrchestraAgent
  onChange: (patch: Partial<Pick<OrchestraAgent, 'label' | 'focus'>>) => void
  onRemove: () => void
}

/** Одна строка редактирования роли агента в оркестре. */
export function OrchestraAgentRow({ agent, onChange, onRemove }: Props) {
  return (
    <SurfaceCard className="space-y-3 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="font-mono text-xs text-zinc-500">{agent.id}</p>
        <AppButton type="button" variant="ghost" onClick={onRemove}>
          Убрать роль
        </AppButton>
      </div>
      <label className="block space-y-1">
        <span className="text-xs text-zinc-500">Подпись роли</span>
        <input
          value={agent.label}
          onChange={(e) => onChange({ label: e.target.value })}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500/50"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-xs text-zinc-500">Фокус делегирования</span>
        <textarea
          value={agent.focus}
          onChange={(e) => onChange({ focus: e.target.value })}
          rows={2}
          className="w-full resize-y rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-violet-500/50"
        />
      </label>
    </SurfaceCard>
  )
}
