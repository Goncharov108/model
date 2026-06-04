import { verifySessionToken } from './sessionJwt.mjs'
import { toPublicUser } from './userStore.mjs'

/** Извлекает Bearer-токен из заголовка Authorization. */
export function readBearerToken(req) {
  const header = req.headers.authorization || ''
  const match = /^Bearer\s+(.+)$/i.exec(header)
  return match?.[1]?.trim() || null
}

/** Загружает сессию и пользователя; null если не авторизован. */
export async function resolveSession(req, config, userStore) {
  const token = readBearerToken(req)
  if (!token) return null

  const payload = verifySessionToken(token, config.sessionSecret)
  if (!payload?.sub) return null

  const user = await userStore.findById(payload.sub)
  if (!user) return null

  return { token, payload, user, publicUser: toPublicUser(user) }
}

/** Требует роль из списка; иначе бросает код ошибки. */
export function requireRoles(session, roles) {
  if (!session) throw new Error('UNAUTHORIZED')
  const ok = roles.some((role) => session.user.roles.includes(role))
  if (!ok) throw new Error('FORBIDDEN')
}
