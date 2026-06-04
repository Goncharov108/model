import crypto from 'node:crypto'

const DEFAULT_TTL_SEC = 60 * 60 * 24 * 14

/** Подписывает сессионный JWT (HS256) для API model. */
export function signSessionToken(payload, secret, ttlSec = DEFAULT_TTL_SEC) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const body = {
    ...payload,
    iat: now,
    exp: now + ttlSec,
  }
  const encodedHeader = base64Url(JSON.stringify(header))
  const encodedBody = base64Url(JSON.stringify(body))
  const data = `${encodedHeader}.${encodedBody}`
  const sig = crypto.createHmac('sha256', secret).update(data).digest('base64url')
  return `${data}.${sig}`
}

/** Проверяет сессионный JWT; при ошибке возвращает null. */
export function verifySessionToken(token, secret) {
  if (!token || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 3) return null

  const [encodedHeader, encodedBody, signature] = parts
  const data = `${encodedHeader}.${encodedBody}`
  const expected = crypto.createHmac('sha256', secret).update(data).digest('base64url')
  if (!timingSafeEqual(signature, expected)) return null

  let body
  try {
    body = JSON.parse(Buffer.from(encodedBody, 'base64url').toString('utf8'))
  } catch {
    return null
  }

  const now = Math.floor(Date.now() / 1000)
  if (typeof body.exp !== 'number' || body.exp < now) return null
  if (typeof body.sub !== 'string' || !body.sub) return null

  return body
}

function base64Url(json) {
  return Buffer.from(json, 'utf8').toString('base64url')
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
}
