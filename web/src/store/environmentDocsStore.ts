import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createDefaultEnvironmentDocs } from '../data/environmentDocsDefaults'
import type { EnvironmentDocsData, EnvironmentStackRow } from '../domain/environmentDocs'
import { newId } from '../lib/newId'

interface EnvironmentDocsState {
  docs: EnvironmentDocsData
  patchGithub: (patch: Partial<EnvironmentDocsData['github']>) => void
  patchDomain: (patch: Partial<EnvironmentDocsData['domain']>) => void
  patchServer: (patch: Partial<EnvironmentDocsData['server']>) => void
  patchSecrets: (patch: Partial<EnvironmentDocsData['secrets']>) => void
  setPlannedCanonRef: (text: string) => void
  updateStackRow: (id: string, patch: Partial<Omit<EnvironmentStackRow, 'id'>>) => void
  addStackRow: (tier: EnvironmentStackRow['tier']) => void
  removeStackRow: (id: string) => void
  replaceAll: (docs: EnvironmentDocsData) => void
  resetToDefaults: () => void
}

export const useEnvironmentDocsStore = create<EnvironmentDocsState>()(
  persist(
    (set) => ({
      docs: createDefaultEnvironmentDocs(),
      patchGithub: (patch) =>
        set((s) => ({ docs: { ...s.docs, github: { ...s.docs.github, ...patch } } })),
      patchDomain: (patch) =>
        set((s) => ({ docs: { ...s.docs, domain: { ...s.docs.domain, ...patch } } })),
      patchServer: (patch) =>
        set((s) => ({ docs: { ...s.docs, server: { ...s.docs.server, ...patch } } })),
      patchSecrets: (patch) =>
        set((s) => ({ docs: { ...s.docs, secrets: { ...s.docs.secrets, ...patch } } })),
      setPlannedCanonRef: (text) =>
        set((s) => ({
          docs: { ...s.docs, stack: { ...s.docs.stack, plannedCanonRef: text } },
        })),
      updateStackRow: (id, patch) =>
        set((s) => ({
          docs: {
            ...s.docs,
            stack: {
              ...s.docs.stack,
              rows: s.docs.stack.rows.map((r) => (r.id === id ? { ...r, ...patch } : r)),
            },
          },
        })),
      addStackRow: (tier) =>
        set((s) => ({
          docs: {
            ...s.docs,
            stack: {
              ...s.docs.stack,
              rows: [
                ...s.docs.stack.rows,
                {
                  id: newId(),
                  tier,
                  layer: '',
                  technology: '',
                  version: '',
                  location: '',
                  note: '',
                },
              ],
            },
          },
        })),
      removeStackRow: (id) =>
        set((s) => ({
          docs: {
            ...s.docs,
            stack: {
              ...s.docs.stack,
              rows: s.docs.stack.rows.filter((r) => r.id !== id),
            },
          },
        })),
      replaceAll: (docs) => set({ docs }),
      resetToDefaults: () => set({ docs: createDefaultEnvironmentDocs() }),
    }),
    {
      name: 'model-environment-docs-v1',
      partialize: (state) => ({ docs: state.docs }),
    },
  ),
)
