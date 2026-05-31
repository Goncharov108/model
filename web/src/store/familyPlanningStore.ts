import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FamilyPlanningHorizon, FamilyPlanningSnapshot } from '../domain/familyPlanning'
import {
  createFamilyPlanningSeedSnapshot,
  cycleGoalStatus,
  cycleTaskStatus,
} from '../lib/familyPlanning'

interface FamilyPlanningStoreState {
  snapshot: FamilyPlanningSnapshot
  focusHorizon: FamilyPlanningHorizon
  setFocusHorizon: (horizon: FamilyPlanningHorizon) => void
  toggleTaskStatus: (taskId: string) => void
  toggleGoalStatus: (goalId: string) => void
  resetSeed: () => void
}

const DEFAULT_SNAPSHOT = createFamilyPlanningSeedSnapshot()

export const useFamilyPlanningStore = create<FamilyPlanningStoreState>()(
  persist(
    (set) => ({
      snapshot: DEFAULT_SNAPSHOT,
      focusHorizon: 'week',
      setFocusHorizon: (focusHorizon) => set({ focusHorizon }),
      toggleTaskStatus: (taskId) =>
        set((state) => ({
          snapshot: {
            ...state.snapshot,
            updatedAtIso: new Date().toISOString(),
            tasks: state.snapshot.tasks.map((task) =>
              task.id === taskId ? { ...task, status: cycleTaskStatus(task.status) } : task,
            ),
          },
        })),
      toggleGoalStatus: (goalId) =>
        set((state) => ({
          snapshot: {
            ...state.snapshot,
            updatedAtIso: new Date().toISOString(),
            goals: state.snapshot.goals.map((goal) =>
              goal.id === goalId ? { ...goal, status: cycleGoalStatus(goal.status) } : goal,
            ),
          },
        })),
      resetSeed: () => set({ snapshot: createFamilyPlanningSeedSnapshot(), focusHorizon: 'week' }),
    }),
    {
      name: 'model-family-calendar-v1',
      partialize: (state) => ({ snapshot: state.snapshot, focusHorizon: state.focusHorizon }),
    },
  ),
)
