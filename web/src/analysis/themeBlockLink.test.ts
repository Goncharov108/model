import { describe, expect, it } from 'vitest'
import { resolveThemeBlockIndices } from './themeBlockLink'

describe('resolveThemeBlockIndices', () => {
  it('фильтрует выход за границы', () => {
    const theme = {
      id: 't',
      title: 'T',
      rationale: 'R',
      relatedBlockIndices: [-1, 0, 2, 2],
    }
    expect(resolveThemeBlockIndices(theme, 2)).toEqual([0])
  })

  it('возвращает пустой массив без relatedBlockIndices', () => {
    const theme = { id: 't', title: 'T', rationale: 'R' }
    expect(resolveThemeBlockIndices(theme, 5)).toEqual([])
  })
})
