import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CalendarEntity, CalendarEntityTypeId } from '../domain/calendarEntity'
import {
  createEntityDraft,
  defaultMetricsForType,
  entitiesOnDate,
  newCalendarEntityId,
} from '../lib/calendarEntityUtils'

interface CalendarEntitiesState {
  entities: CalendarEntity[]
  addEntity: (draft: Omit<CalendarEntity, 'id'>) => CalendarEntity
  updateEntity: (id: string, patch: Partial<Omit<CalendarEntity, 'id'>>) => void
  removeEntity: (id: string) => void
  getByDate: (dateKey: string) => CalendarEntity[]
  changeEntityType: (id: string, type: CalendarEntityTypeId) => void
}

export const useCalendarEntitiesStore = create<CalendarEntitiesState>()(
  persist(
    (set, get) => ({
      entities: [],

      addEntity: (draft) => {
        const entity: CalendarEntity = { ...draft, id: newCalendarEntityId() }
        set((s) => ({ entities: [...s.entities, entity] }))
        return entity
      },

      updateEntity: (id, patch) =>
        set((s) => ({
          entities: s.entities.map((e) => (e.id === id ? { ...e, ...patch, id: e.id } : e)),
        })),

      removeEntity: (id) => set((s) => ({ entities: s.entities.filter((e) => e.id !== id) })),

      getByDate: (dateKey) => entitiesOnDate(get().entities, dateKey),

      changeEntityType: (id, type) =>
        set((s) => ({
          entities: s.entities.map((e) =>
            e.id === id ? { ...e, type, metrics: defaultMetricsForType(type) } : e,
          ),
        })),
    }),
    {
      name: 'model-calendar-entities-v1',
      partialize: (state) => ({ entities: state.entities }),
    },
  ),
)

export { createEntityDraft }
