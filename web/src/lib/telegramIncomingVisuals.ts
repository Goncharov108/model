import type {
  TelegramIncomingEntityKind,
  TelegramIncomingEntityLink,
  TelegramIncomingEntityRelation,
  TelegramNoteItem,
  TelegramNotesSnapshot,
} from '../domain/telegramNotes'

type GraphNodeKind = 'source' | 'folder' | 'tag' | 'entity_group' | 'entity' | 'note'

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

export interface IncomingEntityCard {
  id: string
  label: string
  kind: TelegramIncomingEntityKind
  mentions: number
  noteIds: string[]
  summary: string
  signals: string[]
}

export interface IncomingEntityMap {
  entities: IncomingEntityCard[]
  noteLinks: TelegramIncomingEntityLink[]
  relations: TelegramIncomingEntityRelation[]
}

const GENERIC_TAGS = new Set(['video', 'link', 'text', 'photo', 'file', 'other'])
const STOP_TAGS = new Set(['youtube', 'seed'])
const PERSON_HINTS = new Set(['person', 'people', 'founder', 'author', 'speaker'])
const PROJECT_HINTS = new Set(['hermes', 'obsidian', 'telegram', 'github', 'model', 'project', 'repo', 'vault'])
const IDEA_HINTS = new Set([
  'memory',
  'automation',
  'workflow',
  'delegation',
  'research',
  'multimodal',
  'knowledge-base',
  'assistant',
])
const TASK_HINTS = new Set(['setup', 'todo', 'plan', 'planning', 'goal', 'cron', 'backup', 'reminder'])

const ENTITY_KIND_LABEL: Record<TelegramIncomingEntityKind, string> = {
  person: 'Люди',
  project: 'Проекты',
  idea: 'Идеи',
  task: 'Задачи',
}

const ENTITY_KIND_ORDER: TelegramIncomingEntityKind[] = ['person', 'project', 'idea', 'task']

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

function titleCaseToken(value: string): string {
  if (!value) return value
  return value.charAt(0).toLocaleUpperCase('ru-RU') + value.slice(1)
}

function slugify(value: string): string {
  return value
    .toLocaleLowerCase('ru-RU')
    .replace(/[^a-zа-я0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
}

function inferEntityKind(label: string, note: TelegramNoteItem): TelegramIncomingEntityKind {
  const normalized = label.toLocaleLowerCase('ru-RU')
  if (PERSON_HINTS.has(normalized)) return 'person'
  if (TASK_HINTS.has(normalized)) return 'task'
  if (PROJECT_HINTS.has(normalized)) return 'project'
  if (IDEA_HINTS.has(normalized)) return 'idea'

  if (note.folder === 'work' && (normalized.includes('goal') || normalized.includes('todo') || normalized.includes('cron'))) return 'task'
  if (note.folder === 'ideas') return 'idea'
  if (note.group === 'video' || note.group === 'link') return 'project'
  return 'idea'
}

function relationFromKind(kind: TelegramIncomingEntityKind): TelegramIncomingEntityLink['relation'] {
  if (kind === 'task') return 'drives'
  if (kind === 'project') return 'supports'
  return 'mentions'
}

function relationBetweenKinds(
  fromKind: TelegramIncomingEntityKind,
  toKind: TelegramIncomingEntityKind,
): TelegramIncomingEntityRelation['relation'] {
  if (fromKind === 'task' && (toKind === 'project' || toKind === 'idea')) return 'depends_on'
  if (fromKind === 'project' && toKind === 'idea') return 'supports'
  if (fromKind === 'idea' && toKind === 'task') return 'drives'
  return 'mentions'
}

function extractPersonCandidates(text: string): string[] {
  const matches = text.match(/\b[А-ЯЁ][а-яё]{2,}(?:\s+[А-ЯЁ][а-яё]{2,})?\b/g) ?? []
  return matches.filter((candidate) => !['Видео', 'Тезис', 'Главная', 'Практические'].includes(candidate))
}

function collectEntitySignals(note: TelegramNoteItem): Array<{ label: string; kind: TelegramIncomingEntityKind }> {
  const signals = new Map<string, TelegramIncomingEntityKind>()

  for (const rawTag of note.tags) {
    const tag = rawTag.trim()
    if (!tag || GENERIC_TAGS.has(tag) || STOP_TAGS.has(tag)) continue
    const normalized = tag.toLocaleLowerCase('ru-RU')
    signals.set(titleCaseToken(tag), inferEntityKind(normalized, note))
  }

  for (const person of extractPersonCandidates(note.text)) {
    signals.set(person, 'person')
  }

  for (const link of note.links) {
    try {
      const host = new URL(link).hostname.replace(/^www\./, '')
      const root = host.split('.')[0] ?? host
      if (!root) continue
      signals.set(titleCaseToken(root), 'project')
    } catch {
      // ignore bad urls
    }
  }

  if (/\b(сделать|подключить|оформить|завести|хранить|проверить)\b/ui.test(note.text)) {
    const candidate = shorten(note.text, 44)
    signals.set(candidate, 'task')
  }

  if (/\b(идея|мысль|тезис)\b/ui.test(note.text) && note.folder !== 'work') {
    signals.set(shorten(note.text, 44), 'idea')
  }

  return [...signals.entries()].map(([label, kind]) => ({ label, kind }))
}

export function buildIncomingEntityMap(items: TelegramNoteItem[]): IncomingEntityMap {
  const entities = new Map<string, IncomingEntityCard>()
  const noteLinks: TelegramIncomingEntityLink[] = []
  const relationStrength = new Map<string, TelegramIncomingEntityRelation>()

  for (const note of items) {
    const signals = collectEntitySignals(note)
    const noteEntityIds: string[] = []

    for (const signal of signals) {
      const id = `${signal.kind}:${slugify(signal.label)}`
      const existing = entities.get(id)
      if (existing) {
        existing.mentions += 1
        if (!existing.noteIds.includes(note.id)) existing.noteIds.push(note.id)
        if (!existing.signals.includes(signal.label)) existing.signals.push(signal.label)
      } else {
        entities.set(id, {
          id,
          label: signal.label,
          kind: signal.kind,
          mentions: 1,
          noteIds: [note.id],
          summary: shorten(note.text || note.links[0] || signal.label, 96),
          signals: [signal.label],
        })
      }
      noteEntityIds.push(id)
      noteLinks.push({
        entityId: id,
        noteId: note.id,
        relation: relationFromKind(signal.kind),
        strength: note.priority === 'high' ? 2 : 1,
      })
    }

    const uniqueEntityIds = [...new Set(noteEntityIds)]
    for (let i = 0; i < uniqueEntityIds.length; i += 1) {
      for (let j = i + 1; j < uniqueEntityIds.length; j += 1) {
        const leftId = uniqueEntityIds[i]!
        const rightId = uniqueEntityIds[j]!
        const left = entities.get(leftId)
        const right = entities.get(rightId)
        if (!left || !right) continue

        const pairKey = [leftId, rightId].sort().join('::')
        const current = relationStrength.get(pairKey)
        if (current) {
          current.strength += 1
          continue
        }

        relationStrength.set(pairKey, {
          fromEntityId: leftId,
          toEntityId: rightId,
          relation: relationBetweenKinds(left.kind, right.kind),
          strength: 1,
        })
      }
    }
  }

  return {
    entities: [...entities.values()].sort((a, b) => b.mentions - a.mentions || a.label.localeCompare(b.label, 'ru')),
    noteLinks,
    relations: [...relationStrength.values()].sort((a, b) => b.strength - a.strength),
  }
}

export function buildIncomingGraphData(snapshot: TelegramNotesSnapshot | null, items: TelegramNoteItem[]): IncomingGraphData {
  const sourceLabel = snapshot?.sourceName ?? 'Incoming'
  const entityMap = buildIncomingEntityMap(items)
  const nodes: IncomingGraphNode[] = [
    { id: 'source', label: sourceLabel, kind: 'source', x: 50, y: 10, size: 'lg', meta: `${items.length} элементов` },
  ]
  const edges: IncomingGraphEdge[] = []

  const groupPositions: Record<TelegramIncomingEntityKind, { x: number; y: number }> = {
    person: { x: 18, y: 32 },
    project: { x: 39, y: 32 },
    idea: { x: 61, y: 32 },
    task: { x: 82, y: 32 },
  }

  ENTITY_KIND_ORDER.forEach((kind) => {
    const count = entityMap.entities.filter((entity) => entity.kind === kind).length
    if (count === 0) return
    nodes.push({
      id: `entity-group:${kind}`,
      label: ENTITY_KIND_LABEL[kind],
      kind: 'entity_group',
      x: groupPositions[kind].x,
      y: groupPositions[kind].y,
      size: 'md',
      meta: `${count}`,
    })
    edges.push({ from: 'source', to: `entity-group:${kind}` })
  })

  entityMap.entities.slice(0, 8).forEach((entity, index) => {
    const bucket = entityMap.entities.filter((item) => item.kind === entity.kind)
    const bucketIndex = bucket.findIndex((item) => item.id === entity.id)
    const spread = Math.max(bucket.length - 1, 1)
    const base = groupPositions[entity.kind]
    const x = bucket.length === 1 ? base.x : base.x - 8 + (bucketIndex * 16) / spread
    const y = 52 + (index % 2) * 10

    nodes.push({
      id: `entity:${entity.id}`,
      label: entity.label,
      kind: 'entity',
      x,
      y,
      size: entity.mentions > 1 ? 'md' : 'sm',
      meta: `${entity.mentions} упоминаний`,
    })
    edges.push({ from: `entity-group:${entity.kind}`, to: `entity:${entity.id}` })
  })

  topItems(items, 5).forEach((item, index) => {
    const x = 16 + index * 17
    nodes.push({
      id: `note:${item.id}`,
      label: shorten(item.text || item.links[0] || 'Пустая заметка', 44),
      kind: 'note',
      x,
      y: 84,
      size: 'sm',
      meta: `${item.group} · ${item.folder}`,
    })

    const noteEntityLinks = entityMap.noteLinks.filter((link) => link.noteId === item.id)
    if (noteEntityLinks.length > 0) {
      noteEntityLinks.slice(0, 2).forEach((link) => {
        edges.push({ from: `entity:${link.entityId}`, to: `note:${item.id}` })
      })
    } else {
      edges.push({ from: 'source', to: `note:${item.id}` })
    }
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

  const entityMap = buildIncomingEntityMap(items)

  return [...byDay.entries()].slice(0, 6).map(([isoDay, dayItems]) => {
    const dayEntityIds = new Set(
      entityMap.noteLinks.filter((link) => dayItems.some((item) => item.id === link.noteId)).map((link) => link.entityId),
    )

    return {
      isoDay,
      label: new Date(`${isoDay}T00:00:00`).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'long',
      }),
      count: dayItems.length,
      highlights: [
        ...dayItems.slice(0, 2).map((item) => shorten(item.text || item.links[0] || item.group, 84)),
        ...(dayEntityIds.size > 0
          ? [
              `Сущности дня: ${[...dayEntityIds]
                .slice(0, 3)
                .map((entityId) => entityMap.entities.find((entity) => entity.id === entityId)?.label)
                .filter(Boolean)
                .join(' · ')}`,
            ]
          : []),
      ].slice(0, 3),
    }
  })
}

export function buildIncomingInsights(items: TelegramNoteItem[]): IncomingInsightCard[] {
  const entityMap = buildIncomingEntityMap(items)
  const inWork = items.filter((item) => item.state === 'in_work').length
  const backlog = items.filter((item) => item.state === 'inbox').length
  const tasks = entityMap.entities.filter((entity) => entity.kind === 'task').length
  const projects = entityMap.entities.filter((entity) => entity.kind === 'project').length
  const ideas = entityMap.entities.filter((entity) => entity.kind === 'idea').length
  const topTag = topMeaningfulTags(items, 1)[0]
  const topDomain = topDomains(items, 1)[0]

  return [
    {
      title: 'В работе',
      value: `${inWork}`,
      description: backlog > 0 ? `Во входящих ещё ${backlog}` : 'Входящие разобраны',
    },
    {
      title: 'Проекты / задачи',
      value: `${projects} / ${tasks}`,
      description: tasks > 0 ? 'Выделены как отдельный слой над заметками' : 'Пока слой задач почти пустой',
    },
    {
      title: 'Идейный слой',
      value: `${ideas}`,
      description: topTag ? `Чаще всего сигналит тег #${topTag[0]}` : 'Теги пока не дали устойчивый сигнал',
    },
    {
      title: 'Доминирующий источник',
      value: topDomain ? topDomain[0] : '—',
      description: topDomain ? `Ссылок с этого домена: ${topDomain[1]}` : 'Пока без внешних доменов',
    },
  ]
}

export function buildIncomingClusters(items: TelegramNoteItem[]): IncomingClusterCard[] {
  const entityMap = buildIncomingEntityMap(items)
  const topTags = topMeaningfulTags(items, 4)
  const topSources = topDomains(items, 4)
  const topTasks = entityMap.entities.filter((entity) => entity.kind === 'task').slice(0, 4)
  const topProjects = entityMap.entities.filter((entity) => entity.kind === 'project').slice(0, 4)

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
      title: 'Жёсткий слой задач',
      description: 'Что уже можно читать не как шум, а как отдельные action-единицы.',
      bullets: topTasks.length > 0 ? topTasks.map((task) => `${task.label} · ${task.mentions}`) : ['Пока не найдено устойчивых задач'],
    },
    {
      title: 'Опорные проекты',
      description: 'Какие проекты/системы уже доминируют в потоке.',
      bullets: topProjects.length > 0 ? topProjects.map((project) => `${project.label} · ${project.mentions}`) : ['Пока не найдено устойчивых проектов'],
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
