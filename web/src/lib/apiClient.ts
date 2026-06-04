import type { AuthConfigResponse, PublicUser } from '../domain/auth'

const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '') || '/api'

export class ApiError extends Error {
  status: number
  code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

/** Базовый fetch к model API с JSON и Bearer. */
export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, headers, ...rest } = options
  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers as Record<string, string> | undefined),
    },
  })

  const body = (await res.json().catch(() => ({}))) as {
    ok?: boolean
    error?: string
    message?: string
    data?: T
  }

  if (!res.ok || body.ok === false) {
    throw new ApiError(
      res.status,
      body.error || 'REQUEST_FAILED',
      body.message || `Ошибка API (${res.status})`,
    )
  }

  return body.data as T
}

export function fetchAuthConfig() {
  return apiFetch<AuthConfigResponse>('/v1/auth/config')
}

export function loginWithGoogle(credential: string) {
  return apiFetch<{ token: string; user: PublicUser }>('/v1/auth/google', {
    method: 'POST',
    body: JSON.stringify({ credential }),
  })
}

/** Вход после redirect с Google (authorization code). */
export function loginWithGoogleCode(code: string, redirectUri: string) {
  return apiFetch<{ token: string; user: PublicUser }>('/v1/auth/google/code', {
    method: 'POST',
    body: JSON.stringify({ code, redirectUri }),
  })
}

export function loginDev(email: string) {
  return apiFetch<{ token: string; user: PublicUser }>('/v1/auth/dev', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export function fetchMe(token: string) {
  return apiFetch<{ user: PublicUser }>('/v1/auth/me', { token })
}

export function patchMe(
  token: string,
  patch: { displayName?: string; phone?: string },
) {
  return apiFetch<{ user: PublicUser }>('/v1/auth/me', {
    method: 'PATCH',
    token,
    body: JSON.stringify(patch),
  })
}

export function fetchAdminUsers(token: string) {
  return apiFetch<{ users: PublicUser[] }>('/v1/admin/users', { token })
}

export function updateAdminUser(
  token: string,
  id: string,
  patch: { displayName?: string; phone?: string; roles?: PublicUser['roles'] },
) {
  return apiFetch<{ user: PublicUser }>(`/v1/admin/users/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(patch),
  })
}

export function deleteAdminUser(token: string, id: string) {
  return apiFetch<{ deleted: boolean }>(`/v1/admin/users/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    token,
  })
}
