import { PRIVATE_PHILOSOPHY_API_PATH } from './privatePhilosophyPaths'

export type PrivatePhilosophyLoadResult =
  | { ok: true; text: string }
  | { ok: false; reason: 'offline' | 'error'; message: string }

/** Загружает текст с диска через локальный dev-сервер Vite. */
export async function loadPrivatePhilosophyFromDisk(): Promise<PrivatePhilosophyLoadResult> {
  try {
    const res = await fetch(PRIVATE_PHILOSOPHY_API_PATH)
    if (!res.ok) {
      return {
        ok: false,
        reason: 'error',
        message: res.status === 404 ? 'Файл не найден' : `HTTP ${res.status}`,
      }
    }
    return { ok: true, text: await res.text() }
  } catch {
    return {
      ok: false,
      reason: 'offline',
      message: 'Нет связи с локальным API (запустите npm run dev в web/)',
    }
  }
}

/** Сохраняет текст на диск через локальный dev-сервер Vite. */
export async function savePrivatePhilosophyToDisk(text: string): Promise<PrivatePhilosophyLoadResult> {
  try {
    const res = await fetch(PRIVATE_PHILOSOPHY_API_PATH, {
      method: 'PUT',
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      body: text,
    })
    if (!res.ok) {
      return { ok: false, reason: 'error', message: `HTTP ${res.status}` }
    }
    return { ok: true, text }
  } catch {
    return {
      ok: false,
      reason: 'offline',
      message: 'Нет связи с локальным API (запустите npm run dev в web/)',
    }
  }
}
