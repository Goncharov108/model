import type { AccountProfile } from '../domain/appUser'
import type { PublicUser } from '../domain/auth'

/** Синхронизирует серверного пользователя с локальным профилем аккаунта. */
export function publicUserToAccountProfile(user: PublicUser): AccountProfile {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    phone: user.phone,
    photoDataUrl: user.photoUrl,
    role: user.primaryRole,
    roles: user.roles,
    authProvider: 'google',
  }
}
