import { Link } from 'react-router-dom'
import { PhotoDropZone } from '../components/account/PhotoDropZone'
import { ProfileAvatar } from '../components/account/ProfileAvatar'
import { PATH } from '../lib/appPaths'
import { appUserRoleLabel } from '../lib/appUserLabels'
import { useAccountStore } from '../store/accountStore'
import { AppButton } from '../ui/AppButton'
import { PageHeader } from '../ui/PageHeader'
import { SurfaceCard } from '../ui/SurfaceCard'

const inputClass =
  'w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-3 py-2.5 text-sm text-zinc-100 focus:border-violet-500/60 focus:outline-none focus:ring-2 focus:ring-violet-500/30'

/** Настройки локального аккаунта. */
export function AccountSettingsWorkspace() {
  const profile = useAccountStore((s) => s.profile)
  const patchProfile = useAccountStore((s) => s.patchProfile)
  const setPhoto = useAccountStore((s) => s.setPhoto)
  const registerAsDeveloper = useAccountStore((s) => s.registerAsDeveloper)

  const isDeveloper = profile.role === 'developer'

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-10 lg:px-10">
      <PageHeader
        eyebrow="Аккаунт"
        title="Настройки аккаунта"
        description="Данные хранятся только в этом браузере (model-account-v1) и синхронизируются с базой пользователей Мастер-админ."
      />

      <SurfaceCard title="Профиль">
        <div className="mt-4 flex items-center gap-4">
          <ProfileAvatar profile={profile} size="lg" />
          <div>
            <p className="text-sm font-medium text-zinc-200">{profile.displayName}</p>
            <p className="text-xs text-zinc-500">Роль: {appUserRoleLabel(profile.role)}</p>
          </div>
        </div>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
          }}
        >
          <label className="flex flex-col gap-1.5 text-xs text-zinc-500">
            Имя
            <input
              className={inputClass}
              value={profile.displayName}
              onChange={(e) => patchProfile({ displayName: e.target.value })}
              placeholder="Как к вам обращаться"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs text-zinc-500">
            Телефон
            <input
              className={inputClass}
              type="tel"
              value={profile.phone}
              onChange={(e) => patchProfile({ phone: e.target.value })}
              placeholder="+7 …"
            />
          </label>

          <div>
            <p className="mb-2 text-xs text-zinc-500">Фото</p>
            <PhotoDropZone photoDataUrl={profile.photoDataUrl} onPhotoChange={setPhoto} />
          </div>
        </form>
      </SurfaceCard>

      <SurfaceCard
        title="Роль"
        description="Зарегистрируйтесь как разработчик, чтобы получить соответствующую роль в локальной базе."
      >
        <p className="mt-3 text-sm text-zinc-400">
          Текущая роль: <span className="font-medium text-zinc-200">{appUserRoleLabel(profile.role)}</span>
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <AppButton
            type="button"
            disabled={isDeveloper}
            onClick={() => registerAsDeveloper()}
          >
            {isDeveloper ? 'Роль разработчика уже присвоена' : 'Зарегистрироваться как разработчик'}
          </AppButton>
        </div>
      </SurfaceCard>

      <p className="text-xs text-zinc-600">
        Управление всеми пользователями — в{' '}
        <Link to={PATH.masterAdmin.users} className="text-violet-300 hover:underline">
          Мастер-админ → Пользователи
        </Link>
        .
      </p>
    </div>
  )
}
