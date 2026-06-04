import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { AppUser, AppUserRole } from '../domain/appUser'
import { ProfileAvatar } from '../components/account/ProfileAvatar'
import { ApiError } from '../lib/apiClient'
import { canAccessAdmin, canManageUsers } from '../lib/authAccess'
import { APP_USER_ROLES, appUserRoleLabel } from '../lib/appUserLabels'
import { publicUserToAppUser } from '../lib/publicUserToAppUser'
import { countUsersByRole, filterAndSortUsers } from '../lib/usersDatabaseFilter'
import { deleteAdminUser, fetchAdminUsers, updateAdminUser } from '../lib/apiClient'
import { useAuthStore } from '../store/authStore'
import { useAccountStore } from '../store/accountStore'
import { AppButton } from '../ui/AppButton'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { PageHeader } from '../ui/PageHeader'
import { SurfaceCard } from '../ui/SurfaceCard'
import { PATH } from '../lib/appPaths'

const inputClass =
  'w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-100 focus:border-violet-500/60 focus:outline-none focus:ring-2 focus:ring-violet-500/30'

type SortKey = 'name' | 'role' | 'updated'

/** Форма правки пользователя (роли — только владелец). */
function UserEditorForm(props: {
  initial: { displayName: string; email: string; phone: string; roles: AppUserRole[] }
  submitLabel: string
  canEditRoles: boolean
  onSubmit: (values: { displayName: string; phone: string; roles: AppUserRole[] }) => void
  onCancel: () => void
}) {
  const { initial, submitLabel, canEditRoles, onSubmit, onCancel } = props
  const [displayName, setDisplayName] = useState(initial.displayName)
  const [phone, setPhone] = useState(initial.phone)
  const [roles, setRoles] = useState<AppUserRole[]>(initial.roles)

  function toggleRole(role: AppUserRole) {
    setRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    )
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit({ displayName, phone, roles })
      }}
    >
      <p className="text-xs text-zinc-500">
        E-mail: <span className="text-zinc-300">{initial.email}</span> (меняется только через Google)
      </p>
      <label className="flex flex-col gap-1 text-xs text-zinc-500">
        Имя
        <input className={inputClass} value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-xs text-zinc-500">
        Телефон
        <input className={inputClass} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </label>
      {canEditRoles ? (
        <fieldset className="space-y-2">
          <legend className="text-xs text-zinc-500">Роли</legend>
          <div className="flex flex-wrap gap-2">
            {APP_USER_ROLES.map((role) => (
              <label key={role} className="flex items-center gap-1.5 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={roles.includes(role)}
                  onChange={() => toggleRole(role)}
                />
                {appUserRoleLabel(role)}
              </label>
            ))}
          </div>
        </fieldset>
      ) : (
        <p className="text-xs text-zinc-500">
          Роли: {roles.map(appUserRoleLabel).join(', ')}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <AppButton type="submit">{submitLabel}</AppButton>
        <AppButton type="button" variant="ghost" onClick={onCancel}>
          Отмена
        </AppButton>
      </div>
    </form>
  )
}

/** Список пользователей (сервер) — админ-панель. */
export function AdminUsersWorkspace() {
  const token = useAuthStore((s) => s.token)
  const authUser = useAuthStore((s) => s.user)
  const accountId = useAccountStore((s) => s.profile.id)
  const manageUsers = canManageUsers(authUser)
  const allowed = canAccessAdmin(authUser)

  const [users, setUsers] = useState<AppUser[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<AppUserRole | 'all'>('all')
  const [sortKey, setSortKey] = useState<SortKey>('updated')
  const [editorMode, setEditorMode] = useState<'none' | 'edit'>('none')
  const [editingUser, setEditingUser] = useState<AppUser | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AppUser | null>(null)

  const reload = useCallback(async () => {
    if (!token) return
    setLoadError(null)
    try {
      const { users: rows } = await fetchAdminUsers(token)
      setUsers(rows.map((u) => publicUserToAppUser(u, accountId)))
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Не удалось загрузить пользователей')
    }
  }, [token, accountId])

  useEffect(() => {
    void reload()
  }, [reload])

  const filtered = useMemo(
    () => filterAndSortUsers(users, query, roleFilter, sortKey),
    [users, query, roleFilter, sortKey],
  )

  const roleCounts = useMemo(() => countUsersByRole(users), [users])

  function openEdit(user: AppUser) {
    setEditingUser(user)
    setEditorMode('edit')
  }

  function closeEditor() {
    setEditorMode('none')
    setEditingUser(null)
  }

  if (!allowed) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16">
        <p className="text-sm text-zinc-400">Раздел доступен владельцу и разработчику.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-10 lg:px-10">
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Удалить пользователя?"
        description={`Запись «${deleteTarget?.displayName}» (${deleteTarget?.email}) будет удалена с сервера.`}
        confirmLabel="Удалить"
        confirmVariant="danger"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget || !token) return
          try {
            await deleteAdminUser(token, deleteTarget.id)
            await reload()
          } catch (err) {
            setLoadError(err instanceof ApiError ? err.message : 'Ошибка удаления')
          }
          setDeleteTarget(null)
        }}
      />

      <PageHeader
        eyebrow="Админ-панель"
        title="Пользователи"
        description="Учётные записи на сервере (Google). Новые входы только с почтой из OWNER_EMAILS; роли правит владелец."
      />

      {loadError ? <p className="text-sm text-rose-300">{loadError}</p> : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatChip label="Всего" value={users.length} />
        {APP_USER_ROLES.map((role) => (
          <StatChip key={role} label={appUserRoleLabel(role)} value={roleCounts[role]} />
        ))}
      </div>

      <SurfaceCard title="Поиск и фильтры">
        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-end">
          <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs text-zinc-500">
            Поиск
            <input
              className={inputClass}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Имя, e-mail, телефон…"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-zinc-500">
            Роль
            <select
              className={inputClass}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as AppUserRole | 'all')}
            >
              <option value="all">Все</option>
              {APP_USER_ROLES.map((r) => (
                <option key={r} value={r}>
                  {appUserRoleLabel(r)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-zinc-500">
            Сортировка
            <select
              className={inputClass}
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
            >
              <option value="updated">По обновлению</option>
              <option value="name">По имени</option>
              <option value="role">По роли</option>
            </select>
          </label>
        </div>
        <p className="mt-2 text-xs text-zinc-600">
          Найдено: {filtered.length} из {users.length}.{' '}
          <Link to={PATH.account} className="text-violet-300 hover:underline">
            Настройки аккаунта
          </Link>
        </p>
      </SurfaceCard>

      {editorMode === 'edit' && editingUser ? (
        <SurfaceCard title="Редактирование">
          <div className="mt-4 max-w-md">
            <UserEditorForm
              key={editingUser.id}
              initial={{
                displayName: editingUser.displayName,
                email: editingUser.email,
                phone: editingUser.phone,
                roles: editingUser.roles,
              }}
              submitLabel="Сохранить"
              canEditRoles={manageUsers}
              onCancel={closeEditor}
              onSubmit={async (values) => {
                if (!token || !editingUser) return
                try {
                  await updateAdminUser(token, editingUser.id, {
                    displayName: values.displayName,
                    phone: values.phone,
                    roles: values.roles,
                  })
                  await reload()
                  closeEditor()
                } catch (err) {
                  setLoadError(err instanceof ApiError ? err.message : 'Ошибка сохранения')
                }
              }}
            />
          </div>
        </SurfaceCard>
      ) : null}

      <SurfaceCard title="База пользователей" description="Клик по строке — редактирование.">
        {filtered.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">Нет записей. Войдите через Google с почтой из OWNER_EMAILS.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-zinc-950/80 text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-3 py-2.5 font-medium">Пользователь</th>
                  <th className="px-3 py-2.5 font-medium">E-mail</th>
                  <th className="px-3 py-2.5 font-medium">Роли</th>
                  <th className="px-3 py-2.5 font-medium">Обновлён</th>
                  <th className="px-3 py-2.5 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filtered.map((user) => (
                  <tr
                    key={user.id}
                    className="cursor-pointer bg-zinc-900/20 transition hover:bg-zinc-800/40"
                    onClick={() => openEdit(user)}
                  >
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <ProfileAvatar
                          profile={{ displayName: user.displayName, photoDataUrl: user.photoDataUrl }}
                          size="sm"
                        />
                        <div>
                          <p className="font-medium text-zinc-100">
                            {user.displayName}
                            {user.isCurrentAccount ? (
                              <span className="ml-2 text-[10px] font-normal text-violet-300">вы</span>
                            ) : null}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-zinc-400">{user.email}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((r) => (
                          <span
                            key={r}
                            className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300"
                          >
                            {appUserRoleLabel(r)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-zinc-500">
                      {new Date(user.updatedAtIso).toLocaleString('ru-RU')}
                    </td>
                    <td className="px-3 py-3 text-right">
                      {manageUsers && !user.roles.includes('owner') ? (
                        <AppButton
                          type="button"
                          variant="danger"
                          className="!min-h-8 !px-2 !py-1 !text-xs"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteTarget(user)
                          }}
                        >
                          Удалить
                        </AppButton>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SurfaceCard>
    </div>
  )
}

function StatChip(props: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3">
      <p className="text-xs text-zinc-500">{props.label}</p>
      <p className="mt-1 text-xl font-semibold text-zinc-50">{props.value}</p>
    </div>
  )
}
