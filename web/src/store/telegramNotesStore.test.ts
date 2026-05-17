import { beforeEach, describe, expect, it } from 'vitest'
import type { TelegramNotesSnapshot } from '../domain/telegramNotes'
import { useTelegramNotesStore } from './telegramNotesStore'

function makeSnapshot(): TelegramNotesSnapshot {
  return {
    importedAtIso: '2026-05-17T10:00:00.000Z',
    sourceName: 'test.json',
    totalMessages: 2,
    dedupedCount: 0,
    items: [
      {
        id: '1',
        dateIso: '2026-05-17T09:00:00.000Z',
        text: 'Заметка 1',
        group: 'text',
        links: [],
        hasPhoto: false,
        hasFile: false,
        tags: ['text'],
        priority: 'normal',
        state: 'inbox',
        dedupeKey: 'k1',
        folder: 'ideas',
      },
      {
        id: '2',
        dateIso: '2026-05-17T09:05:00.000Z',
        text: 'Заметка 2',
        group: 'link',
        links: ['https://github.com/org/repo'],
        hasPhoto: false,
        hasFile: false,
        tags: ['github'],
        priority: 'high',
        state: 'inbox',
        dedupeKey: 'k2',
        folder: 'work',
      },
    ],
  }
}

describe('telegramNotesStore', () => {
  beforeEach(() => {
    useTelegramNotesStore.getState().clear()
  })

  it('меняет папку у одной заметки вручную', () => {
    useTelegramNotesStore.getState().setSnapshot(makeSnapshot())
    useTelegramNotesStore.getState().setItemFolder('1', 'finance')

    const item = useTelegramNotesStore.getState().snapshot?.items.find((x) => x.id === '1')
    expect(item?.folder).toBe('finance')
  })

  it('применяет массовые действия по выбранным заметкам', () => {
    useTelegramNotesStore.getState().setSnapshot(makeSnapshot())
    useTelegramNotesStore.getState().selectAll(['1', '2'])
    useTelegramNotesStore.getState().applyStateToSelected('archived')
    useTelegramNotesStore.getState().applyFolderToSelected('misc')

    const items = useTelegramNotesStore.getState().snapshot?.items ?? []
    expect(items.every((x) => x.state === 'archived')).toBe(true)
    expect(items.every((x) => x.folder === 'misc')).toBe(true)
  })
})
