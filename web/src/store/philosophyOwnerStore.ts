import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** Черновик вкладки «Философия» (резерв в браузере; канон на диске — private/PHILOSOPHY_OWNER.txt). */
interface PhilosophyOwnerState {
  bodyText: string
  setBodyText: (value: string) => void
  lastDiskSyncAt: string | null
  setLastDiskSyncAt: (iso: string | null) => void
}

export const usePhilosophyOwnerStore = create<PhilosophyOwnerState>()(
  persist(
    (set) => ({
      bodyText: '',
      setBodyText: (value) => set({ bodyText: value }),
      lastDiskSyncAt: null,
      setLastDiskSyncAt: (iso) => set({ lastDiskSyncAt: iso }),
    }),
    { name: 'model-philosophy-owner-v1' },
  ),
)
