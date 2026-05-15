import { NavLink } from 'react-router-dom'
import { PATH } from '../../lib/appPaths'
import { useAccountStore } from '../../store/accountStore'
import { appUserRoleLabel } from '../../lib/appUserLabels'
import { ProfileAvatar } from '../account/ProfileAvatar'
/** Блок профиля: переход в настройки аккаунта. */
export function AccountProfileBlock() {
  const profile = useAccountStore((s) => s.profile)

  return (
    <NavLink
      to={PATH.account}
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
        <p className="truncate text-sm font-medium text-zinc-100">{profile.displayName}</p>
        <p className="truncate text-xs text-zinc-500">{appUserRoleLabel(profile.role)}</p>
      </div>
      <span className="text-xs text-zinc-600" aria-hidden>
        ›
      </span>
    </NavLink>
  )
}
