import type { JSX } from 'react'
import { useMemo, useState } from 'react'
import { PHILOSOPHY_VECTORS_SEED } from '../../data/philosophyVectorsSeed'
import { PhilosophyVectorCard } from './PhilosophyVectorCard'

/** Отдельный экран слоя «Жизнь»: кто ты, цели, роли — без продуктовой простыни. */
export function PhilosophyLifeView(): JSX.Element {
  const lifeVectors = useMemo(
    () => PHILOSOPHY_VECTORS_SEED.filter((v) => v.category === 'life'),
    [],
  )
  const [expandedId, setExpandedId] = useState<string | null>(lifeVectors[0]?.id ?? null)

  const titleById = useMemo(() => {
    const m = new Map<string, string>()
    for (const v of PHILOSOPHY_VECTORS_SEED) m.set(v.id, v.title)
    return m
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-orange-500/35 bg-orange-950/20 px-5 py-4">
        <p className="text-sm font-medium text-orange-100">Слой «Жизнь»</p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Карточки ниже совмещают **наводящие вопросы** и **уже зафиксированные** твоими словами тезисы
          (обновляются из чата → сид в Git → эта страница после деплоя). Глубина и правки — вкладка
          **«Мой текст»** и файл на диске при локальном dev.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {lifeVectors.map((vector) => (
          <PhilosophyVectorCard
            key={vector.id}
            vector={vector}
            expanded={expandedId === vector.id}
            onToggle={() => setExpandedId((id) => (id === vector.id ? null : vector.id))}
            linkedTitles={(vector.linksTo ?? [])
              .map((id) => titleById.get(id))
              .filter((t): t is string => Boolean(t))}
          />
        ))}
      </div>
    </div>
  )
}
