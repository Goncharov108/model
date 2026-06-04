import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthConfigResponse, PublicUser } from '../domain/auth'
import {
  ApiError,
  fetchAuthConfig,
  fetchMe,
  loginDev,
  loginWithGoogle,
} from '../lib/apiClient'
import { publicUserToAccountProfile } from '../lib/publicUserToProfile'
import { useAccountStore } from './accountStore'

interface AuthState {
  token: string | null
  user: PublicUser | null
  config: AuthConfigResponse | null
  status: 'idle' | 'loading' | 'ready' | 'error'
  error: string | null
  bootstrap: () => Promise<void>
  signInWithGoogleCredential: (credential: string) => Promise<void>
  signInDev: (email: string) => Promise<void>
  signOut: () => void
  refreshMe: () => Promise<void>
  applySession: (token: string, user: PublicUser) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      config: null,
      status: 'idle',
      error: null,

      applySession: (token, user) => {
        set({ token, user, error: null, status: 'ready' })
        useAccountStore.getState().setFromServer(publicUserToAccountProfile(user))
      },

      bootstrap: async () => {
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search)
          if (params.has('code')) {
            set({ status: 'loading', error: null })
            return
          }
        }

        set({ status: 'loading', error: null })
        try {
          const config = await fetchAuthConfig()
          set({ config })

          const token = get().token
          if (!token) {
            set({ status: 'ready', user: null })
            return
          }

          const { user } = await fetchMe(token)
          get().applySession(token, user)
        } catch (err) {
          const message = err instanceof ApiError ? err.message : 'Не удалось проверить сессию'
          if (err instanceof ApiError && err.status === 401) {
            set({ token: null, user: null, status: 'ready', error: message })
          } else {
            set({ status: 'ready', error: message })
          }
        }
      },

      signInWithGoogleCredential: async (credential) => {
        set({ status: 'loading', error: null })
        try {
          const { token, user } = await loginWithGoogle(credential)
          get().applySession(token, user)
          set({ status: 'ready' })
        } catch (err) {
          const message = err instanceof ApiError ? err.message : 'Ошибка входа через Google'
          set({ status: 'ready', error: message })
          throw err
        }
      },

      signInDev: async (email) => {
        set({ status: 'loading', error: null })
        try {
          const { token, user } = await loginDev(email)
          get().applySession(token, user)
        } catch (err) {
          const message = err instanceof ApiError ? err.message : 'Ошибка dev-входа'
          set({ status: 'ready', error: message })
          throw err
        }
      },

      signOut: () => {
        set({ token: null, user: null, error: null, status: 'ready' })
        useAccountStore.getState().clearSession()
      },

      refreshMe: async () => {
        const token = get().token
        if (!token) return
        const { user } = await fetchMe(token)
        get().applySession(token, user)
      },
    }),
    {
      name: 'model-auth-v1',
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
)
