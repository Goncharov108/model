import { Link, NavLink, useLocation } from 'react-router-dom'
import { MASTER_ADMIN_NAV, PATH } from '../../lib/appPaths'
import { sidebarNavClass } from '../../ui/sidebarNav'
import { MAIN_SIDEBAR_WIDTH_CLASS } from './shellLayout'

/** Панель «Мастер-админ»: оверлей на desktop или содержимое мобильного drawer. */
export function MasterAdminSidebar(props: {
  variant?: 'fixed' | 'drawer'
  onNavigate?: () => void
}) {
  const { variant = 'fixed', onNavigate } = props
  const { pathname } = useLocation()
  const inAdvanced = pathname.startsWith(PATH.masterAdmin.advanced.root)
  const isDrawer = variant === 'drawer'

  const shellClass = isDrawer
    ? `flex h-full w-full flex-col overflow-hidden border-r border-amber-500/15 bg-zinc-900`
    : `fixed inset-y-0 left-0 z-50 hidden lg:flex ${MAIN_SIDEBAR_WIDTH_CLASS} flex-col overflow-hidden border-r border-amber-500/15 bg-zinc-900/92 shadow-[10px_0_40px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-[transform,opacity,box-shadow] duration-300 ease-out motion-safe:animate-[masterPanelIn_0.32s_ease-out]`

  return (
    <aside className={shellClass} aria-label="Мастер-админ">
      <div className="border-b border-zinc-800/80 bg-zinc-950/40 px-3 py-3">
        <Link
          to={PATH.home}
          onClick={onNavigate}
          className="mb-3 flex w-full items-center gap-2 rounded-lg border border-zinc-700/80 bg-zinc-950/60 px-3 py-2 text-sm font-medium text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-800/80"
        >
          <span aria-hidden>←</span>
          Общее меню
        </Link>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-amber-400/90">
          Мастер-админ
        </p>
        <p className="mt-1 text-sm text-zinc-400">Управление и расширенный режим</p>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3">
        {MASTER_ADMIN_NAV.map((item) => (
          <div key={item.to}>
            <NavLink
              to={item.to}
              onClick={onNavigate}
              end={item.to === PATH.masterAdmin.advanced.root ? false : true}
              className={({ isActive }) => {
                const active =
                  item.to === PATH.masterAdmin.advanced.root ? inAdvanced : isActive
                return sidebarNavClass(active)
              }}
            >
              {item.label}
            </NavLink>
            {item.to === PATH.masterAdmin.advanced.root && inAdvanced ? (
              <p className="ml-1 mt-1 px-2 text-[11px] leading-snug text-zinc-500">
                Разделы — в колонке справа в рабочей области
              </p>
            ) : null}
          </div>
        ))}
      </nav>
    </aside>
  )
}
