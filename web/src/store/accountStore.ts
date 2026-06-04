import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AccountProfile } from '../domain/appUser'

const EMPTY_PROFILE: AccountProfile = {
  id: '',
  email: '',
  displayName: '',
  phone: '',
  photoDataUrl: null,
  role: 'guest',
  roles: ['guest'],
  authProvider: 'none',
}

interface AccountState {
  profile: AccountProfile
  setFromServer: (profile: AccountProfile) => void
  patchProfile: (patch: Partial<Omit<AccountProfile, 'id' | 'email' | 'roles' | 'authProvider'>>) => void
  setPhoto: (photoDataUrl: string | null) => void
  clearSession: () => void
}

export const useAccountStore = create<AccountState>()(
  persist(
    (set, get) => ({
      profile: EMPTY_PROFILE,

      setFromServer: (profile) => set({ profile }),

      patchProfile: (patch) => {
        set({ profile: { ...get().profile, ...patch } })
      },

      setPhoto: (photoDataUrl) => {
        set({ profile: { ...get().profile, photoDataUrl } })
      },

      clearSession: () => set({ profile: EMPTY_PROFILE }),
    }),
    {
      name: 'model-account-v2',
      partialize: (state) => ({ profile: state.profile }),
    },
  ),
)
