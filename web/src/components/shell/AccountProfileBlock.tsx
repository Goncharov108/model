import { NavLink } from 'react-router-dom'
import { PATH } from '../../lib/appPaths'
import { appUserRoleLabel } from '../../lib/appUserLabels'
import { useAccountStore } from '../../store/accountStore'
import { useAuthStore } from '../../store/authStore'
import { ProfileAvatar } from '../account/ProfileAvatar'

/** Блок профиля внизу меню: вход или настройки аккаунта. */
export function AccountProfileBlock() {
  const profile = useAccountStore((s) => s.profile)
  const user = useAuthStore((s) => s.user)
  const signedIn = Boolean(user)

  const title = signedIn
    ? profile.displayName || user?.email || 'Аккаунт'
    : 'Войти'
  const subtitle = signedIn
    ? profile.email || appUserRoleLabel(profile.role)
    : 'Через Google'

  return (
    <NavLink
      to={PATH.account}
      aria-label={signedIn ? 'Настройки аккаунта' : 'Войти через Google'}
      className={({ isActive }) =>
        [
          'flex items-center gap-3 rounded-xl border px-3 py-2.5 transition',
          isActive
            ? 'border-violet-500/40 bg-violet-500/10 ring-1 ring-violet-500/30'
            : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-800/60',
        ].join(' ')
      }
    >
      <ProfileAvatar profile={profile} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zinc-100">{title}</p>
        <p className="truncate text-xs text-zinc-500">{subtitle}</p>
      </div>
      <span className="text-xs text-zinc-600" aria-hidden>
        ›
      </span>
    </NavLink>
  )
}
