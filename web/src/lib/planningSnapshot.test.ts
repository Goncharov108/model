import { describe, expect, it } from 'vitest'
import { buildPlanningExport, parsePlanningImport } from './planningSnapshot'

describe('planningSnapshot', () => {
  it('parsePlanningImport отклоняет невалидный JSON', () => {
    const r = parsePlanningImport('not json')
    expect(r.ok).toBe(false)
  })

  it('roundtrip ответов опросника', () => {
    const answers = {
      q1: { optionId: 'opt-a', customText: '' },
      q2: { optionId: null, customText: 'Свой текст' },
    }
    const json = JSON.stringify(buildPlanningExport(answers))
    const r = parsePlanningImport(json)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.answers).toEqual(answers)
  })
})
