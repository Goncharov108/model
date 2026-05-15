import { useState, type DragEvent } from 'react'
import { readImageAsDataUrl } from '../../lib/readImageAsDataUrl'
import { AppButton } from '../../ui/AppButton'

/** Зона перетаскивания фото профиля. */
export function PhotoDropZone(props: {
  photoDataUrl: string | null
  onPhotoChange: (dataUrl: string | null) => void
}) {
  const { photoDataUrl, onPhotoChange } = props
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function applyFile(file: File | undefined) {
    if (!file) return
    try {
      const dataUrl = await readImageAsDataUrl(file)
      onPhotoChange(dataUrl)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки')
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    setDragOver(false)
    void applyFile(e.dataTransfer.files[0])
  }

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`flex min-h-[140px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 py-6 transition ${
          dragOver
            ? 'border-violet-400 bg-violet-500/10'
            : 'border-zinc-700 bg-zinc-950/50 hover:border-zinc-600'
        }`}
      >
        {photoDataUrl ? (
          <img
            src={photoDataUrl}
            alt="Фото профиля"
            className="max-h-28 max-w-full rounded-lg object-contain"
          />
        ) : (
          <p className="text-center text-sm text-zinc-400">
            Перетащите изображение сюда
            <br />
            <span className="text-xs text-zinc-600">или выберите файл (до 2 МБ)</span>
          </p>
        )}
        <label className="cursor-pointer">
          <span className="sr-only">Выбрать фото</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void applyFile(e.target.files?.[0])}
          />
          <span className="inline-flex min-h-10 items-center rounded-lg border border-zinc-600/90 bg-zinc-900/90 px-3 py-2 text-sm font-medium text-zinc-50">
            Выбрать файл
          </span>
        </label>
      </div>
      {photoDataUrl ? (
        <AppButton type="button" variant="ghost" onClick={() => onPhotoChange(null)}>
          Удалить фото
        </AppButton>
      ) : null}
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
    </div>
  )
}
