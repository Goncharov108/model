import { describe, expect, it } from 'vitest'
import {
  buildIncomingClusters,
  buildIncomingEntityMap,
  buildIncomingGraphData,
  buildIncomingInsights,
  buildIncomingTimeline,
  createHermesVideoSeedSnapshot,
} from './telegramIncomingVisuals'

describe('telegramIncomingVisuals', () => {
  it('строит seed snapshot по последнему видео', () => {
    const snapshot = createHermesVideoSeedSnapshot()
    expect(snapshot.sourceName).toContain('Hermes video seed')
    expect(snapshot.items.length).toBeGreaterThanOrEqual(5)
    expect(snapshot.items.some((item) => item.links.includes('https://youtu.be/k5NhsF7t68M'))).toBe(true)
  })

  it('собирает граф, таймлайн и инсайты без пустых структур', () => {
    const snapshot = createHermesVideoSeedSnapshot()
    const graph = buildIncomingGraphData(snapshot, snapshot.items)
    const timeline = buildIncomingTimeline(snapshot.items)
    const insights = buildIncomingInsights(snapshot.items)
    const clusters = buildIncomingClusters(snapshot.items)

    expect(graph.nodes.some((node) => node.id === 'source')).toBe(true)
    expect(graph.edges.length).toBeGreaterThan(0)
    expect(timeline.length).toBeGreaterThan(0)
    expect(insights).toHaveLength(4)
    expect(clusters).toHaveLength(4)
  })

  it('строит слой сущностей и связи между ними', () => {
    const snapshot = createHermesVideoSeedSnapshot()
    const entityMap = buildIncomingEntityMap(snapshot.items)

    expect(entityMap.entities.length).toBeGreaterThan(0)
    expect(entityMap.entities.some((entity) => entity.kind === 'project' && entity.label.toLowerCase().includes('hermes'))).toBe(true)
    expect(entityMap.entities.some((entity) => entity.kind === 'task')).toBe(true)
    expect(entityMap.noteLinks.length).toBeGreaterThan(0)
    expect(entityMap.relations.length).toBeGreaterThan(0)
  })
})
