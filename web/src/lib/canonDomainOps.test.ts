import { describe, expect, it } from 'vitest'
import {
  addLayerToCollections,
  addSubjectToCollections,
  collectionsToGraph,
  emptyCanonDomainCollections,
  graphToCollections,
} from './canonDomainOps'
import { createEmptyCanonGraph } from '../domain/canonDomainModel'

describe('canonDomainOps', () => {
  it('graphToCollections и collectionsToGraph — roundtrip', () => {
    const graph = createEmptyCanonGraph()
    graph.layers.set('l1', { id: 'l1', label: 'Работа', visibility: 'work' })
    graph.subjects.set('s1', { id: 's1', displayLabel: 'Владелец', kind: 'human' })
    const collections = graphToCollections(graph)
    const back = collectionsToGraph(collections)
    expect(back.layers.get('l1')?.label).toBe('Работа')
    expect(back.subjects.get('s1')?.displayLabel).toBe('Владелец')
  })

  it('addLayerToCollections отклоняет пустую подпись', () => {
    const r = addLayerToCollections(emptyCanonDomainCollections(), {
      label: '  ',
      visibility: 'private',
    })
    expect(r.ok).toBe(false)
  })

  it('addSubjectToCollections добавляет субъекта', () => {
    const base = emptyCanonDomainCollections()
    const r = addSubjectToCollections(base, { displayLabel: 'Агент Cursor', kind: 'agent' })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.collections.subjects).toHaveLength(1)
    expect(r.collections.subjects[0]?.kind).toBe('agent')
  })
})
