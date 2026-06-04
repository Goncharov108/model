import { useEffect, type ReactNode } from 'react'
import { useAuthHydrated } from '../../hooks/useAuthHydrated'
import { hasGoogleAuthCodeInUrl } from './GoogleSignInPanel'
import { useAuthStore } from '../../store/authStore'

/** После hydration — проверка сессии (не во время ?code= от Google). */
export function AuthBootstrap(props: { children: ReactNode }) {
  const { children } = props
  const hydrated = useAuthHydrated()
  const status = useAuthStore((s) => s.status)
  const bootstrap = useAuthStore((s) => s.bootstrap)

  useEffect(() => {
    if (!hydrated) return
    if (hasGoogleAuthCodeInUrl()) return
    if (status === 'idle') void bootstrap()
  }, [hydrated, status, bootstrap])

  if (!hydrated) {
    return (
      <div className="mx-auto flex max-w-lg flex-1 flex-col justify-center px-6 py-16">
        <p className="text-center text-sm text-zinc-500">Загрузка…</p>
      </div>
    )
  }

  return <>{children}</>
}
