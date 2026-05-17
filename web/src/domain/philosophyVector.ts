/** Слой карты сознания / стратегии на вкладке «Философия». */
export type PhilosophyVectorCategory =
  | 'core'
  | 'life'
  | 'product'
  | 'market'
  | 'money'
  | 'process'
  | 'ops'
  | 'personal'

/** Статус вектора: зафиксировано, в работе, отложено. */
export type PhilosophyVectorStatus = 'fixed' | 'open' | 'later'

/** Один вектор — направление мысли с связями и опорными пунктами. */
export type PhilosophyVector = {
  id: string
  category: PhilosophyVectorCategory
  title: string
  essence: string
  status: PhilosophyVectorStatus
  bullets: string[]
  lawRef?: string
  /** id других векторов для визуальных связей */
  linksTo?: string[]
}

/** Мета карты (версия сида для UI). */
export type PhilosophyMapMeta = {
  title: string
  subtitle: string
  updatedAt: string
  centerLabel: string
}
