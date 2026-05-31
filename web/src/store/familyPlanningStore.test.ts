import { beforeEach, describe, expect, it } from 'vitest'
import { useFamilyPlanningStore } from './familyPlanningStore'

describe('familyPlanningStore', () => {
  beforeEach(() => {
    useFamilyPlanningStore.getState().resetSeed()
  })

  it('переключает горизонт фокуса', () => {
    useFamilyPlanningStore.getState().setFocusHorizon('month')
    expect(useFamilyPlanningStore.getState().focusHorizon).toBe('month')
  })

  it('циклически двигает статусы задач и целей', () => {
    const store = useFamilyPlanningStore.getState()
    store.toggleTaskStatus('task-day-zhenya')
    store.toggleGoalStatus('goal-month-household')

    const task = useFamilyPlanningStore.getState().snapshot.tasks.find((item) => item.id === 'task-day-zhenya')
    const goal = useFamilyPlanningStore.getState().snapshot.goals.find((item) => item.id === 'goal-month-household')

    expect(task?.status).toBe('in_progress')
    expect(goal?.status).toBe('active')
  })
})
