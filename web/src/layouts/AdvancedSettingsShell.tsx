import { Outlet } from 'react-router-dom'

/** Оболочка «Продвинутые настройки»: прежний полноэкранный UI (навигация — в панели Мастер-админ). */
export function AdvancedSettingsShell() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Outlet />
    </div>
  )
}
