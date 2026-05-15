import { describe, expect, it } from 'vitest'
import { mergeStructureNotes, pruneEmptyStructureNotes } from './structureNotes'

describe('structureNotes', () => {
  it('mergeStructureNotes накладывает patch поверх base', () => {
    const base = { a: 'one', b: 'two' }
    const patch = { b: 'updated', c: 'new' }
    expect(mergeStructureNotes(base, patch)).toEqual({
      a: 'one',
      b: 'updated',
      c: 'new',
    })
  })

  it('pruneEmptyStructureNotes убирает пустые и пробельные строки', () => {
    expect(
      pruneEmptyStructureNotes({
        keep: 'text',
        drop: '',
        spaces: '   ',
      }),
    ).toEqual({ keep: 'text' })
  })
})
