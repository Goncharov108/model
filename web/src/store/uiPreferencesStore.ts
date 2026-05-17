import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UiPreferencesState {
  streamOnboardingDismissed: boolean
  dismissStreamOnboarding: () => void
  resetStreamOnboarding: () => void
}

/** Локальные UI-настройки (онбординг, подсказки). */
export const useUiPreferencesStore = create<UiPreferencesState>()(
  persist(
    (set) => ({
      streamOnboardingDismissed: false,
      dismissStreamOnboarding: () => set({ streamOnboardingDismissed: true }),
      resetStreamOnboarding: () => set({ streamOnboardingDismissed: false }),
    }),
    {
      name: 'model-ui-prefs-v1',
      partialize: (state) => ({ streamOnboardingDismissed: state.streamOnboardingDismissed }),
    },
  ),
)
