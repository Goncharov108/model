import { describe, expect, it } from 'vitest'
import { parseExternalAnalysisJson } from './parseExternalAnalysisJson'

const minimalValid = {
  version: 1,
  generatedAt: '2026-05-15T12:00:00.000Z',
  summary: 'Краткое резюме',
  themes: [{ id: 't1', title: 'Тема', rationale: 'Почему' }],
  tensions: ['напряжение'],
  hypotheses: ['гипотеза'],
}

describe('parseExternalAnalysisJson', () => {
  it('отклоняет невалидный JSON', () => {
    const r = parseExternalAnalysisJson('x')
    expect(r.ok).toBe(false)
  })

  it('принимает минимально корректный ExternalAnalysisV1', () => {
    const r = parseExternalAnalysisJson(JSON.stringify(minimalValid))
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.value.summary).toBe('Краткое резюме')
    expect(r.value.themes).toHaveLength(1)
    expect(r.value.themes[0].id).toBe('t1')
  })

  it('отклоняет тему без rationale', () => {
    const bad = {
      ...minimalValid,
      themes: [{ id: 't1', title: 'Т', rationale: '' }],
    }
    const r = parseExternalAnalysisJson(JSON.stringify(bad))
    expect(r.ok).toBe(false)
  })
})
