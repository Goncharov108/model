/** Минимум блоков, при котором показывается боковое оглавление. */
export const BLOCKS_TOC_MIN_COUNT = 5

type BlockRef = { id: string; index: number; wordCount: number }

/** Sticky-оглавление якорей к блокам локального анализа (lg+). */
export function AnalysisBlocksOutline(props: { blocks: BlockRef[] }) {
  const { blocks } = props
  if (blocks.length < BLOCKS_TOC_MIN_COUNT) return null

  return (
    <nav
      className="hidden shrink-0 lg:block lg:w-44 xl:w-52"
      aria-label="Оглавление блоков анализа"
    >
      <div className="sticky top-24 max-h-[calc(100svh-7rem)] overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Блоки
        </p>
        <ul className="space-y-1">
          {blocks.map((block) => (
            <li key={block.id}>
              <a
                href={`#analysis-block-${block.index}`}
                className="block rounded-md px-2 py-1.5 text-xs text-zinc-400 transition hover:bg-zinc-800/80 hover:text-violet-200"
              >
                #{block.index + 1}
                <span className="ml-1 text-zinc-600">· {block.wordCount} сл.</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
