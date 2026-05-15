/** Общая шапка экрана: eyebrow, заголовок, описание. */
export function PageHeader(props: {
  eyebrow: string
  title: string
  description: string
}) {
  const { eyebrow, title, description } = props
  return (
    <header className="space-y-3 border-b border-zinc-800 pb-8">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-300/90">{eyebrow}</p>
      <h1 className="text-balance text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
        {title}
      </h1>
      <p className="max-w-3xl text-pretty text-sm leading-relaxed text-zinc-400 sm:text-base">
        {description}
      </p>
    </header>
  )
}
