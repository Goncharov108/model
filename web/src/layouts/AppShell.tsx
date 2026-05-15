import { Outlet, useLocation } from 'react-router-dom'
import { MainSidebar } from '../components/shell/MainSidebar'
import { MasterAdminSidebar } from '../components/shell/MasterAdminSidebar'
import {
  MAIN_SIDEBAR_OFFSET_CLASS,
  MAIN_SIDEBAR_WIDTH_CLASS,
} from '../components/shell/shellLayout'
import { PATH } from '../lib/appPaths'

/** Оболочка: фиксированное главное меню, оверлей Мастер-админ, прокручиваемый контент. */
export function AppShell() {
  const { pathname } = useLocation()
  const showMasterPanel = pathname.startsWith(PATH.masterAdmin.root)

  return (
    <div className="min-h-svh bg-zinc-950">
      <a
        href="#main-content"
        className="fixed left-4 top-0 z-[100] -translate-y-full rounded-lg bg-violet-700 px-4 py-2 text-sm font-medium text-white outline-none ring-2 ring-transparent transition-transform focus:translate-y-3 focus:ring-violet-200"
      >
        К основному содержимому
      </a>

      <div
        className={`fixed inset-y-0 left-0 z-40 flex ${MAIN_SIDEBAR_WIDTH_CLASS} flex-col overflow-hidden border-r border-zinc-800 bg-zinc-950`}
      >
        <MainSidebar />
      </div>

      {showMasterPanel ? (
        <>
          <div
            className={`pointer-events-none fixed inset-y-0 left-0 z-[45] ${MAIN_SIDEBAR_WIDTH_CLASS} bg-black/25 transition-opacity duration-300`}
            aria-hidden
          />
          <MasterAdminSidebar />
        </>
      ) : null}

      <main
        id="main-content"
        tabIndex={-1}
        className={`flex min-h-svh min-w-0 flex-col outline-none ${MAIN_SIDEBAR_OFFSET_CLASS}`}
      >
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
