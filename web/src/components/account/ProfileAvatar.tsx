import type { AccountProfile } from '../../domain/appUser'

/** Аватар: фото или буква из имени. */
export function ProfileAvatar(props: {
  profile: Pick<AccountProfile, 'displayName' | 'photoDataUrl'>
  size?: 'sm' | 'md' | 'lg'
}) {
  const { profile, size = 'md' } = props
  const sizeClass =
    size === 'sm' ? 'size-9 text-sm' : size === 'lg' ? 'size-20 text-2xl' : 'size-12 text-base'
  const initial = profile.displayName.trim().charAt(0).toUpperCase() || '?'

  if (profile.photoDataUrl) {
    return (
      <img
        src={profile.photoDataUrl}
        alt=""
        className={`${sizeClass} shrink-0 rounded-full object-cover ring-2 ring-zinc-700`}
      />
    )
  }

  return (
    <span
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-violet-600/30 font-semibold text-violet-100 ring-2 ring-zinc-700`}
      aria-hidden
    >
      {initial}
    </span>
  )
}
