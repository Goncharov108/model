import { useMemo, useState } from 'react'
import type { AppUser, AppUserRole } from '../domain/appUser'
import { ProfileAvatar } from '../components/account/ProfileAvatar'
import { APP_USER_ROLES, appUserRoleLabel } from '../lib/appUserLabels'
import { countUsersByRole, filterAndSortUsers } from '../lib/usersDatabaseFilter'
import { useAccountStore } from '../store/accountStore'
import { useUsersDatabaseStore } from '../store/usersDatabaseStore'
import { AppButton } from '../ui/AppButton'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { PageHeader } from '../ui/PageHeader'
import { SurfaceCard } from '../ui/SurfaceCard'

const inputClass =
  'w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-100 focus:border-violet-500/60 focus:outline-none focus:ring-2 focus:ring-violet-500/30'

type SortKey = 'name' | 'role' | 'updated'

/** Форма создания / правки пользователя в базе. */
function UserEditorForm(props: {
  initial: { displayName: string; phone: string; role: AppUserRole }
  submitLabel: string
  onSubmit: (values: { displayName: string; phone: string; role: AppUserRole }) => void
  onCancel: () => void
}) {
  const { initial, submitLabel, onSubmit, onCancel } = props
  const [displayName, setDisplayName] = useState(initial.displayName)
  const [phone, setPhone] = useState(initial.phone)
  const [role, setRole] = useState(initial.role)

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit({ displayName, phone, role })
      }}
    >
      <label className="flex flex-col gap-1 text-xs text-zinc-500">
        Имя
        <input className={inputClass} value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-xs text-zinc-500">
        Телефон
        <input className={inputClass} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-xs text-zinc-500">
        Роль
        <select
          className={inputClass}
          value={role}
          onChange={(e) => setRole(e.target.value as AppUserRole)}
        >
          {APP_USER_ROLES.map((r) => (
            <option key={r} value={r}>
              {appUserRoleLabel(r)}
            </option>
          ))}
        </select>
      </label>
      <div className="flex flex-wrap gap-2">
        <AppButton type="submit">{submitLabel}</AppButton>
        <AppButton type="button" variant="ghost" onClick={onCancel}>
          Отмена
        </AppButton>
      </div>
    </form>
  )
}

/** База пользователей Мастер-админ: поиск, фильтры, CRUD. */
export function MasterAdminUsersWorkspace() {
  const users = useUsersDatabaseStore((s) => s.users)
  const addUser = useUsersDatabaseStore((s) => s.addUser)
  const updateUser = useUsersDatabaseStore((s) => s.updateUser)
  const removeUser = useUsersDatabaseStore((s) => s.removeUser)
  const accountId = useAccountStore((s) => s.profile.id)

  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<AppUserRole | 'all'>('all')
  const [sortKey, setSortKey] = useState<SortKey>('updated')
  const [editorMode, setEditorMode] = useState<'none' | 'create' | 'edit'>('none')
  const [editingUser, setEditingUser] = useState<AppUser | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AppUser | null>(null)

  const filtered = useMemo(
    () => filterAndSortUsers(users, query, roleFilter, sortKey),
    [users, query, roleFilter, sortKey],
  )

  const roleCounts = useMemo(() => countUsersByRole(users), [users])

  function openCreate() {
    setEditingUser(null)
    setEditorMode('create')
  }

  function openEdit(user: AppUser) {
    setEditingUser(user)
    setEditorMode('edit')
  }

  function closeEditor() {
    setEditorMode('none')
    setEditingUser(null)
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-10 lg:px-10">
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Удалить пользователя?"
        description={
          deleteTarget?.isCurrentAccount
            ? 'Это текущий аккаунт в браузере. Запись в базе удалится; настройки аккаунта останутся.'
            : `Запись «${deleteTarget?.displayName}» будет удалена из model-users-v1.`
        }
        confirmLabel="Удалить"
        confirmVariant="danger"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) removeUser(deleteTarget.id)
          setDeleteTarget(null)
        }}
      />

      <PageHeader
        eyebrow="Мастер-админ"
        title="Пользователи"
        description="Локальная база всех пользователей (model-users-v1): поиск, роли, правка. Без облачного сервера — только этот браузер."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatChip label="Всего" value={users.length} />
        {APP_USER_ROLES.map((role) => (
          <StatChip key={role} label={appUserRoleLabel(role)} value={roleCounts[role]} />
        ))}
      </div>

      <SurfaceCard title="Поиск и фильтры">
        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-end">
          <label className="min-w-0 flex-1 flex flex-col gap-1 text-xs text-zinc-500">
            Поиск
            <input
              className={inputClass}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Имя, телефон, id, роль…"
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
          <AppButton type="button" onClick={openCreate}>
            Добавить пользователя
          </AppButton>
        </div>
        <p className="mt-2 text-xs text-zinc-600">Найдено: {filtered.length} из {users.length}</p>
      </SurfaceCard>

      {editorMode !== 'none' ? (
        <SurfaceCard title={editorMode === 'create' ? 'Новый пользователь' : 'Редактирование'}>
          <div className="mt-4 max-w-md">
            <UserEditorForm
              key={editingUser?.id ?? 'new'}
              initial={{
                displayName: editingUser?.displayName ?? '',
                phone: editingUser?.phone ?? '',
                role: editingUser?.role ?? 'guest',
              }}
              submitLabel={editorMode === 'create' ? 'Создать' : 'Сохранить'}
              onCancel={closeEditor}
              onSubmit={(values) => {
                if (!values.displayName.trim()) return
                if (editorMode === 'create') {
                  addUser(values)
                } else if (editingUser) {
                  updateUser(editingUser.id, values)
                  if (editingUser.id === accountId) {
                    useAccountStore.getState().patchProfile({
                      displayName: values.displayName,
                      phone: values.phone,
                      role: values.role,
                    })
                  }
                }
                closeEditor()
              }}
            />
          </div>
        </SurfaceCard>
      ) : null}

      <SurfaceCard title="База пользователей" description="Клик по строке — редактирование.">
        {filtered.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">Нет записей по текущему фильтру.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-zinc-950/80 text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-3 py-2.5 font-medium">Пользователь</th>
                  <th className="px-3 py-2.5 font-medium">Телефон</th>
                  <th className="px-3 py-2.5 font-medium">Роль</th>
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
                              <span className="ml-2 text-[10px] font-normal text-violet-300">
                                этот браузер
                              </span>
                            ) : null}
                          </p>
                          <code className="text-[10px] text-zinc-600">{user.id}</code>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-zinc-400">{user.phone || '—'}</td>
                    <td className="px-3 py-3">
                      <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
                        {appUserRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-zinc-500">
                      {new Date(user.updatedAtIso).toLocaleString('ru-RU')}
                    </td>
                    <td className="px-3 py-3 text-right">
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
