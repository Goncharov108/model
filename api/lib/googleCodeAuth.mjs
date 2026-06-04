import { OAuth2Client } from 'google-auth-library'
import { verifyGoogleIdToken } from './googleVerify.mjs'

/** Обменивает authorization code (redirect-вход) на профиль Google. */
export async function profileFromGoogleAuthCode(code, redirectUri, clientId, clientSecret) {
  if (!clientId || !clientSecret) {
    throw new Error('GOOGLE_NOT_CONFIGURED')
  }

  const client = new OAuth2Client(clientId, clientSecret, redirectUri)
  const { tokens } = await client.getToken({
    code,
    redirect_uri: redirectUri,
  })

  if (!tokens.id_token) {
    throw new Error('GOOGLE_NO_ID_TOKEN')
  }

  return verifyGoogleIdToken(tokens.id_token, clientId)
}
