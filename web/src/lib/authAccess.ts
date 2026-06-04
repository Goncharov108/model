import type { AppUserRole } from '../domain/appUser'
import type { PublicUser } from '../domain/auth'

/** Есть ли у пользователя одна из ролей. */
export function hasAnyRole(user: Pick<PublicUser, 'roles'>, roles: AppUserRole[]): boolean {
  return roles.some((r) => user.roles.includes(r))
}

/** Доступ в админ-панель и управление пользователями. */
export function canAccessAdmin(user: Pick<PublicUser, 'roles'> | null): boolean {
  return user ? hasAnyRole(user, ['owner', 'developer']) : false
}

/** CRUD пользователей — только владелец. */
export function canManageUsers(user: Pick<PublicUser, 'roles'> | null): boolean {
  return user ? user.roles.includes('owner') : false
}
