import { useEffect, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuthHydrated } from '../../hooks/useAuthHydrated'
import { useAuthStore } from '../../store/authStore'
import { GoogleOAuthReturnHandler, GoogleSignInPanel } from './GoogleSignInPanel'
import { PageHeader } from '../../ui/PageHeader'

/** Показывает детей только после входа; иначе экран Google. */
export function RequireAuth(props: { children: ReactNode }) {
  const { children } = props
  const hydrated = useAuthHydrated()
  const status = useAuthStore((s) => s.status)
  const user = useAuthStore((s) => s.user)
  const error = useAuthStore((s) => s.error)
  const bootstrap = useAuthStore((s) => s.bootstrap)
  const [searchParams] = useSearchParams()
  const oauthCode = searchParams.get('code')

  useEffect(() => {
    if (!hydrated) return
    if (status === 'idle' && !oauthCode) void bootstrap()
  }, [hydrated, status, bootstrap, oauthCode])

  if (!hydrated) {
    return (
      <div className="mx-auto flex max-w-lg flex-1 flex-col justify-center px-6 py-16">
        <p className="text-center text-sm text-zinc-500">Загрузка…</p>
      </div>
    )
  }

  if (oauthCode && !user) {
    return (
      <div className="mx-auto flex max-w-lg flex-1 flex-col justify-center gap-4 px-6 py-16">
        <GoogleOAuthReturnHandler />
        <p className="text-center text-sm text-zinc-500">Завершаем вход через Google…</p>
      </div>
    )
  }

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="mx-auto flex max-w-lg flex-1 flex-col justify-center px-6 py-16">
        <p className="text-center text-sm text-zinc-500">Загрузка…</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div id="login" className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-8 px-6 py-10">
        <PageHeader
          eyebrow="Доступ"
          title="Войдите через Google"
          description="Рабочее место model доступно после входа. Пока открыт только аккаунт владельца (ваша почта в OWNER_EMAILS на сервере)."
        />
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        <GoogleSignInPanel />
      </div>
    )
  }

  return <>{children}</>
}
