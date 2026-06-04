/** Роли пользователя в системе model. */
export type AppUserRole = 'owner' | 'developer' | 'viewer' | 'guest'

/** Запись пользователя (сервер / админ-панель). */
export interface AppUser {
  id: string
  email: string
  displayName: string
  phone: string
  /** Основная роль для отображения (на сервере может быть несколько roles). */
  role: AppUserRole
  roles: AppUserRole[]
  photoDataUrl: string | null
  createdAtIso: string
  updatedAtIso: string
  isCurrentAccount?: boolean
}

/** Профиль текущего аккаунта (настройки в боковом меню). */
export interface AccountProfile {
  id: string
  email: string
  displayName: string
  phone: string
  photoDataUrl: string | null
  role: AppUserRole
  roles: AppUserRole[]
  authProvider: 'google' | 'local' | 'none'
}
