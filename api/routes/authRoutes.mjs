import { profileFromGoogleAuthCode } from '../lib/googleCodeAuth.mjs'
import { verifyGoogleIdToken } from '../lib/googleVerify.mjs'
import { readBearerToken, requireRoles, resolveSession } from '../lib/httpAuth.mjs'
import { signSessionToken } from '../lib/sessionJwt.mjs'
import { toPublicUser } from '../lib/userStore.mjs'

/** Обработчики /v1/auth/* и /v1/admin/users. */
export function createAuthHandlers(config, userStore) {
  return {
    async handleAuthGoogleCode(req, res, sendJson, readJsonBody) {
      if (!config.codeAuthEnabled) {
        sendJson(res, 503, {
          ok: false,
          error: 'AUTH_DISABLED',
          message: 'Redirect-вход не настроен: задайте GOOGLE_CLIENT_SECRET на сервере.',
        })
        return
      }

      try {
        const body = await readJsonBody(req)
        const code = typeof body?.code === 'string' ? body.code.trim() : ''
        const redirectUri = typeof body?.redirectUri === 'string' ? body.redirectUri.trim() : ''

        if (!code || !redirectUri) {
          sendJson(res, 400, {
            ok: false,
            error: 'VALIDATION_ERROR',
            message: 'Поля code и redirectUri обязательны.',
          })
          return
        }

        const profile = await profileFromGoogleAuthCode(
          code,
          redirectUri,
          config.googleClientId,
          config.googleClientSecret,
        )

        if (!profile.emailVerified) {
          sendJson(res, 403, {
            ok: false,
            error: 'EMAIL_NOT_VERIFIED',
            message: 'Подтвердите e-mail в Google.',
          })
          return
        }

        const user = await userStore.upsertGoogleUser(profile)
        const token = signSessionToken(
          { sub: user.id, email: user.email, roles: user.roles },
          config.sessionSecret,
        )

        sendJson(res, 200, { ok: true, data: { token, user: toPublicUser(user) } })
      } catch (err) {
        mapAuthError(res, sendJson, err)
      }
    },

    async handleAuthGoogle(req, res, sendJson, readJsonBody) {
      if (!config.authEnabled) {
        sendJson(res, 503, {
          ok: false,
          error: 'AUTH_DISABLED',
          message: 'Авторизация не настроена на сервере (GOOGLE_CLIENT_ID, SESSION_SECRET).',
        })
        return
      }

      try {
        const body = await readJsonBody(req)
        const credential = body?.credential
        if (typeof credential !== 'string' || !credential.trim()) {
          sendJson(res, 400, {
            ok: false,
            error: 'VALIDATION_ERROR',
            message: 'Поле credential обязательно.',
          })
          return
        }

        const profile = await verifyGoogleIdToken(credential.trim(), config.googleClientId)
        if (!profile.emailVerified) {
          sendJson(res, 403, {
            ok: false,
            error: 'EMAIL_NOT_VERIFIED',
            message: 'Подтвердите e-mail в Google.',
          })
          return
        }

        const user = await userStore.upsertGoogleUser(profile)
        const token = signSessionToken(
          { sub: user.id, email: user.email, roles: user.roles },
          config.sessionSecret,
        )

        sendJson(res, 200, {
          ok: true,
          data: { token, user: toPublicUser(user) },
        })
      } catch (err) {
        mapAuthError(res, sendJson, err)
      }
    },

    async handleAuthDev(req, res, sendJson, readJsonBody) {
      if (!config.devBypass) {
        sendJson(res, 404, { ok: false, error: 'NOT_FOUND', message: 'Dev-вход отключён.' })
        return
      }

      try {
        const body = await readJsonBody(req)
        const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
        if (!email) {
          sendJson(res, 400, { ok: false, error: 'VALIDATION_ERROR', message: 'Поле email обязательно.' })
          return
        }

        const user = await userStore.upsertDevUser(email, body?.displayName)
        const token = signSessionToken(
          { sub: user.id, email: user.email, roles: user.roles },
          config.sessionSecret,
        )
        sendJson(res, 200, { ok: true, data: { token, user: toPublicUser(user) } })
      } catch (err) {
        mapAuthError(res, sendJson, err)
      }
    },

    async handleAuthMe(req, res, sendJson) {
      const session = await resolveSession(req, config, userStore)
      if (!session) {
        sendJson(res, 401, { ok: false, error: 'UNAUTHORIZED', message: 'Требуется вход.' })
        return
      }
      sendJson(res, 200, { ok: true, data: { user: session.publicUser } })
    },

    async handleAuthLogout(_req, res, sendJson) {
      sendJson(res, 200, { ok: true, data: { loggedOut: true } })
    },

    async handleAuthConfig(_req, res, sendJson) {
      sendJson(res, 200, {
        ok: true,
        data: {
          googleClientId: config.googleClientId || null,
          authEnabled: config.authEnabled,
          codeAuthEnabled: config.codeAuthEnabled,
          devBypass: config.devBypass,
        },
      })
    },

    async handleAdminListUsers(req, res, sendJson) {
      try {
        const session = await resolveSession(req, config, userStore)
        requireRoles(session, ['owner', 'developer'])
        const users = await userStore.list()
        sendJson(res, 200, { ok: true, data: { users: users.map(toPublicUser) } })
      } catch (err) {
        mapAuthError(res, sendJson, err)
      }
    },

    async handleAdminUpdateUser(req, res, sendJson, readJsonBody, userId) {
      try {
        const session = await resolveSession(req, config, userStore)
        requireRoles(session, ['owner'])
        const body = await readJsonBody(req)
        const user = await userStore.updateUser(
          userId,
          {
            displayName: body.displayName,
            phone: body.phone,
            roles: body.roles,
          },
          session.user,
        )
        sendJson(res, 200, { ok: true, data: { user: toPublicUser(user) } })
      } catch (err) {
        mapAuthError(res, sendJson, err)
      }
    },

    async handleAdminDeleteUser(req, res, sendJson, userId) {
      try {
        const session = await resolveSession(req, config, userStore)
        requireRoles(session, ['owner'])
        await userStore.removeUser(userId, session.user)
        sendJson(res, 200, { ok: true, data: { deleted: true } })
      } catch (err) {
        mapAuthError(res, sendJson, err)
      }
    },

    async handlePatchMe(req, res, sendJson, readJsonBody) {
      try {
        const session = await resolveSession(req, config, userStore)
        if (!session) {
          sendJson(res, 401, { ok: false, error: 'UNAUTHORIZED', message: 'Требуется вход.' })
          return
        }

        const body = await readJsonBody(req)
        const user = await userStore.patchOwnProfile(session.user.id, {
          displayName: body.displayName,
          phone: body.phone,
        })

        sendJson(res, 200, { ok: true, data: { user: toPublicUser(user) } })
      } catch (err) {
        mapAuthError(res, sendJson, err)
      }
    },
  }
}

function mapAuthError(res, sendJson, err) {
  const code = err?.message || 'INTERNAL_ERROR'

  const map = {
    EMAIL_NOT_ALLOWED: [403, 'Доступ по этой почте пока не открыт. Обратитесь к владельцу.'],
    EMAIL_NOT_VERIFIED: [403, 'E-mail в Google не подтверждён.'],
    GOOGLE_NOT_CONFIGURED: [503, 'Google OAuth не настроен на сервере.'],
    GOOGLE_NO_ID_TOKEN: [401, 'Google не вернул id_token.'],
    GOOGLE_INVALID_PAYLOAD: [401, 'Некорректный ответ Google.'],
    UNAUTHORIZED: [401, 'Требуется вход.'],
    FORBIDDEN: [403, 'Недостаточно прав.'],
    NOT_FOUND: [404, 'Пользователь не найден.'],
    LAST_OWNER: [409, 'Нельзя снять роль у последнего владельца.'],
  }

  if (map[code]) {
    const [status, message] = map[code]
    sendJson(res, status, { ok: false, error: code, message })
    return
  }

  process.stderr.write(`AUTH_ERROR ${code} ${err?.stack ?? ''}\n`)
  sendJson(res, 500, { ok: false, error: 'INTERNAL_ERROR', message: 'Ошибка авторизации.' })
}
