import { describe, expect, it } from 'vitest'
import { buildOrchestraExport, parseOrchestraImport } from './orchestraSnapshot'

describe('orchestraSnapshot', () => {
  it('parseOrchestraImport отклоняет невалидный JSON', () => {
    expect(parseOrchestraImport('{').ok).toBe(false)
  })

  it('parseOrchestraImport отклоняет неверную версию', () => {
    const r = parseOrchestraImport(JSON.stringify({ version: 2, agents: [], tickets: [] }))
    expect(r.ok).toBe(false)
  })

  it('roundtrip оркестра', () => {
    const agents = [{ id: 'a1', label: 'A', focus: 'F' }]
    const tickets = [
      {
        id: 't1',
        title: 'Задача',
        brief: 'Описание',
        agentId: 'a1',
        status: 'in_progress' as const,
      },
    ]
    const envelope = buildOrchestraExport({
      agents,
      tickets,
      conductorNotes: 'заметка',
    })
    const r = parseOrchestraImport(JSON.stringify(envelope))
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.agents).toEqual(agents)
    expect(r.tickets).toEqual(tickets)
    expect(r.conductorNotes).toBe('заметка')
  })
})
