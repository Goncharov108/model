import { Outlet } from 'react-router-dom'

/** Общая оболочка: фон, типографика, область под страницы. */
export function AppShell() {
  return (
    <div className="flex min-h-svh flex-col">
      <Outlet />
    </div>
  )
}
