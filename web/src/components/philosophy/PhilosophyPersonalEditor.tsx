import type { JSX } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  loadPrivatePhilosophyFromDisk,
  savePrivatePhilosophyToDisk,
} from '../../lib/privatePhilosophyApi'
import { PRIVATE_PHILOSOPHY_RELATIVE_PATH } from '../../lib/privatePhilosophyPaths'
import { readTextFile } from '../../lib/readTextFile'
import { usePhilosophyOwnerStore } from '../../store/philosophyOwnerStore'
import { AppButton } from '../../ui/AppButton'
import { SurfaceCard } from '../../ui/SurfaceCard'

const textareaClass =
  'min-h-[min(40vh,22rem)] w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950/80 px-3 py-2 font-mono text-sm leading-relaxed text-zinc-100 focus:border-fuchsia-500/50 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/25'

/** Редактор личного текста private/PHILOSOPHY_OWNER.txt. */
export function PhilosophyPersonalEditor(): JSX.Element {
  const bodyText = usePhilosophyOwnerStore((s) => s.bodyText)
  const setBodyText = usePhilosophyOwnerStore((s) => s.setBodyText)
  const lastDiskSyncAt = usePhilosophyOwnerStore((s) => s.lastDiskSyncAt)
  const setLastDiskSyncAt = usePhilosophyOwnerStore((s) => s.setLastDiskSyncAt)

  const [status, setStatus] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const loadedOnce = useRef(false)

  const onLoadDisk = useCallback(async () => {
    setStatus(null)
    const res = await loadPrivatePhilosophyFromDisk()
    if (!res.ok) {
      setStatus(res.message)
      return
    }
    setBodyText(res.text)
    setLastDiskSyncAt(new Date().toISOString())
    setStatus('Загружено с диска')
  }, [setBodyText, setLastDiskSyncAt])

  useEffect(() => {
    if (loadedOnce.current) return
    loadedOnce.current = true
    void onLoadDisk()
  }, [onLoadDisk])

  async function onSaveDisk() {
    setStatus(null)
    const res = await savePrivatePhilosophyToDisk(bodyText)
    if (!res.ok) {
      setStatus(res.message)
      return
    }
    setLastDiskSyncAt(new Date().toISOString())
    setStatus('Сохранено на диск')
  }

  function onDownloadTxt() {
    const blob = new Blob([bodyText], { type: 'text/plain;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'PHILOSOPHY_OWNER.txt'
    a.click()
    URL.revokeObjectURL(a.href)
    setStatus('Скачан .txt')
  }

  async function onFilePicked(file: File) {
    setBodyText(await readTextFile(file))
    setStatus(`Импорт: ${file.name}`)
  }

  return (
    <div className="flex flex-col gap-4">
      <SurfaceCard title="Мой текст (не в Git)">
        <p className="text-sm text-zinc-400">
          <code className="rounded bg-zinc-900 px-1 text-xs text-fuchsia-200/90">
            {PRIVATE_PHILOSOPHY_RELATIVE_PATH}
          </code>
          — сокровенное и психология. Синхронизация с диском при локальном{' '}
          <code className="rounded bg-zinc-900 px-1 text-xs">npm run dev</code>.
        </p>
        {lastDiskSyncAt ? (
          <p className="mt-2 text-xs text-zinc-500">
            Диск: {new Date(lastDiskSyncAt).toLocaleString('ru-RU')}
          </p>
        ) : null}
        {status ? <p className="mt-2 text-sm text-fuchsia-200/90">{status}</p> : null}
      </SurfaceCard>

      <div className="flex flex-wrap gap-2">
        <AppButton type="button" onClick={() => void onLoadDisk()}>
          С диска
        </AppButton>
        <AppButton type="button" onClick={() => void onSaveDisk()}>
          На диск
        </AppButton>
        <AppButton type="button" variant="ghost" onClick={onDownloadTxt}>
          Скачать .txt
        </AppButton>
        <AppButton type="button" variant="ghost" onClick={() => fileInputRef.current?.click()}>
          Загрузить .txt
        </AppButton>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,text/plain"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void onFilePicked(f)
            e.target.value = ''
          }}
        />
      </div>

      <label className="flex flex-col gap-2 text-sm text-zinc-400">
        Твой конспект
        <textarea
          className={textareaClass}
          value={bodyText}
          onChange={(e) => setBodyText(e.target.value)}
          placeholder="Принципы, инсайты из чата с Философом, то что не для Git…"
          spellCheck
        />
      </label>
    </div>
  )
}
