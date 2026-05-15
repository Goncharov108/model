import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AccountProfile, AppUser, AppUserRole } from '../domain/appUser'
import { newId } from '../lib/newId'

interface UsersDatabaseState {
  users: AppUser[]
  upsertFromAccount: (profile: AccountProfile) => void
  addUser: (input: {
    displayName: string
    phone: string
    role: AppUserRole
    photoDataUrl?: string | null
  }) => AppUser
  updateUser: (id: string, patch: Partial<Omit<AppUser, 'id' | 'createdAtIso'>>) => void
  removeUser: (id: string) => void
}

function accountToUser(profile: AccountProfile, existing?: AppUser): AppUser {
  const now = new Date().toISOString()
  return {
    id: profile.id,
    displayName: profile.displayName,
    phone: profile.phone,
    role: profile.role,
    photoDataUrl: profile.photoDataUrl,
    createdAtIso: existing?.createdAtIso ?? now,
    updatedAtIso: now,
    isCurrentAccount: true,
  }
}

export const useUsersDatabaseStore = create<UsersDatabaseState>()(
  persist(
    (set) => ({
      users: [],
      upsertFromAccount: (profile) =>
        set((state) => {
          const idx = state.users.findIndex((u) => u.id === profile.id)
          const row = accountToUser(profile, idx >= 0 ? state.users[idx] : undefined)
          if (idx >= 0) {
            const users = [...state.users]
            users[idx] = row
            return { users }
          }
          return { users: [...state.users, row] }
        }),
      addUser: (input) => {
        const now = new Date().toISOString()
        const row: AppUser = {
          id: newId(),
          displayName: input.displayName.trim(),
          phone: input.phone.trim(),
          role: input.role,
          photoDataUrl: input.photoDataUrl ?? null,
          createdAtIso: now,
          updatedAtIso: now,
        }
        set((state) => ({ users: [...state.users, row] }))
        return row
      },
      updateUser: (id, patch) =>
        set((state) => ({
          users: state.users.map((u) =>
            u.id === id
              ? {
                  ...u,
                  ...patch,
                  updatedAtIso: new Date().toISOString(),
                  isCurrentAccount: patch.isCurrentAccount ?? u.isCurrentAccount,
                }
              : u,
          ),
        })),
      removeUser: (id) => set((state) => ({ users: state.users.filter((u) => u.id !== id) })),
    }),
    {
      name: 'model-users-v1',
      partialize: (state) => ({ users: state.users }),
    },
  ),
)
