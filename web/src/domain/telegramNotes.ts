export type TelegramNoteGroup = 'video' | 'link' | 'text' | 'photo' | 'file' | 'other'

export type TelegramNotePriority = 'high' | 'normal' | 'low'

export type TelegramNoteState = 'inbox' | 'in_work' | 'archived'

export type TelegramNoteFolder = 'ideas' | 'work' | 'finance' | 'media' | 'misc'

export interface TelegramNoteItem {
  id: string
  dateIso: string
  text: string
  group: TelegramNoteGroup
  links: string[]
  hasPhoto: boolean
  hasFile: boolean
  rawType?: string
  tags: string[]
  priority: TelegramNotePriority
  state: TelegramNoteState
  dedupeKey: string
  folder: TelegramNoteFolder
}

export interface TelegramNotesSnapshot {
  importedAtIso: string
  sourceName: string
  totalMessages: number
  dedupedCount: number
  items: TelegramNoteItem[]
}

export interface TelegramRoutingRuleSet {
  id: string
  name: string
  priorityToState: Record<TelegramNotePriority, TelegramNoteState>
  folderToState: Partial<Record<TelegramNoteFolder, TelegramNoteState>>
  defaultState: TelegramNoteState
}
