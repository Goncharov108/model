import { describe, expect, it } from 'vitest'
import { createEmptyCanonGraph } from './canonDomainModel'

describe('canonDomainModel', () => {
  it('createEmptyCanonGraph даёт пустые коллекции', () => {
    const g = createEmptyCanonGraph()
    expect(g.layers.size).toBe(0)
    expect(g.subjects.size).toBe(0)
    expect(g.relations).toEqual([])
  })
})
