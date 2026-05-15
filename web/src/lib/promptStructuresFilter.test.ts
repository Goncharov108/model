import { describe, expect, it } from 'vitest'
import type { PromptStructureItem } from '../domain/promptStructure'
import {
  collectStructureTags,
  filterPromptStructures,
  formatStructureSummaryForChat,
  matchesStructureSearch,
} from './promptStructuresFilter'

const sample: PromptStructureItem[] = [
  {
    id: 'a',
    title: 'Свод законов',
    summary: 'Единый реестр правил',
    tags: ['governance', 'docs'],
    sourceHint: 'промпт 1',
    createdAtIso: '2026-05-15T00:00:00.000Z',
  },
  {
    id: 'b',
    title: 'Личный слой',
    summary: 'private/ без Git',
    tags: ['privacy', 'git'],
    sourceHint: 'промпт 2',
    createdAtIso: '2026-05-15T00:00:00.000Z',
  },
]

describe('matchesStructureSearch', () => {
  it('пустой запрос совпадает со всеми', () => {
    expect(matchesStructureSearch(sample[0], '')).toBe(true)
    expect(matchesStructureSearch(sample[0], '   ')).toBe(true)
  })

  it('ищет по заголовку, summary и тегам без учёта регистра', () => {
    expect(matchesStructureSearch(sample[0], 'свод')).toBe(true)
    expect(matchesStructureSearch(sample[0], 'РЕЕСТР')).toBe(true)
    expect(matchesStructureSearch(sample[0], 'GOVERNANCE')).toBe(true)
    expect(matchesStructureSearch(sample[0], 'private')).toBe(false)
  })
})

describe('filterPromptStructures', () => {
  it('возвращает все при пустых фильтрах', () => {
    expect(filterPromptStructures(sample, '', null)).toHaveLength(2)
  })

  it('сужает по тексту и тегу', () => {
    expect(filterPromptStructures(sample, 'git', null)).toHaveLength(1)
    expect(filterPromptStructures(sample, '', 'docs')[0]?.id).toBe('a')
    expect(filterPromptStructures(sample, 'реестр', 'governance')).toHaveLength(1)
    expect(filterPromptStructures(sample, 'реестр', 'privacy')).toHaveLength(0)
  })
})

describe('collectStructureTags', () => {
  it('собирает уникальные теги', () => {
    expect(collectStructureTags(sample)).toEqual(['docs', 'git', 'governance', 'privacy'])
  })
})

describe('formatStructureSummaryForChat', () => {
  it('формирует блок для чата', () => {
    const text = formatStructureSummaryForChat(sample[0])
    expect(text).toContain('## Свод законов')
    expect(text).toContain('Единый реестр правил')
    expect(text).toContain('id: a')
    expect(text).toContain('Теги: governance, docs')
  })
})
