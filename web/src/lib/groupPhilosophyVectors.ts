import type { PhilosophyVector, PhilosophyVectorCategory } from '../domain/philosophyVector'

/** Подписи слоёв карты для фильтра и легенды. */
export const PHILOSOPHY_CATEGORY_LABELS: Record<
  PhilosophyVectorCategory,
  { label: string; hint: string; accent: string }
> = {
  core: {
    label: 'Ядро',
    hint: 'Замысел и позиция',
    accent: 'border-amber-500/50 bg-amber-950/30',
  },
  life: {
    label: 'Жизнь',
    hint: 'Кто ты, цели, роли — не продукт',
    accent: 'border-orange-400/45 bg-orange-950/25',
  },
  product: {
    label: 'Продукт',
    hint: 'Скиллы, глубина, UI',
    accent: 'border-violet-500/50 bg-violet-950/25',
  },
  market: {
    label: 'Рынок',
    hint: 'Кому и как рассказывать',
    accent: 'border-sky-500/50 bg-sky-950/25',
  },
  money: {
    label: 'Деньги',
    hint: 'Монетизация',
    accent: 'border-emerald-500/50 bg-emerald-950/25',
  },
  process: {
    label: 'Процесс',
    hint: 'Философ и агенты',
    accent: 'border-rose-500/50 bg-rose-950/25',
  },
  ops: {
    label: 'Операции',
    hint: 'Репо, деплой, видимость',
    accent: 'border-zinc-500/50 bg-zinc-900/50',
  },
  personal: {
    label: 'Личное',
    hint: 'Только у тебя',
    accent: 'border-fuchsia-500/50 bg-fuchsia-950/20',
  },
}

const CATEGORY_ORDER: PhilosophyVectorCategory[] = [
  'core',
  'life',
  'product',
  'market',
  'money',
  'process',
  'ops',
  'personal',
]

/** Группирует векторы по категории в фиксированном порядке слоёв. */
export function groupPhilosophyVectors(vectors: PhilosophyVector[]) {
  return CATEGORY_ORDER.map((category) => ({
    category,
    ...PHILOSOPHY_CATEGORY_LABELS[category],
    items: vectors.filter((v) => v.category === category),
  })).filter((g) => g.items.length > 0)
}

/** Статус вектора — короткая подпись для UI. */
export function philosophyStatusLabel(status: PhilosophyVector['status']): string {
  if (status === 'fixed') return 'Зафиксировано'
  if (status === 'open') return 'В обсуждении'
  return 'Позже'
}
