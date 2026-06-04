import fs from 'node:fs/promises'
import path from 'node:path'
import { rolesForNewUser } from './authConfig.mjs'

/** @typedef {'owner' | 'developer' | 'viewer' | 'guest'} AppRole */

/**
 * @typedef {object} StoredUser
 * @property {string} id
 * @property {string} email
 * @property {string} googleSub
 * @property {string} displayName
 * @property {string} phone
 * @property {string | null} photoUrl
 * @property {AppRole[]} roles
 * @property {string} createdAtIso
 * @property {string} updatedAtIso
 * @property {string} lastLoginAtIso
 */

/** JSON-хранилище пользователей на диске (prod: MODEL_DATA_DIR). */
export class UserStore {
  /** @param {{ usersFile: string; ownerEmails: string[] }} options */
  constructor(options) {
    this.usersFile = options.usersFile
    this.ownerEmails = options.ownerEmails
  }

  async init() {
    await fs.mkdir(path.dirname(this.usersFile), { recursive: true })
    try {
      await fs.access(this.usersFile)
    } catch {
      await this.write({ users: [] })
    }
  }

  async read() {
    const raw = await fs.readFile(this.usersFile, 'utf8')
    const data = JSON.parse(raw)
    if (!Array.isArray(data.users)) return { users: [] }
    return data
  }

  async write(data) {
    const tmp = `${this.usersFile}.tmp`
    await fs.writeFile(tmp, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
    await fs.rename(tmp, this.usersFile)
  }

  /** @returns {Promise<StoredUser | null>} */
  async findByEmail(email) {
    const data = await this.read()
    return data.users.find((u) => u.email === email.trim().toLowerCase()) ?? null
  }

  /** @returns {Promise<StoredUser | null>} */
  async findById(id) {
    const data = await this.read()
    return data.users.find((u) => u.id === id) ?? null
  }

  /** @returns {Promise<StoredUser[]>} */
  async list() {
    const data = await this.read()
    return [...data.users].sort((a, b) => b.updatedAtIso.localeCompare(a.updatedAtIso))
  }

  /**
   * Вход через Google: только e-mail из OWNER_EMAILS (пока закрытая регистрация).
   * @param {object} profile
   */
  async upsertGoogleUser(profile) {
    const email = profile.email.trim().toLowerCase()
    if (!this.ownerEmails.includes(email)) {
      throw new Error('EMAIL_NOT_ALLOWED')
    }

    const now = new Date().toISOString()
    const data = await this.read()
    const idx = data.users.findIndex((u) => u.email === email)
    const roles = rolesForNewUser(email, this.ownerEmails)

    if (idx >= 0) {
      const existing = data.users[idx]
      const merged = {
        ...existing,
        displayName: profile.displayName || existing.displayName,
        photoUrl: profile.photoUrl ?? existing.photoUrl,
        googleSub: profile.googleSub,
        roles: mergeRoles(existing.roles, roles),
        updatedAtIso: now,
        lastLoginAtIso: now,
      }
      data.users[idx] = merged
      await this.write(data)
      return merged
    }

    const row = {
      id: `google:${profile.googleSub}`,
      email,
      googleSub: profile.googleSub,
      displayName: profile.displayName,
      phone: '',
      photoUrl: profile.photoUrl,
      roles,
      createdAtIso: now,
      updatedAtIso: now,
      lastLoginAtIso: now,
    }
    data.users.push(row)
    await this.write(data)
    return row
  }

  /** Dev-вход без Google (только DEV_AUTH_BYPASS=1). */
  async upsertDevUser(email, displayName) {
    const normalized = email.trim().toLowerCase()
    if (!this.ownerEmails.includes(normalized)) {
      throw new Error('EMAIL_NOT_ALLOWED')
    }
    return this.upsertGoogleUser({
      email: normalized,
      googleSub: `dev-${normalized}`,
      displayName: displayName || normalized.split('@')[0],
      photoUrl: null,
    })
  }

  /** @param {string} id @param {Partial<StoredUser>} patch */
  async updateUser(id, patch, actor) {
    if (!actor.roles.includes('owner')) {
      throw new Error('FORBIDDEN')
    }

    const data = await this.read()
    const idx = data.users.findIndex((u) => u.id === id)
    if (idx < 0) throw new Error('NOT_FOUND')

    const target = data.users[idx]
    if (target.roles.includes('owner') && patch.roles && !patch.roles.includes('owner')) {
      const owners = data.users.filter((u) => u.roles.includes('owner'))
      if (owners.length <= 1) throw new Error('LAST_OWNER')
    }

    const now = new Date().toISOString()
    data.users[idx] = {
      ...target,
      displayName: patch.displayName?.trim() || target.displayName,
      phone: patch.phone !== undefined ? String(patch.phone) : target.phone,
      roles: patch.roles ? normalizeRoles(patch.roles) : target.roles,
      updatedAtIso: now,
    }
    await this.write(data)
    return data.users[idx]
  }

  /** Обновление своего профиля (имя, телефон) без прав owner. */
  async patchOwnProfile(id, patch) {
    const data = await this.read()
    const idx = data.users.findIndex((u) => u.id === id)
    if (idx < 0) throw new Error('NOT_FOUND')

    const target = data.users[idx]
    const now = new Date().toISOString()
    data.users[idx] = {
      ...target,
      displayName:
        typeof patch.displayName === 'string' && patch.displayName.trim()
          ? patch.displayName.trim()
          : target.displayName,
      phone: patch.phone !== undefined ? String(patch.phone) : target.phone,
      updatedAtIso: now,
    }
    await this.write(data)
    return data.users[idx]
  }

  async removeUser(id, actor) {
    if (!actor.roles.includes('owner')) throw new Error('FORBIDDEN')

    const data = await this.read()
    const target = data.users.find((u) => u.id === id)
    if (!target) throw new Error('NOT_FOUND')
    if (target.roles.includes('owner')) {
      const owners = data.users.filter((u) => u.roles.includes('owner'))
      if (owners.length <= 1) throw new Error('LAST_OWNER')
    }

    data.users = data.users.filter((u) => u.id !== id)
    await this.write(data)
  }
}

function mergeRoles(existing, incoming) {
  return normalizeRoles([...(existing || []), ...incoming])
}

function normalizeRoles(roles) {
  const order = ['owner', 'developer', 'viewer', 'guest']
  const set = new Set(roles.filter((r) => order.includes(r)))
  return order.filter((r) => set.has(r))
}

/** Публичное представление пользователя для API. */
export function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    phone: user.phone,
    photoUrl: user.photoUrl,
    roles: user.roles,
    primaryRole: primaryRole(user.roles),
    createdAtIso: user.createdAtIso,
    updatedAtIso: user.updatedAtIso,
    lastLoginAtIso: user.lastLoginAtIso,
  }
}

export function primaryRole(roles) {
  if (roles.includes('owner')) return 'owner'
  if (roles.includes('developer')) return 'developer'
  if (roles.includes('viewer')) return 'viewer'
  return 'guest'
}

export function userHasRole(user, role) {
  return user.roles.includes(role)
}
