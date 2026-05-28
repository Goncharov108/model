import type { TelegramNoteItem, TelegramNotesSnapshot } from '../domain/telegramNotes'

type GraphNodeKind = 'source' | 'folder' | 'tag' | 'note'

export interface IncomingGraphNode {
  id: string
  label: string
  kind: GraphNodeKind
  x: number
  y: number
  size: 'lg' | 'md' | 'sm'
  meta?: string
}

export interface IncomingGraphEdge {
  from: string
  to: string
}

export interface IncomingGraphData {
  nodes: IncomingGraphNode[]
  edges: IncomingGraphEdge[]
}

export interface IncomingTimelineBucket {
  label: string
  isoDay: string
  count: number
  highlights: string[]
}

export interface IncomingInsightCard {
  title: string
  value: string
  description: string
}

export interface IncomingClusterCard {
  title: string
  description: string
  bullets: string[]
}

const GENERIC_TAGS = new Set(['video', 'link', 'text', 'photo', 'file', 'other'])

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function shorten(value: string, max = 72): string {
  const text = normalizeText(value)
  if (text.length <= max) return text
  return `${text.slice(0, Math.max(0, max - 1)).trimEnd()}…`
}

function topEntries(map: Map<string, number>, limit: number): Array<[string, number]> {
  return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ru')).slice(0, limit)
}

function topMeaningfulTags(items: TelegramNoteItem[], limit: number): Array<[string, number]> {
  const counts = new Map<string, number>()
  for (const item of items) {
    for (const tag of item.tags) {
      if (GENERIC_TAGS.has(tag)) continue
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }
  return topEntries(counts, limit)
}

function topDomains(items: TelegramNoteItem[], limit: number): Array<[string, number]> {
  const counts = new Map<string, number>()
  for (const item of items) {
    for (const link of item.links) {
      try {
        const domain = new URL(link).hostname.replace(/^www\./, '')
        counts.set(domain, (counts.get(domain) ?? 0) + 1)
      } catch {
        // ignore bad urls
      }
    }
  }
  return topEntries(counts, limit)
}

function scoreItem(item: TelegramNoteItem): number {
  let score = 0
  if (item.priority === 'high') score += 4
  if (item.folder === 'work') score += 3
  if (item.folder === 'ideas') score += 2
  if (item.group === 'video') score += 3
  if (item.links.length > 0) score += 1
  return score
}

function topItems(items: TelegramNoteItem[], limit: number): TelegramNoteItem[] {
  return [...items]
    .sort((a, b) => scoreItem(b) - scoreItem(a) || (a.dateIso < b.dateIso ? 1 : -1))
    .slice(0, limit)
}

export function buildIncomingGraphData(snapshot: TelegramNotesSnapshot | null, items: TelegramNoteItem[]): IncomingGraphData {
  const sourceLabel = snapshot?.sourceName ?? 'Incoming'
  const nodes: IncomingGraphNode[] = [
    { id: 'source', label: sourceLabel, kind: 'source', x: 50, y: 12, size: 'lg', meta: `${items.length} элементов` },
  ]
  const edges: IncomingGraphEdge[] = []

  const folderCounts = new Map<string, number>()
  for (const item of items) {
    folderCounts.set(item.folder, (folderCounts.get(item.folder) ?? 0) + 1)
  }
  const folderOrder = ['ideas', 'work', 'finance', 'media', 'misc']
  const folderLabel: Record<string, string> = {
    ideas: 'Идеи',
    work: 'Работа',
    finance: 'Финансы',
    media: 'Медиа',
    misc: 'Разное',
  }
  const activeFolders = folderOrder.filter((key) => (folderCounts.get(key) ?? 0) > 0)
  activeFolders.forEach((folder, index) => {
    const x = 14 + index * (72 / Math.max(activeFolders.length - 1, 1))
    nodes.push({
      id: `folder:${folder}`,
      label: folderLabel[folder],
      kind: 'folder',
      x,
      y: 38,
      size: 'md',
      meta: `${folderCounts.get(folder) ?? 0}`,
    })
    edges.push({ from: 'source', to: `folder:${folder}` })
  })

  topMeaningfulTags(items, 5).forEach(([tag, count], index) => {
    const x = 16 + index * 17
    nodes.push({ id: `tag:${tag}`, label: `#${tag}`, kind: 'tag', x, y: 66, size: 'sm', meta: `${count}` })
    const relatedFolder = topEntries(
      items
        .filter((item) => item.tags.includes(tag))
        .reduce((acc, item) => acc.set(item.folder, (acc.get(item.folder) ?? 0) + 1), new Map<string, number>()),
      1,
    )[0]?.[0]
    edges.push({ from: relatedFolder ? `folder:${relatedFolder}` : 'source', to: `tag:${tag}` })
  })

  topItems(items, 4).forEach((item, index) => {
    const x = 18 + index * 21
    nodes.push({
      id: `note:${item.id}`,
      label: shorten(item.text || item.links[0] || 'Пустая заметка', 44),
      kind: 'note',
      x,
      y: 88,
      size: 'sm',
      meta: `${item.group} · ${item.folder}`,
    })
    edges.push({ from: `folder:${item.folder}`, to: `note:${item.id}` })
  })

  return { nodes, edges }
}

export function buildIncomingTimeline(items: TelegramNoteItem[]): IncomingTimelineBucket[] {
  const byDay = new Map<string, TelegramNoteItem[]>()
  for (const item of [...items].sort((a, b) => (a.dateIso < b.dateIso ? 1 : -1))) {
    const isoDay = item.dateIso.slice(0, 10)
    const list = byDay.get(isoDay) ?? []
    list.push(item)
    byDay.set(isoDay, list)
  }

  return [...byDay.entries()].slice(0, 6).map(([isoDay, dayItems]) => ({
    isoDay,
    label: new Date(`${isoDay}T00:00:00`).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'long',
    }),
    count: dayItems.length,
    highlights: dayItems.slice(0, 3).map((item) => shorten(item.text || item.links[0] || item.group, 84)),
  }))
}

export function buildIncomingInsights(items: TelegramNoteItem[]): IncomingInsightCard[] {
  const inWork = items.filter((item) => item.state === 'in_work').length
  const backlog = items.filter((item) => item.state === 'inbox').length
  const videos = items.filter((item) => item.group === 'video').length
  const links = items.filter((item) => item.links.length > 0).length
  const work = items.filter((item) => item.folder === 'work').length
  const ideas = items.filter((item) => item.folder === 'ideas').length

  const topTag = topMeaningfulTags(items, 1)[0]
  const topDomain = topDomains(items, 1)[0]

  return [
    {
      title: 'В работе',
      value: `${inWork}`,
      description: backlog > 0 ? `Во входящих ещё ${backlog}` : 'Входящие разобраны',
    },
    {
      title: 'Медиа / видео',
      value: `${videos}`,
      description: links > videos ? `Ссылок: ${links}` : 'Видео уже выделены в отдельный поток',
    },
    {
      title: 'Фокус папок',
      value: work >= ideas ? 'Работа' : 'Идеи',
      description: `Работа: ${work} · Идеи: ${ideas}`,
    },
    {
      title: 'Доминирующий сигнал',
      value: topTag ? `#${topTag[0]}` : '—',
      description: topDomain ? `Частый источник: ${topDomain[0]}` : 'Пока без явного источника',
    },
  ]
}

export function buildIncomingClusters(items: TelegramNoteItem[]): IncomingClusterCard[] {
  const topTags = topMeaningfulTags(items, 4)
  const topSources = topDomains(items, 4)
  const topWorkItems = topItems(items.filter((item) => item.folder === 'work' || item.priority === 'high'), 3)
  const mediaItems = topItems(items.filter((item) => item.group === 'video' || item.group === 'link'), 3)

  return [
    {
      title: 'Темы и кластеры',
      description: 'Что повторяется и может стать сущностями / направлениями.',
      bullets: topTags.length > 0 ? topTags.map(([tag, count]) => `#${tag} · ${count}`) : ['Пока не хватает тегов для устойчивого кластера'],
    },
    {
      title: 'Источники',
      description: 'Какие домены чаще всего приносят входящий поток.',
      bullets: topSources.length > 0 ? topSources.map(([source, count]) => `${source} · ${count}`) : ['Пока нет ссылочных источников'],
    },
    {
      title: 'Требует действия',
      description: 'Самые насыщенные рабочие элементы.',
      bullets: topWorkItems.length > 0 ? topWorkItems.map((item) => shorten(item.text || item.links[0] || item.id)) : ['Нет элементов, требующих действия'],
    },
    {
      title: 'Медиа-очередь',
      description: 'Что стоит разбирать как видео / контент / внешние ссылки.',
      bullets: mediaItems.length > 0 ? mediaItems.map((item) => shorten(item.text || item.links[0] || item.id)) : ['Нет медиа-очереди'],
    },
  ]
}

export function createHermesVideoSeedSnapshot(): TelegramNotesSnapshot {
  const importedAtIso = '2026-05-28T21:40:00.000Z'
  const items: TelegramNoteItem[] = [
    {
      id: 'seed-video-main',
      dateIso: '2026-05-28T21:20:00.000Z',
      text: 'Видео: 100 hours of Hermes Agent lessons in 23 minutes. Главная мысль: Hermes нужно использовать не как чат-бота, а как персонального агентного ассистента с памятью, фоновыми задачами, cron и интеграциями.',
      group: 'video',
      links: ['https://youtu.be/k5NhsF7t68M'],
      hasPhoto: false,
      hasFile: false,
      rawType: 'seed',
      tags: ['video', 'youtube', 'hermes', 'memory', 'automation'],
      priority: 'normal',
      state: 'inbox',
      dedupeKey: 'seed-video-main',
      folder: 'media',
    },
    {
      id: 'seed-video-memory',
      dateIso: '2026-05-28T21:21:00.000Z',
      text: 'Тезис: сила Hermes — в памяти. Нужно задавать личный контекст, подключать Obsidian, заметки, встречи и email, чтобы агент отвечал из реальных данных.',
      group: 'text',
      links: [],
      hasPhoto: false,
      hasFile: false,
      rawType: 'seed',
      tags: ['text', 'hermes', 'memory', 'obsidian', 'knowledge-base'],
      priority: 'high',
      state: 'in_work',
      dedupeKey: 'seed-video-memory',
      folder: 'work',
    },
    {
      id: 'seed-video-cron',
      dateIso: '2026-05-28T21:22:00.000Z',
      text: 'Тезис: cron и background tasks — один из главных рычагов. Hermes стоит использовать как ассистента, который сам присылает утренние brief, reminders и ведёт параллельные задачи.',
      group: 'text',
      links: [],
      hasPhoto: false,
      hasFile: false,
      rawType: 'seed',
      tags: ['text', 'hermes', 'cron', 'automation', 'assistant'],
      priority: 'high',
      state: 'in_work',
      dedupeKey: 'seed-video-cron',
      folder: 'work',
    },
    {
      id: 'seed-video-goals',
      dateIso: '2026-05-28T21:23:00.000Z',
      text: 'Тезис: длинные задачи нужно оформлять как goal / super goal — с конкретным результатом, разбивкой на этапы и понятным handshake между человеком и агентом.',
      group: 'text',
      links: [],
      hasPhoto: false,
      hasFile: false,
      rawType: 'seed',
      tags: ['text', 'goal', 'planning', 'workflow', 'hermes'],
      priority: 'high',
      state: 'inbox',
      dedupeKey: 'seed-video-goals',
      folder: 'ideas',
    },
    {
      id: 'seed-video-models',
      dateIso: '2026-05-28T21:24:00.000Z',
      text: 'Тезис: под разные задачи нужны разные модели. Для кода, ресёрча, мультимодальности и длинного контекста стоит осознанно выбирать разные движки и делегировать между ними.',
      group: 'text',
      links: [],
      hasPhoto: false,
      hasFile: false,
      rawType: 'seed',
      tags: ['text', 'models', 'delegation', 'research', 'multimodal'],
      priority: 'normal',
      state: 'inbox',
      dedupeKey: 'seed-video-models',
      folder: 'ideas',
    },
    {
      id: 'seed-video-actions',
      dateIso: '2026-05-28T21:25:00.000Z',
      text: 'Практические действия из видео: 1) оформить личный контекст, 2) подключить vault/заметки, 3) завести полезный cron, 4) сделать goal-шаблоны, 5) хранить бэкап конфигурации и состояний.',
      group: 'text',
      links: [],
      hasPhoto: false,
      hasFile: false,
      rawType: 'seed',
      tags: ['text', 'todo', 'setup', 'obsidian', 'cron'],
      priority: 'high',
      state: 'in_work',
      dedupeKey: 'seed-video-actions',
      folder: 'work',
    },
  ]

  return {
    importedAtIso,
    sourceName: 'Hermes video seed · 100 hours lessons',
    totalMessages: items.length,
    dedupedCount: 0,
    items,
  }
}
