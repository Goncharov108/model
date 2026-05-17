import type { ReactNode } from 'react'
import { useEffect } from 'react'

/** Выдвижная панель меню на мобильном (backdrop + панель слева). */
export function SidebarDrawer(props: {
  open: boolean
  onClose: () => void
  children: ReactNode
  /** Подпись для кнопки закрытия (screen readers). */
  label?: string
}) {
  const { open, onClose, children, label = 'Закрыть меню' } = props

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label={label}
        onClick={onClose}
      />
      <div className="absolute inset-y-0 left-0 flex w-[min(100%,18rem)] flex-col border-r border-zinc-800 bg-zinc-950 shadow-2xl motion-safe:animate-[masterPanelIn_0.25s_ease-out]">
        {children}
      </div>
    </div>
  )
}
