import { NavLink, Outlet } from 'react-router-dom'

/** Стили ссылки вкладки в шапке. */
function tabClassName({ isActive }: { isActive: boolean }): string {
  return [
    'rounded-lg px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-violet-500/70',
    isActive
      ? 'bg-violet-500/20 text-violet-100 ring-1 ring-violet-500/40'
      : 'text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-200',
  ].join(' ')
}

/** Оболочка: навигация по вкладкам и область страниц. */
export function AppShell() {
  return (
    <div className="relative flex min-h-svh flex-col">
      <a
        href="#main-content"
        className="absolute left-4 top-0 z-[100] -translate-y-full rounded-lg bg-violet-700 px-4 py-2 text-sm font-medium text-white outline-none ring-2 ring-transparent transition-transform focus:translate-y-3 focus:ring-violet-200"
      >
        К основному содержимому
      </a>
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3 sm:px-6 lg:px-8">
          <span className="mr-auto text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
            Рабочее место
          </span>
          <nav className="flex flex-wrap gap-1 sm:gap-2" aria-label="Основные разделы">
            <NavLink to="/" end className={tabClassName}>
              Поток
            </NavLink>
            <NavLink to="/structures" className={tabClassName}>
              Структуры из промптов
            </NavLink>
            <NavLink to="/plan" className={tabClassName}>
              План: вопросы
            </NavLink>
            <NavLink to="/orchestra" className={tabClassName}>
              Оркестр
            </NavLink>
          </nav>
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className="flex flex-1 flex-col outline-none">
        <Outlet />
      </main>
    </div>
  )
}
