import { NavLink, useLocation } from 'react-router-dom'
import { MAIN_APP_NAV, PATH } from '../../lib/appPaths'
import { sidebarNavClass } from '../../ui/sidebarNav'
import { AccountProfileBlock } from './AccountProfileBlock'

/** Главное боковое меню приложения. */
export function MainSidebar() {
  const { pathname } = useLocation()

  return (
    <aside
      className="flex h-full min-h-0 w-full flex-col"
      aria-label="Главное меню"
    >
      <div className="border-b border-zinc-800 px-4 py-4">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">model</p>
        <p className="mt-1 text-sm font-semibold text-zinc-100">Рабочее место</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3" aria-label="Разделы">
        <NavLink
          to={PATH.account}
          className={({ isActive }) => sidebarNavClass(isActive)}
        >
          Настройки аккаунта
        </NavLink>
        {MAIN_APP_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => sidebarNavClass(isActive)}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-2 border-t border-zinc-800 p-3">
        <AccountProfileBlock />
        <NavLink
          to={PATH.masterAdmin.overview}
          className={({ isActive }) =>
            sidebarNavClass(isActive || pathname.startsWith(PATH.masterAdmin.root))
          }
        >
          Мастер-админ
        </NavLink>
        <NavLink to={PATH.admin} className={({ isActive }) => sidebarNavClass(isActive)}>
          Админ-панель
        </NavLink>
      </div>
    </aside>
  )
}
