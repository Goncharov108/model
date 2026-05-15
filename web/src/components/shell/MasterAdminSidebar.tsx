import { Link, NavLink, useLocation } from 'react-router-dom'
import {
  ADVANCED_SETTINGS_NAV,
  MASTER_ADMIN_NAV,
  PATH,
} from '../../lib/appPaths'
import { sidebarNavClass, sidebarSubNavClass } from '../../ui/sidebarNav'
import { MAIN_SIDEBAR_WIDTH_CLASS } from './shellLayout'

/** Панель «Мастер-админ»: фиксированный оверлей поверх главного меню. */
export function MasterAdminSidebar() {
  const { pathname } = useLocation()
  const inAdvanced = pathname.startsWith(PATH.masterAdmin.advanced.root)

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex ${MAIN_SIDEBAR_WIDTH_CLASS} flex-col overflow-hidden border-r border-amber-500/15 bg-zinc-900/92 shadow-[10px_0_40px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-[transform,opacity,box-shadow] duration-300 ease-out motion-safe:animate-[masterPanelIn_0.32s_ease-out]`}
      aria-label="Мастер-админ"
    >
      <div className="border-b border-zinc-800/80 bg-zinc-950/40 px-3 py-3">
        <Link
          to={PATH.home}
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
              <ul className="ml-2 mt-1 space-y-0.5 border-l border-zinc-700/80 pl-2">
                {ADVANCED_SETTINGS_NAV.map((sub) => (
                  <li key={sub.to}>
                    <NavLink
                      to={sub.to}
                      end={'end' in sub ? sub.end : false}
                      className={({ isActive }) => sidebarSubNavClass(isActive)}
                    >
                      {sub.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </nav>
    </aside>
  )
}
