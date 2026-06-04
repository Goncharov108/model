import type { AppUserRole } from './appUser'

/** Пользователь с сервера после входа через Google. */
export interface PublicUser {
  id: string
  email: string
  displayName: string
  phone: string
  photoUrl: string | null
  roles: AppUserRole[]
  primaryRole: AppUserRole
  createdAtIso: string
  updatedAtIso: string
  lastLoginAtIso: string
}

/** Публичная конфигурация авторизации с API. */
export interface AuthConfigResponse {
  googleClientId: string | null
  authEnabled: boolean
  codeAuthEnabled?: boolean
  devBypass: boolean
}
