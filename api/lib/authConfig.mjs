import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** Читает конфиг авторизации из переменных окружения API. */
export function loadAuthConfig() {
  const googleClientId = (process.env.GOOGLE_CLIENT_ID || '').trim()
  const googleClientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim()
  const sessionSecret = (process.env.SESSION_SECRET || '').trim()
  const ownerEmails = parseEmailList(process.env.OWNER_EMAILS || process.env.OWNER_EMAIL || '')
  const dataDir = process.env.MODEL_DATA_DIR || path.join(__dirname, '..', 'data')
  const devBypass = process.env.DEV_AUTH_BYPASS === '1'

  return {
    googleClientId,
    googleClientSecret,
    sessionSecret,
    ownerEmails,
    dataDir,
    usersFile: path.join(dataDir, 'users.json'),
    devBypass,
    authEnabled: Boolean(googleClientId && sessionSecret) || devBypass,
    codeAuthEnabled: Boolean(googleClientId && googleClientSecret && sessionSecret),
  }
}

/** Нормализует список e-mail из env (через запятую/точку с запятой). */
export function parseEmailList(raw) {
  return raw
    .split(/[,;]/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

/** E-mail владельца из allowlist → роли owner + developer. */
export function rolesForNewUser(email, ownerEmails) {
  const normalized = email.trim().toLowerCase()
  if (ownerEmails.includes(normalized)) {
    return ['owner', 'developer']
  }
  return ['guest']
}
