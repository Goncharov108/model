import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TelegramNoteFolder, TelegramNoteState, TelegramNotesSnapshot, TelegramRoutingRuleSet } from '../domain/telegramNotes'
import { newId } from '../lib/newId'

const DEFAULT_PRESETS: TelegramRoutingRuleSet[] = [
  {
    id: 'balanced',
    name: 'Сбалансированный',
    locked: true,
    priorityToState: { high: 'in_work', normal: 'inbox', low: 'inbox' },
    folderToState: { work: 'in_work', finance: 'in_work', media: 'archived' },
    defaultState: 'inbox',
  },
  {
    id: 'focus-work',
    name: 'Фокус на работе',
    locked: true,
    priorityToState: { high: 'in_work', normal: 'in_work', low: 'inbox' },
    folderToState: { work: 'in_work', finance: 'in_work', media: 'archived', ideas: 'inbox', misc: 'inbox' },
    defaultState: 'inbox',
  },
  {
    id: 'archive-mode',
    name: 'Архивный режим',
    locked: true,
    priorityToState: { high: 'in_work', normal: 'archived', low: 'archived' },
    folderToState: { media: 'archived', misc: 'archived', ideas: 'inbox', work: 'in_work', finance: 'in_work' },
    defaultState: 'archived',
  },
]

type QuickMode = 'workday' | 'incoming' | 'archive'

interface TelegramPresetsExport {
  version: 1
  presets: TelegramRoutingRuleSet[]
}

type PresetImportMode = 'replace' | 'merge'

interface TelegramNotesStoreState {
  snapshot: TelegramNotesSnapshot | null
  selectedIds: string[]
  routingPresets: TelegramRoutingRuleSet[]
  activePresetId: string
  setSnapshot: (snapshot: TelegramNotesSnapshot) => void
  setItemState: (id: string, state: TelegramNoteState) => void
  setItemFolder: (id: string, folder: TelegramNoteFolder) => void
  applyStateToSelected: (state: TelegramNoteState) => void
  applyFolderToSelected: (folder: TelegramNoteFolder) => void
  toggleSelected: (id: string) => void
  clearSelection: () => void
  selectAll: (ids: string[]) => void
  setActivePreset: (presetId: string) => void
  updateActivePreset: (patch: Partial<TelegramRoutingRuleSet>) => void
  createPreset: (name: string) => void
  duplicateActivePreset: () => void
  renameActivePreset: (name: string) => void
  deleteActivePreset: () => void
  applyQuickMode: (mode: QuickMode) => void
  resetPresetsToDefault: () => void
  exportPresets: () => TelegramPresetsExport
  importPresets: (payload: string, mode?: PresetImportMode) => { ok: boolean; error?: string }
  applyAutoRouting: () => void
  clear: () => void
}

function getActivePreset(state: Pick<TelegramNotesStoreState, 'routingPresets' | 'activePresetId'>): TelegramRoutingRuleSet {
  return state.routingPresets.find((p) => p.id === state.activePresetId) ?? state.routingPresets[0] ?? DEFAULT_PRESETS[0]
}

function clonePreset(base: TelegramRoutingRuleSet, patch?: Partial<TelegramRoutingRuleSet>): TelegramRoutingRuleSet {
  return {
    id: patch?.id ?? newId(),
    name: patch?.name ?? base.name,
    locked: patch?.locked ?? false,
    priorityToState: { ...base.priorityToState, ...(patch?.priorityToState ?? {}) },
    folderToState: { ...base.folderToState, ...(patch?.folderToState ?? {}) },
    defaultState: patch?.defaultState ?? base.defaultState,
  }
}

function sanitizeName(name: string): string {
  const cleaned = name.trim()
  return cleaned || 'Новый пресет'
}

function normName(name: string): string {
  return sanitizeName(name).toLocaleLowerCase('ru-RU')
}

function uniqueName(name: string, existing: Set<string>): string {
  const base = sanitizeName(name)
  let candidate = base
  let i = 2
  while (existing.has(normName(candidate))) {
    candidate = `${base} (${i})`
    i += 1
  }
  existing.add(normName(candidate))
  return candidate
}

const QUICK_MODE_PRESET: Record<QuickMode, string> = {
  workday: 'focus-work',
  incoming: 'balanced',
  archive: 'archive-mode',
}

function isValidState(value: unknown): value is TelegramNoteState {
  return value === 'inbox' || value === 'in_work' || value === 'archived'
}

function normalizeImportedPresets(raw: unknown): TelegramRoutingRuleSet[] {
  if (!raw || typeof raw !== 'object') return []
  const presets = (raw as { presets?: unknown[] }).presets
  if (!Array.isArray(presets)) return []

  return presets
    .map((preset) => {
      if (!preset || typeof preset !== 'object') return null
      const p = preset as Partial<TelegramRoutingRuleSet>
      if (!p.name || typeof p.name !== 'string') return null
      if (!p.priorityToState || !p.folderToState || !p.defaultState) return null
      if (!isValidState(p.defaultState)) return null
      return {
        id: newId(),
        name: sanitizeName(p.name),
        locked: false,
        priorityToState: {
          high: isValidState((p.priorityToState as Record<string, unknown>)?.high) ? (p.priorityToState as Record<string, TelegramNoteState>).high : 'inbox',
          normal: isValidState((p.priorityToState as Record<string, unknown>)?.normal) ? (p.priorityToState as Record<string, TelegramNoteState>).normal : 'inbox',
          low: isValidState((p.priorityToState as Record<string, unknown>)?.low) ? (p.priorityToState as Record<string, TelegramNoteState>).low : 'inbox',
        },
        folderToState: {
          ideas: isValidState((p.folderToState as Record<string, unknown>)?.ideas) ? (p.folderToState as Record<string, TelegramNoteState>).ideas : undefined,
          work: isValidState((p.folderToState as Record<string, unknown>)?.work) ? (p.folderToState as Record<string, TelegramNoteState>).work : undefined,
          finance: isValidState((p.folderToState as Record<string, unknown>)?.finance) ? (p.folderToState as Record<string, TelegramNoteState>).finance : undefined,
          media: isValidState((p.folderToState as Record<string, unknown>)?.media) ? (p.folderToState as Record<string, TelegramNoteState>).media : undefined,
          misc: isValidState((p.folderToState as Record<string, unknown>)?.misc) ? (p.folderToState as Record<string, TelegramNoteState>).misc : undefined,
        },
        defaultState: p.defaultState,
      }
    })
    .filter((x): x is TelegramRoutingRuleSet => Boolean(x))
}

export const useTelegramNotesStore = create<TelegramNotesStoreState>()(
  persist(
    (set) => ({
      snapshot: null,
      selectedIds: [],
      routingPresets: DEFAULT_PRESETS,
      activePresetId: DEFAULT_PRESETS[0].id,
      setSnapshot: (snapshot) => set({ snapshot, selectedIds: [] }),
      setItemState: (id, state) =>
        set((store) => {
          if (!store.snapshot) return store
          return {
            snapshot: {
              ...store.snapshot,
              items: store.snapshot.items.map((item) => (item.id === id ? { ...item, state } : item)),
            },
          }
        }),
      setItemFolder: (id, folder) =>
        set((store) => {
          if (!store.snapshot) return store
          return {
            snapshot: {
              ...store.snapshot,
              items: store.snapshot.items.map((item) => (item.id === id ? { ...item, folder } : item)),
            },
          }
        }),
      applyStateToSelected: (state) =>
        set((store) => {
          if (!store.snapshot || store.selectedIds.length === 0) return store
          const selected = new Set(store.selectedIds)
          return {
            snapshot: {
              ...store.snapshot,
              items: store.snapshot.items.map((item) => (selected.has(item.id) ? { ...item, state } : item)),
            },
          }
        }),
      applyFolderToSelected: (folder) =>
        set((store) => {
          if (!store.snapshot || store.selectedIds.length === 0) return store
          const selected = new Set(store.selectedIds)
          return {
            snapshot: {
              ...store.snapshot,
              items: store.snapshot.items.map((item) => (selected.has(item.id) ? { ...item, folder } : item)),
            },
          }
        }),
      toggleSelected: (id) =>
        set((store) => {
          const exists = store.selectedIds.includes(id)
          return { selectedIds: exists ? store.selectedIds.filter((x) => x !== id) : [...store.selectedIds, id] }
        }),
      clearSelection: () => set({ selectedIds: [] }),
      selectAll: (ids) => set({ selectedIds: [...new Set(ids)] }),
      setActivePreset: (presetId) =>
        set((store) => {
          const exists = store.routingPresets.some((p) => p.id === presetId)
          return { activePresetId: exists ? presetId : store.activePresetId }
        }),
      updateActivePreset: (patch) =>
        set((store) => ({
          routingPresets: store.routingPresets.map((preset) =>
            preset.id === store.activePresetId
              ? {
                  ...preset,
                  ...patch,
                  name: patch.name ? sanitizeName(patch.name) : preset.name,
                  priorityToState: { ...preset.priorityToState, ...(patch.priorityToState ?? {}) },
                  folderToState: { ...preset.folderToState, ...(patch.folderToState ?? {}) },
                }
              : preset,
          ),
        })),
      createPreset: (name) =>
        set((store) => {
          const preset = clonePreset(getActivePreset(store), { id: newId(), name: sanitizeName(name), locked: false })
          return {
            routingPresets: [...store.routingPresets, preset],
            activePresetId: preset.id,
          }
        }),
      duplicateActivePreset: () =>
        set((store) => {
          const source = getActivePreset(store)
          const preset = clonePreset(source, { id: newId(), name: `${source.name} (копия)`, locked: false })
          return {
            routingPresets: [...store.routingPresets, preset],
            activePresetId: preset.id,
          }
        }),
      renameActivePreset: (name) =>
        set((store) => ({
          routingPresets: store.routingPresets.map((preset) =>
            preset.id === store.activePresetId ? { ...preset, name: sanitizeName(name) } : preset,
          ),
        })),
      deleteActivePreset: () =>
        set((store) => {
          const current = getActivePreset(store)
          if (current.locked) return store
          const next = store.routingPresets.filter((p) => p.id !== current.id)
          if (next.length === 0) {
            return { routingPresets: DEFAULT_PRESETS, activePresetId: DEFAULT_PRESETS[0].id }
          }
          return {
            routingPresets: next,
            activePresetId: next[0].id,
          }
        }),
      applyQuickMode: (mode) =>
        set((store) => {
          const targetId = QUICK_MODE_PRESET[mode]
          const exists = store.routingPresets.some((p) => p.id === targetId)
          return { activePresetId: exists ? targetId : store.activePresetId }
        }),
      resetPresetsToDefault: () => set({ routingPresets: DEFAULT_PRESETS, activePresetId: DEFAULT_PRESETS[0].id }),
      exportPresets: () => {
        const state = useTelegramNotesStore.getState()
        return {
          version: 1,
          presets: state.routingPresets.filter((p) => !p.locked),
        }
      },
      importPresets: (payload: string, mode: PresetImportMode = 'replace') => {
        try {
          const parsed = JSON.parse(payload)
          const imported = normalizeImportedPresets(parsed)
          if (imported.length === 0) return { ok: false, error: 'Не найдено валидных пресетов в файле' }

          set((store) => {
            const base = DEFAULT_PRESETS
            const existingCustom = store.routingPresets.filter((p) => !p.locked)
            const existingNames = new Set(
              (mode === 'merge' ? [...base, ...existingCustom] : base).map((p) => normName(p.name)),
            )

            const normalizedImported = imported.map((p) => ({
              ...p,
              id: newId(),
              name: uniqueName(p.name, existingNames),
              locked: false,
            }))

            const custom = mode === 'merge' ? [...existingCustom, ...normalizedImported] : normalizedImported
            return {
              routingPresets: [...base, ...custom],
              activePresetId: normalizedImported[0]?.id ?? store.activePresetId,
            }
          })
          return { ok: true }
        } catch {
          return { ok: false, error: 'Некорректный JSON-файл' }
        }
      },
      applyAutoRouting: () =>
        set((store) => {
          if (!store.snapshot) return store
          const preset = getActivePreset(store)
          return {
            snapshot: {
              ...store.snapshot,
              items: store.snapshot.items.map((item) => {
                const fromPriority = preset.priorityToState[item.priority]
                const fromFolder = preset.folderToState[item.folder]
                return { ...item, state: fromPriority ?? fromFolder ?? preset.defaultState }
              }),
            },
          }
        }),
      clear: () =>
        set({
          snapshot: null,
          selectedIds: [],
          routingPresets: DEFAULT_PRESETS,
          activePresetId: DEFAULT_PRESETS[0].id,
        }),
    }),
    {
      name: 'model-telegram-notes-v1',
      partialize: (state) => ({
        snapshot: state.snapshot,
        routingPresets: state.routingPresets,
        activePresetId: state.activePresetId,
      }),
    },
  ),
)
