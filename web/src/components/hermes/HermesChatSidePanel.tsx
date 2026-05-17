import { useEffect, useState } from 'react'
import {
  buildHermesEventsWebSocketUrl,
  formatHermesSessionLabel,
  getHermesSessionId,
  hermesApiFetch,
  type HermesModelInfoResponse,
  type HermesSessionRow,
  type HermesSessionsResponse,
  type HermesStatusResponse,
} from '../../lib/hermesApi'
import { SurfaceCard } from '../../ui/SurfaceCard'

type ToolEvent = {
  id: string
  name: string
  status: 'running' | 'done'
  context?: string
}

type Props = {
  token: string
  channel: string
  resumeSessionId: string | null
  onPickResume: (sessionId: string | null) => void
}

/** Боковая панель: модель, сессии, ход инструментов (как в дашборде Hermes). */
export function HermesChatSidePanel(props: Props) {
  const { token, channel, resumeSessionId, onPickResume } = props
  const [status, setStatus] = useState<HermesStatusResponse | null>(null)
  const [modelInfo, setModelInfo] = useState<HermesModelInfoResponse | null>(null)
  const [sessions, setSessions] = useState<HermesSessionRow[]>([])
  const [tools, setTools] = useState<ToolEvent[]>([])
  const [feedError, setFeedError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const [st, mi, sess] = await Promise.all([
          hermesApiFetch<HermesStatusResponse>('/api/status', token),
          hermesApiFetch<HermesModelInfoResponse>('/api/model/info', token).catch(() => null),
          hermesApiFetch<HermesSessionsResponse>('/api/sessions?limit=15', token).catch(() => ({
            sessions: [],
          })),
        ])
        if (cancelled) return
        setStatus(st)
        setModelInfo(mi)
        setSessions(sess.sessions ?? [])
      } catch (e) {
        if (!cancelled) {
          setFeedError(e instanceof Error ? e.message : 'Не удалось загрузить метаданные')
        }
      }
    }
    void load()
    const timer = window.setInterval(load, 15_000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [token])

  useEffect(() => {
    const ws = new WebSocket(buildHermesEventsWebSocketUrl(token, channel))
    let unmounting = false

    ws.addEventListener('message', (ev) => {
      try {
        const frame = JSON.parse(String(ev.data)) as {
          method?: string
          params?: { type?: string; payload?: Record<string, unknown> }
        }
        if (frame.method !== 'event' || !frame.params) return
        const { type, payload } = frame.params
        if (type === 'tool.start') {
          const p = payload as { tool_id?: string; name?: string; context?: string }
          const toolId = p.tool_id
          if (!toolId) return
          const entry: ToolEvent = {
            id: toolId,
            name: p.name ?? 'tool',
            status: 'running',
            context: p.context,
          }
          setTools((prev) => [...prev, entry].slice(-12))
        }
        if (type === 'tool.end') {
          const p = payload as { tool_id?: string }
          if (!p.tool_id) return
          setTools((prev) =>
            prev.map((t) => (t.id === p.tool_id ? { ...t, status: 'done' as const } : t)),
          )
        }
      } catch {
        /* ignore malformed frames */
      }
    })

    ws.addEventListener('close', () => {
      if (!unmounting) setFeedError('Лента инструментов отключена')
    })

    return () => {
      unmounting = true
      ws.close()
    }
  }, [token, channel])

  return (
    <aside className="flex w-full shrink-0 flex-col gap-3 lg:w-72">
      <SurfaceCard className="space-y-2 text-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Модель</p>
        <p className="text-zinc-100">
          {modelInfo?.model ?? modelInfo?.label ?? '—'}
          {modelInfo?.provider ? (
            <span className="text-zinc-500"> · {modelInfo.provider}</span>
          ) : null}
        </p>
        <p className="text-xs text-zinc-500">
          Hermes {status?.version ?? '—'}
          {status?.gateway?.running ? ' · gateway ✓' : ''}
          {typeof status?.active_sessions === 'number'
            ? ` · активных сессий: ${status.active_sessions}`
            : ''}
        </p>
      </SurfaceCard>

      <SurfaceCard className="space-y-2 text-sm">
        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Продолжить сессию
          <select
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-2 text-sm text-zinc-100"
            value={resumeSessionId ?? ''}
            onChange={(e) => onPickResume(e.target.value || null)}
          >
            <option value="">Новый диалог</option>
            {sessions.map((s) => {
              const sid = getHermesSessionId(s)
              if (!sid) return null
              return (
                <option key={sid} value={sid}>
                  {formatHermesSessionLabel(s)}
                  {s.model ? ` (${s.model})` : ''}
                  {s.source ? ` · ${s.source}` : ''}
                </option>
              )
            })}
          </select>
        </label>
        <p className="text-xs text-zinc-500">
          Смена сессии перезапустит терминал (как «▶» в дашборде Hermes).
        </p>
      </SurfaceCard>

      <SurfaceCard className="flex min-h-0 flex-1 flex-col gap-2 text-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Инструменты (live)
        </p>
        {feedError ? <p className="text-xs text-amber-200/90">{feedError}</p> : null}
        <ul className="max-h-48 space-y-1 overflow-y-auto text-xs text-zinc-300">
          {tools.length === 0 ? (
            <li className="text-zinc-600">Пока нет вызовов — напишите агенту в терминале.</li>
          ) : (
            tools.map((t) => (
              <li key={t.id} className="rounded bg-zinc-900/80 px-2 py-1">
                <span className={t.status === 'running' ? 'text-amber-200' : 'text-emerald-300/90'}>
                  {t.status === 'running' ? '▶' : '✓'}
                </span>{' '}
                {t.name}
                {t.context ? (
                  <span className="block truncate text-zinc-600">{t.context}</span>
                ) : null}
              </li>
            ))
          )}
        </ul>
        <p className="text-xs text-zinc-600">
          В терминале доступны slash-команды Hermes (/model, /help и др.), как в Telegram.
        </p>
      </SurfaceCard>
    </aside>
  )
}
