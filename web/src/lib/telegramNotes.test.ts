import { describe, expect, it } from 'vitest'
import { countByGroup, parseTelegramNotesExport } from './telegramNotes'

describe('parseTelegramNotesExport', () => {
  it('парсит плоский export messages и раскладывает по группам', () => {
    const raw = JSON.stringify({
      messages: [
        { id: 1, date: '2026-05-01T10:00:00', text: 'https://youtube.com/watch?v=1' },
        { id: 2, date: '2026-05-01T11:00:00', text: 'моя мысль на утро' },
        { id: 3, date: '2026-05-01T12:00:00', photo: 'photos/file.jpg', text: '' },
      ],
    })

    const snapshot = parseTelegramNotesExport(raw, 'result.json')

    expect(snapshot.items).toHaveLength(3)
    expect(snapshot.items.find((x) => x.id === '1')?.group).toBe('video')
    expect(snapshot.items.find((x) => x.id === '2')?.group).toBe('text')
    expect(snapshot.items.find((x) => x.id === '3')?.group).toBe('photo')
  })

  it('парсит вложенный export chats.list[*].messages', () => {
    const raw = JSON.stringify({
      chats: {
        list: [{ messages: [{ id: 9, date: '2026-05-01T10:00:00', text: 'https://example.com/a' }] }],
      },
    })

    const snapshot = parseTelegramNotesExport(raw, 'chat.json')
    const counters = countByGroup(snapshot.items)

    expect(snapshot.items).toHaveLength(1)
    expect(counters.link).toBe(1)
  })

  it('удаляет дубли и ставит теги/приоритет/статус', () => {
    const raw = JSON.stringify({
      messages: [
        { id: 10, date: '2026-05-01T10:00:00', text: 'Срочно сделать отчёт https://github.com/test/repo' },
        { id: 11, date: '2026-05-01T10:05:00', text: 'Срочно сделать отчёт https://github.com/test/repo' },
      ],
    })

    const snapshot = parseTelegramNotesExport(raw, 'dup.json')

    expect(snapshot.items).toHaveLength(1)
    expect(snapshot.dedupedCount).toBe(1)
    expect(snapshot.items[0]?.tags).toContain('github')
    expect(snapshot.items[0]?.priority).toBe('high')
    expect(snapshot.items[0]?.state).toBe('inbox')
  })
})
