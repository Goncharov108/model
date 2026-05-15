import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_ORCHESTRA_AGENTS } from '../data/orchestraDefaults'
import type { OrchestraAgent, OrchestraTicket } from '../domain/orchestra'
import { newId } from '../lib/newId'

interface OrchestraState {
  agents: OrchestraAgent[]
  tickets: OrchestraTicket[]
  conductorNotes: string
  addAgent: () => void
  updateAgent: (id: string, patch: Partial<Pick<OrchestraAgent, 'label' | 'focus'>>) => void
  removeAgent: (id: string) => void
  addTicket: () => void
  updateTicket: (
    id: string,
    patch: Partial<Pick<OrchestraTicket, 'title' | 'brief' | 'agentId' | 'status'>>,
  ) => void
  removeTicket: (id: string) => void
  setConductorNotes: (text: string) => void
  replaceAll: (payload: {
    agents: OrchestraAgent[]
    tickets: OrchestraTicket[]
    conductorNotes: string
  }) => void
  resetToDefaults: () => void
  restoreDefaultAgents: () => void
}

function defaultTicket(): OrchestraTicket {
  return {
    id: newId(),
    title: 'Новая задача',
    brief: '',
    agentId: null,
    status: 'backlog',
  }
}

export const useOrchestraStore = create<OrchestraState>()(
  persist(
    (set) => ({
      agents: DEFAULT_ORCHESTRA_AGENTS.map((a) => ({ ...a })),
      tickets: [],
      conductorNotes: '',
      addAgent: () =>
        set((s) => ({
          agents: [
            ...s.agents,
            { id: newId(), label: 'Новый агент', focus: 'Кратко, что делегировать этой роли.' },
          ],
        })),
      updateAgent: (id, patch) =>
        set((s) => ({
          agents: s.agents.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        })),
      removeAgent: (id) =>
        set((s) => ({
          agents: s.agents.filter((a) => a.id !== id),
          tickets: s.tickets.map((t) => (t.agentId === id ? { ...t, agentId: null } : t)),
        })),
      addTicket: () => set((s) => ({ tickets: [...s.tickets, defaultTicket()] })),
      updateTicket: (id, patch) =>
        set((s) => ({
          tickets: s.tickets.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      removeTicket: (id) => set((s) => ({ tickets: s.tickets.filter((t) => t.id !== id) })),
      setConductorNotes: (text) => set({ conductorNotes: text }),
      replaceAll: (payload) =>
        set({
          agents: payload.agents.map((a) => ({ ...a })),
          tickets: payload.tickets.map((t) => ({ ...t })),
          conductorNotes: payload.conductorNotes,
        }),
      resetToDefaults: () =>
        set({
          agents: DEFAULT_ORCHESTRA_AGENTS.map((a) => ({ ...a })),
          tickets: [],
          conductorNotes: '',
        }),
      restoreDefaultAgents: () =>
        set({
          agents: DEFAULT_ORCHESTRA_AGENTS.map((a) => ({ ...a })),
        }),
    }),
    {
      name: 'model-orchestra-v1',
      partialize: (state) => ({
        agents: state.agents,
        tickets: state.tickets,
        conductorNotes: state.conductorNotes,
      }),
    },
  ),
)
