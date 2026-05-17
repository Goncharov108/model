import { Outlet, useLocation } from 'react-router-dom'
import { AdvancedSettingsNav } from '../components/shell/AdvancedSettingsNav'
import { getAdvancedNavItem } from '../lib/appPaths'

/** Оболочка «Продвинутые настройки»: шапка раздела + внутренняя навигация + контент. */
export function AdvancedSettingsShell() {
  const { pathname } = useLocation()
  const current = getAdvancedNavItem(pathname)

  return (
    <div className="flex min-h-full flex-col bg-zinc-950">
      <header className="border-b border-zinc-800 bg-gradient-to-r from-zinc-900/90 via-zinc-950 to-zinc-950 px-4 py-5 sm:px-6 lg:px-8">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-violet-300/90">
          Мастер-админ · продвинутые настройки
        </p>
        <h1 className="mt-1 text-balance text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
          {current.label}
        </h1>
        <p className="mt-2 max-w-3xl text-pretty text-sm leading-relaxed text-zinc-400">
          {current.hint}. Данные сохраняются только в этом браузере (localStorage). Секреты сервера
          — во вкладке «Окружение», не здесь.
        </p>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <AdvancedSettingsNav />
        <div className="min-w-0 flex-1 bg-zinc-950">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
