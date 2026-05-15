import type { AppUser, AppUserRole } from '../domain/appUser'

/** Фильтр и сортировка списка пользователей (клиент). */
export function filterAndSortUsers(
  users: AppUser[],
  query: string,
  roleFilter: AppUserRole | 'all',
  sortKey: 'name' | 'role' | 'updated',
): AppUser[] {
  const q = query.trim().toLowerCase()
  let list = users.filter((user) => {
    if (roleFilter !== 'all' && user.role !== roleFilter) return false
    if (!q) return true
    return (
      user.displayName.toLowerCase().includes(q) ||
      user.phone.toLowerCase().includes(q) ||
      user.id.toLowerCase().includes(q) ||
      user.role.toLowerCase().includes(q)
    )
  })

  list = [...list].sort((a, b) => {
    if (sortKey === 'name') {
      return a.displayName.localeCompare(b.displayName, 'ru')
    }
    if (sortKey === 'role') {
      return a.role.localeCompare(b.role) || a.displayName.localeCompare(b.displayName, 'ru')
    }
    return b.updatedAtIso.localeCompare(a.updatedAtIso)
  })

  return list
}

/** Сводка по ролям для панели статистики. */
export function countUsersByRole(users: AppUser[]): Record<AppUserRole, number> {
  const counts: Record<AppUserRole, number> = {
    owner: 0,
    developer: 0,
    viewer: 0,
    guest: 0,
  }
  for (const user of users) counts[user.role] += 1
  return counts
}
