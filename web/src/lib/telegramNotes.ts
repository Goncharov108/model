import { newId } from './newId'
import type {
  TelegramNoteGroup,
  TelegramNoteItem,
  TelegramNotePriority,
  TelegramNotesSnapshot,
} from '../domain/telegramNotes'

interface TelegramExportMessage {
  id?: number | string
  type?: string
  date?: string
  text?: string | Array<string | { type?: string; text?: string; href?: string }>
  file?: string
  photo?: string
  media_type?: string
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function flattenText(text: TelegramExportMessage['text']): { plain: string; links: string[] } {
  if (typeof text === 'string') return { plain: text.trim(), links: extractLinks(text) }
  if (!Array.isArray(text)) return { plain: '', links: [] }

  const chunks: string[] = []
  const links: string[] = []

  for (const part of text) {
    if (typeof part === 'string') {
      chunks.push(part)
      links.push(...extractLinks(part))
      continue
    }
    if (!isObject(part)) continue
    const rawText = typeof part.text === 'string' ? part.text : ''
    const rawHref = typeof part.href === 'string' ? part.href : ''
    if (rawText) chunks.push(rawText)
    if (rawHref) links.push(rawHref)
    links.push(...extractLinks(rawText))
  }

  return { plain: chunks.join('').trim(), links: uniq(links) }
}

function extractLinks(text: string): string[] {
  const matches = text.match(/https?:\/\/\S+/gi) ?? []
  return matches.map((x) => x.replace(/[),.;!?]+$/g, ''))
}

function uniq(items: string[]): string[] {
  return [...new Set(items.filter(Boolean))]
}

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim()
}

function domainTagFromLink(link: string): string | null {
  try {
    const hostname = new URL(link).hostname.replace(/^www\./, '')
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return 'youtube'
    if (hostname.includes('rutube.ru')) return 'rutube'
    if (hostname.includes('t.me') || hostname.includes('telegram.me')) return 'telegram'
    if (hostname.includes('github.com')) return 'github'
    if (hostname.includes('notion.so')) return 'notion'
    return hostname.split('.')[0] || null
  } catch {
    return null
  }
}

function detectTags(input: { text: string; links: string[]; group: TelegramNoteGroup }): string[] {
  const tags = new Set<string>()
  const fullText = `${input.text} ${input.links.join(' ')}`.toLowerCase()

  tags.add(input.group)

  for (const link of input.links) {
    const tag = domainTagFromLink(link)
    if (tag) tags.add(tag)
  }

  if (/\b(идея|idea|гипотеза)\b/.test(fullText)) tags.add('idea')
  if (/\b(сделать|todo|задача|в работу|срок)\b/.test(fullText)) tags.add('todo')
  if (/\b(купить|платеж|оплата|сч[её]т)\b/.test(fullText)) tags.add('finance')
  if (/\b(позвонить|встреча|созвон|календар)\b/.test(fullText)) tags.add('meeting')
  if (/\b(важно|срочно|asap|urgent)\b/.test(fullText)) tags.add('urgent')

  return [...tags]
}

function detectPriority(input: { text: string; links: string[]; tags: string[]; group: TelegramNoteGroup }): TelegramNotePriority {
  const fullText = `${input.text} ${input.links.join(' ')}`.toLowerCase()
  const hasUrgentTag = input.tags.includes('urgent')
  const hasTaskWords = ['срочно', 'важно', 'дедлайн', 'today', 'сегодня', 'критично'].some((token) =>
    fullText.includes(token),
  )
  if (hasUrgentTag || hasTaskWords) return 'high'
  if (input.group === 'video' || input.group === 'link') return 'low'
  return 'normal'
}

function classifyGroup(input: {
  links: string[]
  text: string
  hasPhoto: boolean
  hasFile: boolean
  mediaType?: string
}): TelegramNoteGroup {
  if (input.hasPhoto) return 'photo'
  if (input.hasFile) return 'file'

  const fullText = `${input.text} ${input.links.join(' ')}`.toLowerCase()
  const hasVideoLink =
    input.links.some((link) => /youtube\.com|youtu\.be|vimeo\.com|rutube\.ru|vk\.com\/video/.test(link)) ||
    /\b(video|видео)\b/.test(fullText) ||
    input.mediaType === 'video_file'

  if (hasVideoLink) return 'video'
  if (input.links.length > 0) return 'link'
  if (input.text.trim().length > 0) return 'text'
  return 'other'
}

function buildDedupeKey(input: { text: string; links: string[]; group: TelegramNoteGroup; hasPhoto: boolean; hasFile: boolean }): string {
  const normalized = normalizeText(input.text)
  const links = [...input.links].sort().join('|')
  return `${input.group}::${normalized}::${links}::${input.hasPhoto ? '1' : '0'}${input.hasFile ? '1' : '0'}`
}

export function parseTelegramNotesExport(raw: string, sourceName: string): TelegramNotesSnapshot {
  const parsed: unknown = JSON.parse(raw)

  const messages = collectMessages(parsed)
  const items: TelegramNoteItem[] = []
  const seen = new Set<string>()
  let dedupedCount = 0

  for (const message of messages) {
    const { plain, links } = flattenText(message.text)
    const hasPhoto = typeof message.photo === 'string' && message.photo.length > 0
    const hasFile = typeof message.file === 'string' && message.file.length > 0
    const dateIso = typeof message.date === 'string' ? message.date : new Date().toISOString()

    const group = classifyGroup({
      links,
      text: plain,
      hasPhoto,
      hasFile,
      mediaType: typeof message.media_type === 'string' ? message.media_type : undefined,
    })

    if (!plain && links.length === 0 && !hasPhoto && !hasFile) continue

    const dedupeKey = buildDedupeKey({ text: plain, links, group, hasPhoto, hasFile })
    if (seen.has(dedupeKey)) {
      dedupedCount += 1
      continue
    }
    seen.add(dedupeKey)

    const tags = detectTags({ text: plain, links, group })
    const priority = detectPriority({ text: plain, links, tags, group })

    items.push({
      id: String(message.id ?? newId()),
      dateIso,
      text: plain,
      links,
      hasPhoto,
      hasFile,
      group,
      rawType: message.type,
      tags,
      priority,
      state: 'inbox',
      dedupeKey,
    })
  }

  items.sort((a, b) => (a.dateIso < b.dateIso ? 1 : -1))

  return {
    importedAtIso: new Date().toISOString(),
    sourceName,
    totalMessages: messages.length,
    dedupedCount,
    items,
  }
}

function collectMessages(parsed: unknown): TelegramExportMessage[] {
  if (!isObject(parsed)) return []

  if (Array.isArray((parsed as { messages?: unknown }).messages)) {
    return (parsed as { messages: unknown[] }).messages.filter(isObject) as TelegramExportMessage[]
  }

  const chats = (parsed as { chats?: unknown }).chats
  if (!isObject(chats) || !Array.isArray((chats as { list?: unknown }).list)) return []

  const out: TelegramExportMessage[] = []
  for (const chat of (chats as { list: unknown[] }).list) {
    if (!isObject(chat)) continue
    const messages = (chat as { messages?: unknown }).messages
    if (!Array.isArray(messages)) continue
    out.push(...(messages.filter(isObject) as TelegramExportMessage[]))
  }
  return out
}

export function countByGroup(items: TelegramNoteItem[]): Record<TelegramNoteGroup, number> {
  return items.reduce(
    (acc, item) => {
      acc[item.group] += 1
      return acc
    },
    { video: 0, link: 0, text: 0, photo: 0, file: 0, other: 0 } as Record<TelegramNoteGroup, number>,
  )
}
