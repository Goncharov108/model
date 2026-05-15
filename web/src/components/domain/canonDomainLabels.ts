import type { CanonLayer, CanonSubject } from '../../domain/canonDomainModel'

/** Подпись политики видимости слоя для UI. */
export function layerVisibilityLabel(visibility: CanonLayer['visibility']): string {
  const map: Record<CanonLayer['visibility'], string> = {
    private: 'Личное',
    family: 'Семья',
    work: 'Работа',
    community: 'Сообщество',
    public: 'Публичное',
  }
  return map[visibility]
}

/** Подпись вида субъекта для UI. */
export function subjectKindLabel(kind: CanonSubject['kind']): string {
  const map: Record<CanonSubject['kind'], string> = {
    human: 'Человек',
    agent: 'Агент',
    service: 'Сервис',
  }
  return map[kind]
}

export const LAYER_VISIBILITY_OPTIONS: CanonLayer['visibility'][] = [
  'private',
  'family',
  'work',
  'community',
  'public',
]

export const SUBJECT_KIND_OPTIONS: CanonSubject['kind'][] = ['human', 'agent', 'service']
