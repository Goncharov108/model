import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PlanAnswerValue } from '../domain/planningQuestion'

function defaultAnswer(): PlanAnswerValue {
  return { optionId: null, customText: '' }
}

function mergeAnswer(prev: PlanAnswerValue | undefined, patch: Partial<PlanAnswerValue>): PlanAnswerValue {
  return { ...defaultAnswer(), ...prev, ...patch }
}

interface PlanningAnswersState {
  answers: Record<string, PlanAnswerValue>
  setOption: (questionId: string, optionId: string | null) => void
  setCustom: (questionId: string, customText: string) => void
  /** Полная замена ответов (после импорта JSON). */
  replaceAll: (answers: Record<string, PlanAnswerValue>) => void
  /** Очистить все ответы. */
  clearAll: () => void
}

export const usePlanningAnswersStore = create<PlanningAnswersState>()(
  persist(
    (set) => ({
      answers: {},
      setOption: (questionId, optionId) =>
        set((s) => ({
          answers: {
            ...s.answers,
            [questionId]: mergeAnswer(s.answers[questionId], { optionId }),
          },
        })),
      setCustom: (questionId, customText) =>
        set((s) => ({
          answers: {
            ...s.answers,
            [questionId]: mergeAnswer(s.answers[questionId], { customText }),
          },
        })),
      replaceAll: (answers) => set({ answers: { ...answers } }),
      clearAll: () => set({ answers: {} }),
    }),
    {
      name: 'model-planning-v1',
      partialize: (state) => ({ answers: state.answers }),
    },
  ),
)
