import type { JSX } from 'react'
import { useState } from 'react'
import { HermesChatWorkspace } from '../components/hermes/HermesChatWorkspace'
import { getHermesDashboardUrl, HERMES_SSH_TUNNEL_HINT } from '../lib/hermesDashboard'
import { PageHeader } from '../ui/PageHeader'
import { SurfaceCard } from '../ui/SurfaceCard'

type HermesPane = 'dashboard' | 'chat'

/** Hermes: полный дашборд или отдельное рабочее окно чата. */
export function MasterAdminHermesWorkspace(): JSX.Element {
  const [pane, setPane] = useState<HermesPane>('chat')
  const hermesUrl = getHermesDashboardUrl()

  return (
    <div className="flex min-h-[min(100dvh,100svh)] min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-zinc-800 px-6 py-6 lg:px-10">
        <PageHeader
          eyebrow="Мастер-админ"
          title="Hermes"
          description="Два контура: Telegram — мессенджер; здесь — веб. «Дашборд» — вся панель Hermes; «Мой чат» — только диалог с агентом (Codex)."
        />

        <div
          className="mt-4 flex flex-wrap gap-1 rounded-xl border border-zinc-800 bg-zinc-950/60 p-1 sm:flex-nowrap"
          role="tablist"
          aria-label="Режим Hermes"
        >
          <HermesTab
            active={pane === 'chat'}
            onClick={() => setPane('chat')}
            label="Мой чат"
            hint="Рабочее окно"
          />
          <HermesTab
            active={pane === 'dashboard'}
            onClick={() => setPane('dashboard')}
            label="Дашборд"
            hint="Вся панель Hermes"
          />
        </div>
      </div>

      <div className="flex min-h-[min(65vh,720px)] min-h-0 flex-1 flex-col gap-3 p-4 lg:p-6">
        {import.meta.env.DEV ? (
          <SurfaceCard className="shrink-0 text-sm text-zinc-400">
            <p>
              Локально для чата нужен туннель:{' '}
              <code className="text-xs text-amber-200/90">{HERMES_SSH_TUNNEL_HINT}</code>
            </p>
          </SurfaceCard>
        ) : null}

        {pane === 'dashboard' ? (
          <iframe
            title="Hermes Dashboard"
            src={hermesUrl}
            className="min-h-[min(70vh,720px)] w-full flex-1 rounded-xl border border-zinc-800 bg-zinc-950"
            allow="clipboard-read; clipboard-write"
          />
        ) : (
          <HermesChatWorkspace isActive={pane === 'chat'} />
        )}
      </div>
    </div>
  )
}

function HermesTab(props: {
  label: string
  hint: string
  active: boolean
  onClick: () => void
}): JSX.Element {
  const { label, hint, active, onClick } = props
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex flex-1 flex-col items-start rounded-lg px-4 py-2.5 text-left transition ${
        active
          ? 'bg-amber-950/60 text-amber-100 ring-1 ring-amber-600/40'
          : 'text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-200'
      }`}
    >
      <span className="text-sm font-medium">{label}</span>
      <span className="text-xs opacity-70">{hint}</span>
    </button>
  )
}
