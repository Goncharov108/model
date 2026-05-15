import type { JSX } from 'react'
import type { ExternalAnalysisV1 } from '../../domain/analysisTypes'
import { resolveThemeBlockIndices } from '../../analysis/themeBlockLink'

type Theme = ExternalAnalysisV1['themes'][number]

/** Ссылки с темы внешнего анализа на якоря блоков локального конвейера (если индексы валидны). */
export function ThemeBlockAnchors(props: { theme: Theme; blockCount: number }): JSX.Element | null {
  const { theme, blockCount } = props
  const idxs = resolveThemeBlockIndices(theme, blockCount)
  const hinted = (theme.relatedBlockIndices?.length ?? 0) > 0

  if (hinted && blockCount === 0) {
    return (
      <p className="mt-2 text-xs text-amber-400/90">
        В теме указаны номера блоков — запустите локальный анализ, чтобы перейти к тексту.
      </p>
    )
  }

  if (idxs.length === 0) return null

  return (
    <p className="mt-2 text-xs text-zinc-500">
      Блоки локального анализа:{' '}
      {idxs.map((i, n) => (
        <span key={i}>
          {n > 0 ? ', ' : null}
          <a
            href={`#analysis-block-${i}`}
            className="text-violet-300 underline-offset-2 hover:text-violet-200 hover:underline"
          >
            #{i + 1}
          </a>
        </span>
      ))}
    </p>
  )
}
