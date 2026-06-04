import { OAuth2Client } from 'google-auth-library'

/** Проверяет Google ID token (кнопка Sign in with Google) и возвращает профиль. */
export async function verifyGoogleIdToken(idToken, clientId) {
  if (!clientId) {
    throw new Error('GOOGLE_NOT_CONFIGURED')
  }

  const client = new OAuth2Client(clientId)
  const ticket = await client.verifyIdToken({
    idToken,
    audience: clientId,
  })

  const payload = ticket.getPayload()
  if (!payload?.email || !payload.sub) {
    throw new Error('GOOGLE_INVALID_PAYLOAD')
  }

  return {
    googleSub: payload.sub,
    email: payload.email.trim().toLowerCase(),
    emailVerified: Boolean(payload.email_verified),
    displayName: payload.name?.trim() || payload.email.split('@')[0],
    photoUrl: payload.picture || null,
  }
}
