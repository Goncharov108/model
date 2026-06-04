import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PhotoDropZone } from '../components/account/PhotoDropZone'
import { ProfileAvatar } from '../components/account/ProfileAvatar'
import { GoogleSignInPanel } from '../components/auth/GoogleSignInPanel'
import { ApiError, patchMe } from '../lib/apiClient'
import { canAccessAdmin } from '../lib/authAccess'
import { PATH } from '../lib/appPaths'
import { appUserRoleLabel } from '../lib/appUserLabels'
import { useAccountStore } from '../store/accountStore'
import { useAuthStore } from '../store/authStore'
import { AppButton } from '../ui/AppButton'
import { PageHeader } from '../ui/PageHeader'
import { SurfaceCard } from '../ui/SurfaceCard'

const inputClass =
  'w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-3 py-2.5 text-sm text-zinc-100 focus:border-violet-500/60 focus:outline-none focus:ring-2 focus:ring-violet-500/30'

/** Настройки аккаунта: Google, профиль на сервере, выход. */
export function AccountSettingsWorkspace() {
  const profile = useAccountStore((s) => s.profile)
  const patchProfile = useAccountStore((s) => s.patchProfile)
  const setPhoto = useAccountStore((s) => s.setPhoto)
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const signOut = useAuthStore((s) => s.signOut)
  const refreshMe = useAuthStore((s) => s.refreshMe)

  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  if (!user || !token) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-8 px-6 py-10">
        <PageHeader
          eyebrow="Аккаунт"
          title="Вход"
          description="Войдите через Google, чтобы настроить профиль и открыть рабочее место."
        />
        <GoogleSignInPanel />
      </div>
    )
  }

  async function saveProfile() {
    if (!token) return
    setSaving(true)
    setSaveError(null)
    try {
      await patchMe(token, {
        displayName: profile.displayName,
        phone: profile.phone,
      })
      await refreshMe()
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Не удалось сохранить')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-10 lg:px-10">
      <PageHeader
        eyebrow="Аккаунт"
        title="Настройки аккаунта"
        description="Вход через Google. Имя и телефон сохраняются на сервере; фото пока только в этом браузере."
      />

      <SurfaceCard title="Профиль">
        <div className="mt-4 flex items-center gap-4">
          <ProfileAvatar profile={profile} size="lg" />
          <div>
            <p className="text-sm font-medium text-zinc-200">{profile.displayName}</p>
            <p className="text-xs text-zinc-500">{profile.email}</p>
            <p className="mt-1 text-xs text-zinc-500">
              {profile.roles.map(appUserRoleLabel).join(' · ')}
            </p>
          </div>
        </div>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            void saveProfile()
          }}
        >
          <label className="flex flex-col gap-1.5 text-xs text-zinc-500">
            Имя
            <input
              className={inputClass}
              value={profile.displayName}
              onChange={(e) => patchProfile({ displayName: e.target.value })}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs text-zinc-500">
            Телефон
            <input
              className={inputClass}
              type="tel"
              value={profile.phone}
              onChange={(e) => patchProfile({ phone: e.target.value })}
            />
          </label>

          <div>
            <p className="mb-2 text-xs text-zinc-500">Фото (локально в браузере)</p>
            <PhotoDropZone photoDataUrl={profile.photoDataUrl} onPhotoChange={setPhoto} />
          </div>

          {saveError ? <p className="text-sm text-rose-300">{saveError}</p> : null}

          <AppButton type="submit" disabled={saving}>
            {saving ? 'Сохранение…' : 'Сохранить на сервере'}
          </AppButton>
        </form>
      </SurfaceCard>

      <SurfaceCard title="Google">
        <p className="mt-3 text-sm text-zinc-400">
          Вы вошли как <span className="text-zinc-200">{user.email}</span>. Сменить аккаунт — выйти и
          войти снова.
        </p>
        <div className="mt-4">
          <AppButton type="button" variant="ghost" onClick={() => signOut()}>
            Выйти
          </AppButton>
        </div>
      </SurfaceCard>

      {canAccessAdmin(user) ? (
        <p className="text-xs text-zinc-600">
          Список всех пользователей — в{' '}
          <Link to={PATH.adminUsers} className="text-violet-300 hover:underline">
            Админ-панель → Пользователи
          </Link>
          .
        </p>
      ) : null}
    </div>
  )
}
