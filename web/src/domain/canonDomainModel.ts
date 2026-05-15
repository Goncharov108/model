/**
 * Черновой словарь домена по канону-3 (слои, субъекты, отношения).
 * Без бэкенда: только типы и пустой граф для дальнейшего наращивания.
 */

export type CanonLayerId = string
export type CanonSubjectId = string

/** Слой видимости / контекста (упрощённая классификация под прототип). */
export interface CanonLayer {
  id: CanonLayerId
  label: string
  /** Грубая политика видимости для UI-прототипа. */
  visibility: 'private' | 'family' | 'work' | 'community' | 'public'
}

/** Субъект доступа: человек, агент или сервисная учётная запись. */
export interface CanonSubject {
  id: CanonSubjectId
  displayLabel: string
  /** Человек, агент или сервис. */
  kind: 'human' | 'agent' | 'service'
}

/** Отношение между субъектами (ReBAC-заготовка). */
export interface CanonRelation {
  id: string
  fromSubjectId: CanonSubjectId
  toSubjectId: CanonSubjectId
  kind: 'trust' | 'delegation' | 'guest' | 'membership'
}

/** In-memory граф без персистентности. */
export interface CanonGraphState {
  layers: Map<CanonLayerId, CanonLayer>
  subjects: Map<CanonSubjectId, CanonSubject>
  relations: CanonRelation[]
}

/** Пустой граф для инициализации стора или тестов. */
export function createEmptyCanonGraph(): CanonGraphState {
  return {
    layers: new Map(),
    subjects: new Map(),
    relations: [],
  }
}
