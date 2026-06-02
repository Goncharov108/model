import { describe, expect, it } from 'vitest'
import {
  buildFamilyPlanningBoard,
  buildFamilyPlanningSummary,
  createFamilyPlanningSeedSnapshot,
  cycleGoalStatus,
  cycleTaskStatus,
} from './familyPlanning'

describe('familyPlanning', () => {
  it('строит summary и доску по горизонтам', () => {
    const snapshot = createFamilyPlanningSeedSnapshot()

    const summary = buildFamilyPlanningSummary(snapshot)
    const board = buildFamilyPlanningBoard(snapshot)

    expect(summary.find((item) => item.id === 'family-members')?.value).toBe('3')
    expect(summary.find((item) => item.id === 'family-goals')?.value).toBe('2')
    expect(board).toHaveLength(4)
    expect(board.find((item) => item.horizon === 'week')?.tasks.length).toBeGreaterThan(0)
  })

  it('циклически меняет статусы целей и задач', () => {
    expect(cycleTaskStatus('todo')).toBe('in_progress')
    expect(cycleTaskStatus('in_progress')).toBe('done')
    expect(cycleTaskStatus('done')).toBe('todo')

    expect(cycleGoalStatus('draft')).toBe('active')
    expect(cycleGoalStatus('active')).toBe('done')
    expect(cycleGoalStatus('done')).toBe('draft')
  })
})
