import type { ReactNode } from 'react'
import type { JSX } from 'react'

/** Карточка секции с единым оформлением; title опционален для плотных вложенных блоков. */
export function SurfaceCard(props: {
  title?: string
  description?: string
  children?: ReactNode
  className?: string
}): JSX.Element {
  const { title, description, children, className = '' } = props
  return (
    <article
      className={`rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 shadow-lg shadow-black/20 backdrop-blur ${className}`}
    >
      {title ? <h2 className="text-sm font-semibold text-zinc-100">{title}</h2> : null}
      {description ? (
        <p className={`text-sm leading-relaxed text-zinc-400 ${title ? 'mt-2' : ''}`}>{description}</p>
      ) : null}
      {children}
    </article>
  )
}
