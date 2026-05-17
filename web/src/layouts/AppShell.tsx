import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { MainSidebar } from '../components/shell/MainSidebar'
import { MasterAdminSidebar } from '../components/shell/MasterAdminSidebar'
import { MobileShellBar } from '../components/shell/MobileShellBar'
import { SidebarDrawer } from '../components/shell/SidebarDrawer'
import {
  MAIN_CONTENT_TOP_MOBILE_CLASS,
  MAIN_SIDEBAR_OFFSET_CLASS,
  MAIN_SIDEBAR_WIDTH_CLASS,
} from '../components/shell/shellLayout'
import { PATH } from '../lib/appPaths'

/** Оболочка: desktop-меню, мобильный drawer, оверлей Мастер-админ, контент. */
export function AppShell() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  /** Путь, на котором открыт drawer; при смене маршрута панель закрывается без effect. */
  const [drawerPath, setDrawerPath] = useState<string | null>(null)
  const drawerOpen = drawerPath === pathname
  const showMasterPanel = pathname.startsWith(PATH.masterAdmin.root)

  const openDrawer = () => setDrawerPath(pathname)
  const closeDrawer = () => setDrawerPath(null)

  return (
    <div className="min-h-svh bg-zinc-950">
      <a
        href="#main-content"
        className="fixed left-4 top-0 z-[100] -translate-y-full rounded-lg bg-violet-700 px-4 py-2 text-sm font-medium text-white outline-none ring-2 ring-transparent transition-transform focus:translate-y-3 focus:ring-violet-200 lg:focus:translate-y-3"
      >
        К основному содержимому
      </a>

      <div
        className={`fixed inset-y-0 left-0 z-40 hidden lg:flex ${MAIN_SIDEBAR_WIDTH_CLASS} flex-col overflow-hidden border-r border-zinc-800 bg-zinc-950`}
      >
        <MainSidebar />
      </div>

      <MobileShellBar
        onOpenDrawer={openDrawer}
        onBackToMain={() => {
          closeDrawer()
          navigate(PATH.home)
        }}
      />

      <SidebarDrawer open={drawerOpen} onClose={closeDrawer}>
        {showMasterPanel ? (
          <MasterAdminSidebar variant="drawer" onNavigate={closeDrawer} />
        ) : (
          <MainSidebar onNavigate={closeDrawer} />
        )}
      </SidebarDrawer>

      {showMasterPanel ? (
        <>
          <div
            className={`pointer-events-none fixed inset-y-0 left-0 z-[45] hidden ${MAIN_SIDEBAR_WIDTH_CLASS} bg-black/25 transition-opacity duration-300 lg:block`}
            aria-hidden
          />
          <MasterAdminSidebar variant="fixed" />
        </>
      ) : null}

      <main
        id="main-content"
        tabIndex={-1}
        className={`flex min-h-svh min-w-0 flex-col outline-none ${MAIN_SIDEBAR_OFFSET_CLASS} ${MAIN_CONTENT_TOP_MOBILE_CLASS}`}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
