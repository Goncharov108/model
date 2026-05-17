import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  createHermesChatChannelId,
  fetchHermesSessionToken,
  getHermesHttpBase,
  invalidateHermesSessionToken,
} from '../../lib/hermesApi'
import { HERMES_SSH_TUNNEL_HINT } from '../../lib/hermesDashboard'
import { AppButton } from '../../ui/AppButton'
import { SurfaceCard } from '../../ui/SurfaceCard'
import { HermesChatSidePanel } from './HermesChatSidePanel'
import { HermesTerminalChat } from './HermesTerminalChat'

/** Рабочее окно чата: TUI + боковая панель (второй контур рядом с Telegram). */
export function HermesChatWorkspace({ isActive }: { isActive: boolean }) {
  const [token, setToken] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [resumeSessionId, setResumeSessionId] = useState<string | null>(null)
  const [channel, setChannel] = useState(() => createHermesChatChannelId())
  const [reconnectKey, setReconnectKey] = useState(0)

  const loadToken = useCallback(async () => {
    setLoadError(null)
    setToken(null)
    try {
      const t = await fetchHermesSessionToken()
      setToken(t)
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Hermes недоступен')
    }
  }, [])

  useEffect(() => {
    if (!isActive) return
    void loadToken()
  }, [isActive, loadToken, reconnectKey])

  const terminalKey = useMemo(
    () => `${channel}:${resumeSessionId ?? 'new'}:${reconnectKey}`,
    [channel, resumeSessionId, reconnectKey],
  )

  const reconnect = () => {
    invalidateHermesSessionToken()
    setChannel(createHermesChatChannelId())
    setReconnectKey((k) => k + 1)
  }

  const onPickResume = (sessionId: string | null) => {
    setResumeSessionId(sessionId)
    setChannel(createHermesChatChannelId())
  }

  if (loadError) {
    return (
      <SurfaceCard className="space-y-3 text-sm text-zinc-300">
        <p className="text-amber-100">{loadError}</p>
        {import.meta.env.DEV ? (
          <p className="text-xs text-zinc-500">
            Локально: {HERMES_SSH_TUNNEL_HINT}
          </p>
        ) : null}
        <AppButton type="button" variant="ghost" onClick={() => void loadToken()}>
          Повторить
        </AppButton>
      </SurfaceCard>
    )
  }

  if (!token) {
    return (
      <SurfaceCard className="text-sm text-zinc-400" aria-busy="true">
        Подключение к Hermes…
      </SurfaceCard>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <AppButton type="button" variant="ghost" onClick={reconnect}>
          Переподключить
        </AppButton>
        <AppButton
          type="button"
          variant="ghost"
          onClick={() => window.open(`${getHermesHttpBase()}/chat`, '_blank', 'noopener')}
        >
          Открыть в дашборде Hermes
        </AppButton>
        <span className="text-xs text-zinc-500">
          Полный TUI: slash-команды, смена модели, инструменты — как в Telegram-боте.
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
        <HermesChatSidePanel
          token={token}
          channel={channel}
          resumeSessionId={resumeSessionId}
          onPickResume={onPickResume}
        />
        <HermesTerminalChat
          key={terminalKey}
          token={token}
          channel={channel}
          resumeSessionId={resumeSessionId}
          isActive={isActive}
        />
      </div>
    </div>
  )
}
