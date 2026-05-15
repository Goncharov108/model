import { describe, expect, it } from 'vitest'
import type { AppUser } from '../domain/appUser'
import { filterAndSortUsers } from './usersDatabaseFilter'

const sample: AppUser[] = [
  {
    id: '1',
    displayName: 'Анна',
    phone: '+7900',
    role: 'developer',
    photoDataUrl: null,
    createdAtIso: '2026-01-01',
    updatedAtIso: '2026-01-02',
  },
  {
    id: '2',
    displayName: 'Борис',
    phone: '',
    role: 'guest',
    photoDataUrl: null,
    createdAtIso: '2026-01-01',
    updatedAtIso: '2026-01-03',
  },
]

describe('filterAndSortUsers', () => {
  it('фильтрует по запросу и роли', () => {
    const r = filterAndSortUsers(sample, 'анн', 'developer', 'name')
    expect(r).toHaveLength(1)
    expect(r[0]?.id).toBe('1')
  })

  it('сортирует по дате обновления', () => {
    const r = filterAndSortUsers(sample, '', 'all', 'updated')
    expect(r[0]?.id).toBe('2')
  })
})
