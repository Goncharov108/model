import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AccountProfile } from '../domain/appUser'
import { useUsersDatabaseStore } from './usersDatabaseStore'

const DEFAULT_PROFILE: AccountProfile = {
  id: 'account-local-owner',
  displayName: 'Владелец',
  phone: '',
  photoDataUrl: null,
  role: 'owner',
}

function syncAccountToUsers(profile: AccountProfile) {
  useUsersDatabaseStore.getState().upsertFromAccount(profile)
}

interface AccountState {
  profile: AccountProfile
  patchProfile: (patch: Partial<Omit<AccountProfile, 'id'>>) => void
  setPhoto: (photoDataUrl: string | null) => void
  registerAsDeveloper: () => void
}

export const useAccountStore = create<AccountState>()(
  persist(
    (set, get) => ({
      profile: DEFAULT_PROFILE,
      patchProfile: (patch) => {
        const profile = { ...get().profile, ...patch }
        set({ profile })
        syncAccountToUsers(profile)
      },
      setPhoto: (photoDataUrl) => {
        const profile = { ...get().profile, photoDataUrl }
        set({ profile })
        syncAccountToUsers(profile)
      },
      registerAsDeveloper: () => {
        const profile = { ...get().profile, role: 'developer' as const }
        set({ profile })
        syncAccountToUsers(profile)
      },
    }),
    {
      name: 'model-account-v1',
      partialize: (state) => ({ profile: state.profile }),
      onRehydrateStorage: () => (state) => {
        if (state?.profile) syncAccountToUsers(state.profile)
      },
    },
  ),
)
