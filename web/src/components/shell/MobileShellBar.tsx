import { PATH, getAdvancedNavItem } from '../../lib/appPaths'
import { useLocation } from 'react-router-dom'

/** Верхняя панель на мобильном: меню и контекст раздела. */
export function MobileShellBar(props: {
  onOpenDrawer: () => void
  onBackToMain: () => void
}) {
  const { onOpenDrawer, onBackToMain } = props
  const { pathname } = useLocation()
  const inMaster = pathname.startsWith(PATH.masterAdmin.root)
  const inAdvanced = pathname.startsWith(PATH.masterAdmin.advanced.root)
  const advancedItem = inAdvanced ? getAdvancedNavItem(pathname) : null

  let title = 'model'
  if (inAdvanced && advancedItem) title = advancedItem.label
  else if (inMaster) title = 'Мастер-админ'

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center gap-2 border-b border-zinc-800 bg-zinc-950/95 px-3 backdrop-blur-md lg:hidden">
      {inMaster ? (
        <button
          type="button"
          onClick={onBackToMain}
          className="flex size-10 shrink-0 items-center justify-center rounded-lg text-zinc-300 hover:bg-zinc-800"
          aria-label="В общее меню"
        >
          ←
        </button>
      ) : null}
      <button
        type="button"
        onClick={onOpenDrawer}
        className="flex size-10 shrink-0 flex-col items-center justify-center gap-1 rounded-lg hover:bg-zinc-800"
        aria-label="Открыть меню"
      >
        <span className="block h-0.5 w-5 rounded bg-zinc-300" />
        <span className="block h-0.5 w-5 rounded bg-zinc-300" />
        <span className="block h-0.5 w-5 rounded bg-zinc-300" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-zinc-100">{title}</p>
        <p className="truncate text-[10px] text-zinc-500">
          {inMaster ? 'Мастер-админ' : 'Рабочее место'}
        </p>
      </div>
    </header>
  )
}
