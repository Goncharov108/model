import type { EnvironmentStackRow, EnvironmentStackTier } from '../../domain/environmentDocs'
import { AppButton } from '../../ui/AppButton'

const TIER_LABEL: Record<EnvironmentStackTier, string> = {
  production: 'На сервере / в проде',
  repository: 'В репозитории',
  planned: 'Запланировано',
}

const inputClass =
  'w-full min-w-[5rem] rounded border border-zinc-700 bg-zinc-950/80 px-2 py-1.5 text-xs text-zinc-100 focus:border-amber-500/50 focus:outline-none'

type Props = {
  rows: EnvironmentStackRow[]
  tier: EnvironmentStackTier
  onUpdate: (id: string, patch: Partial<Omit<EnvironmentStackRow, 'id'>>) => void
  onAdd: () => void
  onRemove: (id: string) => void
}

/** Таблица строк стека для одного уровня (прод / репо / план). */
export function EnvironmentStackTable(props: Props) {
  const { rows, tier, onUpdate, onAdd, onRemove } = props
  const filtered = rows.filter((r) => r.tier === tier)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{TIER_LABEL[tier]}</p>
        <AppButton type="button" variant="ghost" className="!py-1 !text-xs" onClick={onAdd}>
          + строка
        </AppButton>
      </div>
      {filtered.length === 0 ? (
        <p className="text-xs text-zinc-500">Нет строк — добавьте или импортируйте JSON.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead className="bg-zinc-950/60 text-zinc-500">
              <tr>
                <th className="px-2 py-2 font-medium">Слой</th>
                <th className="px-2 py-2 font-medium">Технология</th>
                <th className="px-2 py-2 font-medium">Версия</th>
                <th className="px-2 py-2 font-medium">Где</th>
                <th className="px-2 py-2 font-medium">Заметка</th>
                <th className="w-8 px-2 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {filtered.map((row) => (
                <tr key={row.id} className="text-zinc-300">
                  {(['layer', 'technology', 'version', 'location', 'note'] as const).map((field) => (
                    <td key={field} className="px-1 py-1">
                      <input
                        className={inputClass}
                        value={row[field]}
                        onChange={(e) => onUpdate(row.id, { [field]: e.target.value })}
                      />
                    </td>
                  ))}
                  <td className="px-1 py-1 text-right">
                    <button
                      type="button"
                      className="text-zinc-500 hover:text-red-400"
                      aria-label="Удалить строку"
                      onClick={() => onRemove(row.id)}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
