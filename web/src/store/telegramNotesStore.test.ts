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

  it('применяет авто-сортировку по активному пресету', () => {
    useTelegramNotesStore.getState().setSnapshot(makeSnapshot())
    useTelegramNotesStore.getState().setActivePreset('focus-work')
    useTelegramNotesStore.getState().updateActivePreset({
      priorityToState: { high: 'archived', normal: 'inbox', low: 'inbox' },
      folderToState: { work: 'in_work', finance: 'in_work', media: 'archived' },
      defaultState: 'inbox',
    })

    useTelegramNotesStore.getState().applyAutoRouting()

    const items = useTelegramNotesStore.getState().snapshot?.items ?? []
    const item1 = items.find((x) => x.id === '1')
    const item2 = items.find((x) => x.id === '2')

    expect(item1?.state).toBe('inbox')
    expect(item2?.state).toBe('archived')
  })

  it('создаёт, дублирует, переименовывает и удаляет пользовательский пресет', () => {
    const store = useTelegramNotesStore.getState()

    const baseCount = store.routingPresets.length
    store.createPreset('Мой режим')
    expect(useTelegramNotesStore.getState().routingPresets.length).toBe(baseCount + 1)

    store.duplicateActivePreset()
    expect(useTelegramNotesStore.getState().routingPresets.length).toBe(baseCount + 2)

    store.renameActivePreset('Кастом 2')
    const active = useTelegramNotesStore.getState().routingPresets.find((x) => x.id === useTelegramNotesStore.getState().activePresetId)
    expect(active?.name).toBe('Кастом 2')

    store.deleteActivePreset()
    expect(useTelegramNotesStore.getState().routingPresets.length).toBe(baseCount + 1)
  })

  it('не удаляет базовый пресет и переключает быстрые режимы', () => {
    const store = useTelegramNotesStore.getState()
    store.setActivePreset('balanced')
    const before = store.routingPresets.length
    store.deleteActivePreset()
    expect(useTelegramNotesStore.getState().routingPresets.length).toBe(before)

    store.applyQuickMode('workday')
    expect(useTelegramNotesStore.getState().activePresetId).toBe('focus-work')

    store.applyQuickMode('incoming')
    expect(useTelegramNotesStore.getState().activePresetId).toBe('balanced')

    store.applyQuickMode('archive')
    expect(useTelegramNotesStore.getState().activePresetId).toBe('archive-mode')
  })

  it('экспортирует только пользовательские пресеты и импортирует их обратно', () => {
    const store = useTelegramNotesStore.getState()
    store.createPreset('Экспортируемый')

    const exported = store.exportPresets()
    expect(exported.version).toBe(1)
    expect(exported.presets.length).toBe(1)
    expect(exported.presets[0]?.name).toBe('Экспортируемый')

    store.resetPresetsToDefault()
    const imported = store.importPresets(JSON.stringify(exported), 'replace')
    expect(imported.ok).toBe(true)
    expect(useTelegramNotesStore.getState().routingPresets.some((x) => x.name === 'Экспортируемый')).toBe(true)
  })

  it('merge-импорт добавляет пресеты без потери текущих и без дублей имён', () => {
    const store = useTelegramNotesStore.getState()
    store.createPreset('Мой пресет')

    const payload = JSON.stringify({
      version: 1,
      presets: [
        {
          id: 'x1',
          name: 'Мой пресет',
          priorityToState: { high: 'in_work', normal: 'inbox', low: 'inbox' },
          folderToState: { work: 'in_work' },
          defaultState: 'inbox',
        },
      ],
    })

    const preview = store.previewImportPresets(payload, 'merge')
    expect(preview.ok).toBe(true)
    expect(preview.items.some((x) => x.willRename)).toBe(true)

    const imported = store.importPresets(payload, 'merge')
    expect(imported.ok).toBe(true)
    expect(imported.renamed).toBe(1)

    const names = useTelegramNotesStore
      .getState()
      .routingPresets.filter((x) => !x.locked)
      .map((x) => x.name)

    expect(names).toContain('Мой пресет')
    expect(names.some((x) => x.startsWith('Мой пресет ('))).toBe(true)
  })

  it('мягко пропускает невалидные пресеты и импортирует валидные', () => {
    const store = useTelegramNotesStore.getState()

    const payload = JSON.stringify({
      version: 1,
      presets: [
        {
          id: 'ok-1',
          name: 'Валидный',
          priorityToState: { high: 'in_work', normal: 'inbox', low: 'inbox' },
          folderToState: { work: 'in_work' },
          defaultState: 'inbox',
        },
        { id: 'bad-1', name: 'Битый' },
      ],
    })

    const imported = store.importPresets(payload, 'replace')
    expect(imported.ok).toBe(true)
    expect(imported.added).toBe(1)
    expect(imported.skipped).toBe(1)
    expect(useTelegramNotesStore.getState().routingPresets.some((x) => x.name === 'Валидный')).toBe(true)
  })

  it('можно откатить последний импорт пресетов', () => {
    const store = useTelegramNotesStore.getState()
    store.createPreset('До импорта')
    const beforeNames = useTelegramNotesStore.getState().routingPresets.filter((x) => !x.locked).map((x) => x.name)

    const payload = JSON.stringify({
      version: 1,
      presets: [
        {
          id: 'undo-1',
          name: 'После импорта',
          priorityToState: { high: 'in_work', normal: 'inbox', low: 'inbox' },
          folderToState: { work: 'in_work' },
          defaultState: 'inbox',
        },
      ],
    })

    const imported = store.importPresets(payload, 'replace')
    expect(imported.ok).toBe(true)

    const undo = store.undoLastImport()
    expect(undo.ok).toBe(true)

    const afterNames = useTelegramNotesStore.getState().routingPresets.filter((x) => !x.locked).map((x) => x.name)
    expect(afterNames).toEqual(beforeNames)
  })

  it('сбрасывает пресеты к базовым', () => {
    const store = useTelegramNotesStore.getState()
    store.createPreset('Временный')
    expect(useTelegramNotesStore.getState().routingPresets.some((x) => x.name === 'Временный')).toBe(true)

    store.resetPresetsToDefault()
    expect(useTelegramNotesStore.getState().routingPresets.some((x) => x.name === 'Временный')).toBe(false)
    expect(useTelegramNotesStore.getState().activePresetId).toBe('balanced')
  })
})
