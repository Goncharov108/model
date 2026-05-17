import { NavLink, useLocation } from 'react-router-dom'
import { ADVANCED_SETTINGS_NAV, getAdvancedNavItem } from '../../lib/appPaths'

/** Внутренняя навигация раздела «Продвинутые настройки» (десктоп — колонка, мобильный — полоса). */
export function AdvancedSettingsNav() {
  const { pathname } = useLocation()
  const current = getAdvancedNavItem(pathname)

  return (
    <>
      <nav
        className="flex gap-2 overflow-x-auto border-b border-zinc-800 bg-zinc-950/80 px-4 py-3 lg:hidden"
        aria-label="Разделы продвинутых настроек"
      >
        {ADVANCED_SETTINGS_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={'end' in item ? item.end : false}
            className={({ isActive }) =>
              [
                'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition',
                isActive
                  ? 'bg-violet-600 text-white'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200',
              ].join(' ')
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <nav
        className="hidden w-56 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950/60 lg:flex"
        aria-label="Разделы продвинутых настроек"
      >
        <div className="sticky top-0 flex max-h-[calc(100svh-8rem)] flex-col gap-1 overflow-y-auto p-3">
          {ADVANCED_SETTINGS_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={'end' in item ? item.end : false}
              className={({ isActive }) =>
                [
                  'rounded-xl px-3 py-2.5 transition outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50',
                  isActive
                    ? 'bg-violet-500/15 ring-1 ring-violet-500/35'
                    : 'hover:bg-zinc-800/60',
                ].join(' ')
              }
            >
              <span
                className={`block text-sm font-medium ${item.to === current.to ? 'text-violet-100' : 'text-zinc-200'}`}
              >
                {item.label}
              </span>
              <span className="mt-0.5 block text-xs leading-snug text-zinc-500">{item.hint}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  )
}
