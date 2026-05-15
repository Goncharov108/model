import type { AppUserRole } from '../domain/appUser'

/** Подпись роли на русском. */
export function appUserRoleLabel(role: AppUserRole): string {
  const map: Record<AppUserRole, string> = {
    owner: 'Владелец',
    developer: 'Разработчик',
    viewer: 'Наблюдатель',
    guest: 'Гость',
  }
  return map[role]
}

export const APP_USER_ROLES: AppUserRole[] = ['owner', 'developer', 'viewer', 'guest']
