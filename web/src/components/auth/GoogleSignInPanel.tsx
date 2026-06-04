import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError, loginWithGoogleCode } from '../../lib/apiClient'
import { PATH } from '../../lib/appPaths'
import { useAuthHydrated } from '../../hooks/useAuthHydrated'
import { useAuthStore } from '../../store/authStore'
import { AppButton } from '../../ui/AppButton'
import { SurfaceCard } from '../../ui/SurfaceCard'

const AUTH_RETURN_KEY = 'model-auth-return-path'
const viteClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim() || ''

/** Redirect URI для OAuth code (должен совпадать с Google Console). */
export function googleRedirectUri() {
  return window.location.origin
}

/** Есть ли в URL код возврата от Google. */
export function hasGoogleAuthCodeInUrl() {
  return new URLSearchParams(window.location.search).has('code')
}

/** Куда вернуть пользователя после успешного входа. */
function consumeReturnPath(): string {
  const raw = sessionStorage.getItem(AUTH_RETURN_KEY)
  sessionStorage.removeItem(AUTH_RETURN_KEY)
  if (raw && raw.startsWith('/') && !raw.startsWith('//')) {
    return raw
  }
  return PATH.home
}

function rememberReturnPath() {
  const path = `${window.location.pathname}${window.location.search}`
  if (!path.includes('code=')) {
    sessionStorage.setItem(AUTH_RETURN_KEY, path)
  }
}

/** Кнопка: полный redirect на Google (без popup gsi/select). */
function GoogleRedirectSignInButton() {
  const setError = (msg: string | null) => useAuthStore.setState({ error: msg, status: 'ready' })

  const login = useGoogleLogin({
    flow: 'auth-code',
    redirect_uri: googleRedirectUri(),
    onSuccess: () => {},
    onError: () => setError('Google отклонил вход или окно закрыто.'),
  })

  return (
    <AppButton
      type="button"
      onClick={() => {
        rememberReturnPath()
        login()
      }}
    >
      Войти через Google
    </AppButton>
  )
}

/** После возврата с accounts.google.com: ?code=… в URL. */
export function GoogleOAuthReturnHandler() {
  const hydrated = useAuthHydrated()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const applySession = useAuthStore((s) => s.applySession)
  const code = searchParams.get('code')
  const handledRef = useRef(false)

  useEffect(() => {
    if (!hydrated || !code || handledRef.current) return
    handledRef.current = true

    useAuthStore.setState({ status: 'loading', error: null })

    void loginWithGoogleCode(code, googleRedirectUri())
      .then(({ token, user }) => {
        applySession(token, user)
        const target = consumeReturnPath()
        const next = new URLSearchParams(searchParams)
        for (const key of ['code', 'scope', 'authuser', 'prompt', 'hd']) {
          next.delete(key)
        }
        setSearchParams(next, { replace: true })
        navigate({ pathname: target, search: '' }, { replace: true })
      })
      .catch((err) => {
        handledRef.current = false
        const message = err instanceof ApiError ? err.message : 'Ошибка входа через Google'
        useAuthStore.setState({ status: 'ready', error: message })
      })
  }, [hydrated, code, applySession, navigate, searchParams, setSearchParams])

  if (!code) return null

  return (
    <p className="text-center text-sm text-zinc-500" role="status">
      Завершаем вход через Google…
    </p>
  )
}

/** Вход через Google + опциональный dev-вход. */
export function GoogleSignInPanel() {
  const config = useAuthStore((s) => s.config)
  const error = useAuthStore((s) => s.error)
  const signInDev = useAuthStore((s) => s.signInDev)
  const [devEmail, setDevEmail] = useState('')

  const clientId = viteClientId || config?.googleClientId || ''
  const codeAuth = Boolean(config?.codeAuthEnabled)
  const showDev = Boolean(config?.devBypass) && import.meta.env.DEV

  if (!clientId && !showDev) {
    return (
      <SurfaceCard title="Вход">
        <p className="mt-3 text-sm text-amber-200/90">
          Google OAuth не настроен. Задайте Client ID и на сервере GOOGLE_CLIENT_SECRET.
        </p>
      </SurfaceCard>
    )
  }

  const inner = (
    <div className="space-y-4">
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      {clientId && codeAuth ? <GoogleRedirectSignInButton /> : null}
      {clientId && !codeAuth ? (
        <p className="text-sm text-amber-200/90">
          На сервере не задан <code className="text-xs">GOOGLE_CLIENT_SECRET</code> — добавьте в
          /opt/model/api/.env и перезапустите model-api.
        </p>
      ) : null}
      {showDev ? (
        <form
          className="flex flex-col gap-2 border-t border-zinc-800 pt-4"
          onSubmit={(e) => {
            e.preventDefault()
            void signInDev(devEmail.trim())
          }}
        >
          <p className="text-xs text-zinc-500">Dev-вход (только localhost)</p>
          <input
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            type="email"
            value={devEmail}
            onChange={(e) => setDevEmail(e.target.value)}
            placeholder="goncharov.msk@gmail.com"
          />
          <AppButton type="submit">Войти (dev)</AppButton>
        </form>
      ) : null}
      <p className="text-xs text-zinc-600">
        Вход в том же окне. Redirect URI в Google Console:{' '}
        <code className="text-zinc-400">{googleRedirectUri()}</code>
      </p>
    </div>
  )

  if (!clientId) {
    return (
      <SurfaceCard title="Вход в model">
        <div className="mt-4">{inner}</div>
      </SurfaceCard>
    )
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <SurfaceCard title="Вход в model">
        <div className="mt-4">{inner}</div>
      </SurfaceCard>
    </GoogleOAuthProvider>
  )
}
