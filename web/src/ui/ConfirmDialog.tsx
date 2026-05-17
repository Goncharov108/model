import type { JSX, ReactNode } from 'react'
import { useEffect, useId, useRef } from 'react'
import { AppButton } from './AppButton'

type ConfirmVariant = 'danger' | 'primary'

/** Модальное подтверждение на `<dialog>`: ловушка фокуса и Escape обрабатывает браузер. */
export function ConfirmDialog(props: {
  open: boolean
  title: string
  description: ReactNode
  details?: ReactNode
  confirmLabel: string
  cancelLabel?: string
  confirmVariant?: ConfirmVariant
  onConfirm: () => void
  onCancel: () => void
}): JSX.Element {
  const {
    open,
    title,
    description,
    details,
    confirmLabel,
    cancelLabel = 'Отмена',
    confirmVariant = 'primary',
    onConfirm,
    onCancel,
  } = props
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descId = useId()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open) {
      if (!el.open) el.showModal()
    } else if (el.open) {
      el.close()
    }
  }, [open])

  return (
    <dialog
      ref={ref}
      className="w-[min(100%,28rem)] rounded-2xl border border-zinc-700 bg-zinc-900 p-6 text-zinc-100 shadow-2xl backdrop:bg-black/70"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
      onCancel={(e) => {
        e.preventDefault()
        onCancel()
      }}
    >
      <h2 id={titleId} className="text-lg font-semibold text-zinc-50">
        {title}
      </h2>
      <div id={descId} className="mt-2 text-sm leading-relaxed text-zinc-400">
        {description}
      </div>
      {details ? <div className="mt-3">{details}</div> : null}
      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <AppButton type="button" variant="ghost" onClick={onCancel}>
          {cancelLabel}
        </AppButton>
        <AppButton
          type="button"
          variant={confirmVariant === 'danger' ? 'danger' : 'primary'}
          onClick={() => {
            onConfirm()
            onCancel()
          }}
        >
          {confirmLabel}
        </AppButton>
      </div>
    </dialog>
  )
}
