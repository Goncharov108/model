import type { JSX } from 'react'
import { useState } from 'react'
import { PhilosophyLifeView } from '../components/philosophy/PhilosophyLifeView'
import { PhilosophyMapView } from '../components/philosophy/PhilosophyMapView'
import { PhilosophyPersonalEditor } from '../components/philosophy/PhilosophyPersonalEditor'
import { PHILOSOPHY_MAP_META } from '../data/philosophyVectorsSeed'
import { PageHeader } from '../ui/PageHeader'

type PhilosophyPane = 'map' | 'life' | 'personal'

/** Вкладка «Философия»: карта, отдельный слой «Жизнь», личный текст в private/. */
export function MasterAdminPhilosophyWorkspace(): JSX.Element {
  const [pane, setPane] = useState<PhilosophyPane>('map')

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-10 lg:px-10">
      <PageHeader
        eyebrow="Мастер-админ"
        title="Философия"
        description={PHILOSOPHY_MAP_META.subtitle}
      />

      <div
        className="flex flex-wrap gap-1 rounded-xl border border-zinc-800 bg-zinc-950/60 p-1 sm:flex-nowrap"
        role="tablist"
        aria-label="Разделы философии"
      >
        <PaneTab
          active={pane === 'map'}
          onClick={() => setPane('map')}
          label="Карта"
        />
        <PaneTab
          active={pane === 'life'}
          onClick={() => setPane('life')}
          label="Жизнь"
        />
        <PaneTab
          active={pane === 'personal'}
          onClick={() => setPane('personal')}
          label="Мой текст"
        />
      </div>

      {pane === 'map' ? (
        <PhilosophyMapView />
      ) : pane === 'life' ? (
        <PhilosophyLifeView />
      ) : (
        <PhilosophyPersonalEditor />
      )}
    </div>
  )
}

function PaneTab(props: {
  label: string
  active: boolean
  onClick: () => void
}): JSX.Element {
  const { label, active, onClick } = props
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
        active
          ? 'bg-amber-950/60 text-amber-100 ring-1 ring-amber-600/40'
          : 'text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-200'
      }`}
    >
      {label}
    </button>
  )
}
