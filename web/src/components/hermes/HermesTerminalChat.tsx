import { FitAddon } from '@xterm/addon-fit'
import { Unicode11Addon } from '@xterm/addon-unicode11'
import { WebLinksAddon } from '@xterm/addon-web-links'
import { WebglAddon } from '@xterm/addon-webgl'
import { Terminal } from '@xterm/xterm'
import '@xterm/xterm/css/xterm.css'
import { useEffect, useRef, useState } from 'react'
import {
  buildHermesPtyWebSocketUrl,
  encodeHermesPtyResize,
} from '../../lib/hermesApi'

const TERMINAL_THEME = {
  background: '#0d2626',
  foreground: '#f0e6d2',
  cursor: '#f0e6d2',
  cursorAccent: '#0d2626',
  selectionBackground: '#f0e6d244',
}

type Props = {
  token: string
  channel: string
  resumeSessionId?: string | null
  isActive: boolean
}

/** Встроенный терминал Hermes TUI (WebSocket → /api/pty). */
export function HermesTerminalChat(props: Props) {
  const { token, channel, resumeSessionId, isActive } = props
  const hostRef = useRef<HTMLDivElement | null>(null)
  const termRef = useRef<Terminal | null>(null)
  const fitRef = useRef<FitAddon | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const [banner, setBanner] = useState<string | null>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host || !token) return

    setBanner(null)
    const term = new Terminal({
      cursorBlink: true,
      fontSize: 13,
      lineHeight: 1.12,
      fontFamily: '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace',
      theme: TERMINAL_THEME,
      allowProposedApi: true,
    })
    const fit = new FitAddon()
    const unicode11 = new Unicode11Addon()
    term.loadAddon(fit)
    term.loadAddon(unicode11)
    term.loadAddon(new WebLinksAddon())
    try {
      term.loadAddon(new WebglAddon())
    } catch {
      /* canvas fallback */
    }
    term.open(host)
    term.unicode.activeVersion = '11'
    termRef.current = term
    fitRef.current = fit

    const wsUrl = buildHermesPtyWebSocketUrl(token, channel, resumeSessionId)
    const ws = new WebSocket(wsUrl)
    ws.binaryType = 'arraybuffer'
    wsRef.current = ws

    const fitAndResize = () => {
      if (!isActive) return
      fit.fit()
      const { cols, rows } = term
      if (cols > 0 && rows > 0 && ws.readyState === WebSocket.OPEN) {
        ws.send(encodeHermesPtyResize(cols, rows))
      }
    }

    ws.addEventListener('open', () => {
      fitAndResize()
    })

    ws.addEventListener('message', (ev) => {
      if (ev.data instanceof ArrayBuffer) {
        term.write(new Uint8Array(ev.data))
      } else if (typeof ev.data === 'string') {
        term.write(ev.data)
      }
    })

    ws.addEventListener('close', (ev) => {
      if (ev.code === 4401) {
        setBanner('Сессия Hermes истекла — обновите страницу.')
      } else if (ev.code !== 1000) {
        setBanner(`Соединение закрыто (код ${ev.code}). Нажмите «Переподключить».`)
      }
    })

    ws.addEventListener('error', () => {
      setBanner('Ошибка WebSocket. Проверьте nginx /hermes/ и что dashboard запущен с --tui.')
    })

    term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data)
      }
    })

    term.onResize(({ cols, rows }) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(encodeHermesPtyResize(cols, rows))
      }
    })

    const ro = new ResizeObserver(() => fitAndResize())
    ro.observe(host)

    return () => {
      ro.disconnect()
      ws.close()
      wsRef.current = null
      term.dispose()
      termRef.current = null
      fitRef.current = null
    }
  }, [token, channel, resumeSessionId, isActive])

  useEffect(() => {
    if (!isActive) return
    const fit = fitRef.current
    const term = termRef.current
    const ws = wsRef.current
    if (!fit || !term) return
    requestAnimationFrame(() => {
      fit.fit()
      const { cols, rows } = term
      if (cols > 0 && rows > 0 && ws?.readyState === WebSocket.OPEN) {
        ws.send(encodeHermesPtyResize(cols, rows))
      }
    })
  }, [isActive])

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
      {banner ? (
        <p className="rounded-lg border border-amber-800/50 bg-amber-950/40 px-3 py-2 text-sm text-amber-100">
          {banner}
        </p>
      ) : null}
      <div
        ref={hostRef}
        className="min-h-[min(60vh,640px)] flex-1 overflow-hidden rounded-xl border border-zinc-700/80 bg-[#0d2626] p-1"
      />
    </div>
  )
}
