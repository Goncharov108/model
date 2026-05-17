import type { JSX } from 'react'
import { useState } from 'react'
import { OrchestraAgentRow } from '../components/orchestra/OrchestraAgentRow'
import { OrchestraTicketRow } from '../components/orchestra/OrchestraTicketRow'
import { buildOrchestraExport, parseOrchestraImport } from '../lib/orchestraSnapshot'
import { downloadJson } from '../lib/downloadJson'
import { useOrchestraStore } from '../store/orchestraStore'
import { AppButton } from '../ui/AppButton'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { SurfaceCard } from '../ui/SurfaceCard'

/** Экран режима «Оркестр»: роли агентов, задачи и заметки дирижёра с персистентностью в браузере. */
export function OrchestraWorkspace(): JSX.Element {
  const agents = useOrchestraStore((s) => s.agents)
  const tickets = useOrchestraStore((s) => s.tickets)
  const conductorNotes = useOrchestraStore((s) => s.conductorNotes)
  const addAgent = useOrchestraStore((s) => s.addAgent)
  const updateAgent = useOrchestraStore((s) => s.updateAgent)
  const removeAgent = useOrchestraStore((s) => s.removeAgent)
  const addTicket = useOrchestraStore((s) => s.addTicket)
  const updateTicket = useOrchestraStore((s) => s.updateTicket)
  const removeTicket = useOrchestraStore((s) => s.removeTicket)
  const setConductorNotes = useOrchestraStore((s) => s.setConductorNotes)
  const replaceAll = useOrchestraStore((s) => s.replaceAll)
  const resetToDefaults = useOrchestraStore((s) => s.resetToDefaults)
  const restoreDefaultAgents = useOrchestraStore((s) => s.restoreDefaultAgents)

  const [importDraft, setImportDraft] = useState('')
  const [importError, setImportError] = useState<string | null>(null)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)

  function onExport() {
    const payload = buildOrchestraExport({ agents, tickets, conductorNotes })
    downloadJson(`orchestra-${Date.now()}.json`, payload)
    setImportError(null)
  }

  function onImport() {
    const res = parseOrchestraImport(importDraft)
    if (!res.ok) {
      setImportError(res.message)
      return
    }
    replaceAll({
      agents: res.agents,
      tickets: res.tickets,
      conductorNotes: res.conductorNotes,
    })
    setImportError(null)
    setImportDraft('')
  }

  function onResetAll() {
    setResetDialogOpen(true)
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
      <ConfirmDialog
        open={resetDialogOpen}
        title="Полный сброс оркестра?"
        description="Роли, задачи и заметки дирижёра вернутся к шаблону по умолчанию. Текущее состояние пропадёт из этого браузера."
        confirmLabel="Сбросить"
        confirmVariant="danger"
        onCancel={() => setResetDialogOpen(false)}
        onConfirm={() => {
          resetToDefaults()
          setImportError(null)
        }}
      />
      <section className="space-y-3 border-b border-zinc-800 pb-8">
        <details className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3 text-sm text-zinc-400">
          <summary className="cursor-pointer text-zinc-200">Подсказка по типам в Cursor</summary>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <span className="font-mono text-zinc-300">explore</span> — быстрый обзор кода (только чтение).
            </li>
            <li>
              <span className="font-mono text-zinc-300">generalPurpose</span> — общий многошаговый агент.
            </li>
            <li>
              <span className="font-mono text-zinc-300">shell</span> — команды, git, сборка.
            </li>
            <li>
              <span className="font-mono text-zinc-300">ci-investigator</span> — разбор одного падения CI.
            </li>
          </ul>
        </details>
        <SurfaceCard
          title="Дорожная карта репозитория"
          description="Фазы разработки и чеклист — в файле PLAN_REALIZATSII.md в корне каталога model (на одном уровне с web/). Обновляйте чекбоксы по мере выполнения."
        />
        <div className="flex flex-wrap gap-2 pt-2">
          <AppButton type="button" onClick={onExport}>
            Экспорт JSON
          </AppButton>
          <AppButton type="button" variant="ghost" onClick={onImport} disabled={!importDraft.trim()}>
            Импорт JSON
          </AppButton>
          <AppButton type="button" variant="ghost" onClick={restoreDefaultAgents}>
            Роли по умолчанию
          </AppButton>
          <AppButton type="button" variant="danger" onClick={onResetAll}>
            Полный сброс…
          </AppButton>
        </div>
        <textarea
          value={importDraft}
          onChange={(e) => setImportDraft(e.target.value)}
          spellCheck={false}
          placeholder="Вставь JSON из orchestra-….json"
          className="min-h-[100px] w-full resize-y rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 font-mono text-xs text-zinc-100 outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/25"
        />
        {importError ? (
          <p className="rounded-lg border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-200">
            {importError}
          </p>
        ) : null}
      </section>

      {agents.length === 0 ? (
        <SurfaceCard className="border-amber-500/30 bg-amber-950/20 p-4 text-sm text-amber-100">
          Список ролей пуст. Нажми «Роли по умолчанию» или «Полный сброс», чтобы вернуть шаблон.
        </SurfaceCard>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Роли агентов</h2>
            <p className="text-sm text-zinc-500">Подпись и фокус — что передать каждому типу агента в IDE.</p>
          </div>
          <AppButton type="button" variant="ghost" onClick={addAgent}>
            Добавить роль
          </AppButton>
        </div>
        <div className="flex flex-col gap-4">
          {agents.map((a) => (
            <OrchestraAgentRow
              key={a.id}
              agent={a}
              onChange={(patch) => updateAgent(a.id, patch)}
              onRemove={() => removeAgent(a.id)}
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Задачи дорожек</h2>
            <p className="text-sm text-zinc-500">Назначение на роль и статус для учёта прогресса.</p>
          </div>
          <AppButton type="button" variant="ghost" onClick={addTicket}>
            Добавить задачу
          </AppButton>
        </div>
        {tickets.length === 0 ? (
          <p className="text-sm text-zinc-500">Пока нет задач — добавь первую дорожку.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {tickets.map((t) => (
              <OrchestraTicketRow
                key={t.id}
                ticket={t}
                agents={agents}
                onChange={(patch) => updateTicket(t.id, patch)}
                onRemove={() => removeTicket(t.id)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-zinc-100">Заметки дирижёра</h2>
        <p className="text-sm text-zinc-500">Общий контекст сессии; попадает в экспорт JSON.</p>
        <textarea
          value={conductorNotes}
          onChange={(e) => setConductorNotes(e.target.value)}
          rows={5}
          spellCheck
          placeholder="Например: сначала explore по web/src/store, затем shell — npm run build…"
          className="w-full resize-y rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 text-sm text-zinc-100 outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/25"
        />
      </section>
    </div>
  )
}
