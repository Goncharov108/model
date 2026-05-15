/** Роли пользователя в локальной базе (прототип без сервера). */
export type AppUserRole = 'owner' | 'developer' | 'viewer' | 'guest'

/** Запись пользователя в базе Мастер-админ → Пользователи. */
export interface AppUser {
  id: string
  displayName: string
  phone: string
  role: AppUserRole
  photoDataUrl: string | null
  createdAtIso: string
  updatedAtIso: string
  /** Связь с текущим локальным аккаунтом в этом браузере. */
  isCurrentAccount?: boolean
}

/** Профиль текущего аккаунта (настройки в боковом меню). */
export interface AccountProfile {
  id: string
  displayName: string
  phone: string
  photoDataUrl: string | null
  role: AppUserRole
}
