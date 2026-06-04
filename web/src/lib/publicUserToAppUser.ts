import type { AppUser } from '../domain/appUser'
import type { PublicUser } from '../domain/auth'

/** Преобразует запись API в строку таблицы админ-панели. */
export function publicUserToAppUser(user: PublicUser, currentId?: string): AppUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    phone: user.phone,
    role: user.primaryRole,
    roles: user.roles,
    photoDataUrl: user.photoUrl,
    createdAtIso: user.createdAtIso,
    updatedAtIso: user.updatedAtIso,
    isCurrentAccount: user.id === currentId,
  }
}
