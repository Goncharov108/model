import type {
  CanonGraphState,
  CanonLayer,
  CanonLayerId,
  CanonSubject,
  CanonSubjectId,
  CanonRelation,
} from '../domain/canonDomainModel'
import { createEmptyCanonGraph } from '../domain/canonDomainModel'
import { newId } from './newId'

/** Сериализуемый снимок графа для persist и UI. */
export type CanonDomainCollections = {
  layers: CanonLayer[]
  subjects: CanonSubject[]
  relations: CanonRelation[]
}

const EMPTY_COLLECTIONS: CanonDomainCollections = {
  layers: [],
  subjects: [],
  relations: [],
}

/** Пустые коллекции для инициализации стора. */
export function emptyCanonDomainCollections(): CanonDomainCollections {
  return { ...EMPTY_COLLECTIONS, layers: [], subjects: [], relations: [] }
}

/** Собирает in-memory граф из массивов. */
export function collectionsToGraph(collections: CanonDomainCollections): CanonGraphState {
  const graph = createEmptyCanonGraph()
  for (const layer of collections.layers) graph.layers.set(layer.id, layer)
  for (const subject of collections.subjects) graph.subjects.set(subject.id, subject)
  graph.relations = [...collections.relations]
  return graph
}

/** Разворачивает граф в массивы для списков в UI. */
export function graphToCollections(graph: CanonGraphState): CanonDomainCollections {
  return {
    layers: [...graph.layers.values()].sort((a, b) => a.label.localeCompare(b.label, 'ru')),
    subjects: [...graph.subjects.values()].sort((a, b) =>
      a.displayLabel.localeCompare(b.displayLabel, 'ru'),
    ),
    relations: [...graph.relations],
  }
}

/** Добавляет слой; возвращает обновлённые коллекции или сообщение об ошибке. */
export function addLayerToCollections(
  collections: CanonDomainCollections,
  input: { label: string; visibility: CanonLayer['visibility']; id?: CanonLayerId },
): { ok: true; collections: CanonDomainCollections } | { ok: false; message: string } {
  const label = input.label.trim()
  if (!label) return { ok: false, message: 'Укажите название слоя.' }
  const id = input.id?.trim() || newId()
  if (collections.layers.some((l) => l.id === id)) {
    return { ok: false, message: `Слой с id «${id}» уже есть.` }
  }
  const layer: CanonLayer = { id, label, visibility: input.visibility }
  return {
    ok: true,
    collections: { ...collections, layers: [...collections.layers, layer] },
  }
}

/** Добавляет субъекта; возвращает обновлённые коллекции или сообщение об ошибке. */
export function addSubjectToCollections(
  collections: CanonDomainCollections,
  input: {
    displayLabel: string
    kind: CanonSubject['kind']
    id?: CanonSubjectId
  },
): { ok: true; collections: CanonDomainCollections } | { ok: false; message: string } {
  const displayLabel = input.displayLabel.trim()
  if (!displayLabel) return { ok: false, message: 'Укажите подпись субъекта.' }
  const id = input.id?.trim() || newId()
  if (collections.subjects.some((s) => s.id === id)) {
    return { ok: false, message: `Субъект с id «${id}» уже есть.` }
  }
  const subject: CanonSubject = { id, displayLabel, kind: input.kind }
  return {
    ok: true,
    collections: { ...collections, subjects: [...collections.subjects, subject] },
  }
}
