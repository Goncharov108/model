import { useId, useRef, useState } from 'react'
import { ThemeBlockAnchors } from '../components/analysis/ThemeBlockAnchors'
import { countWords } from '../analysis/text/countWords'
import bundledCanonProjectMasterV1 from '../data/canonProjectMasterExternalAnalysis.v1.json'
import bundledCanonSecondaryV1 from '../data/canonSecondaryExternalAnalysis.v1.json'
import { downloadJson } from '../lib/downloadJson'
import { readTextFile } from '../lib/readTextFile'
import { buildWorkspaceBrowserSnapshot } from '../lib/workspaceBrowserSnapshot'
import { formatInt } from '../lib/formatInt'
import { useAnalysisSessionStore } from '../store/analysisSessionStore'
import { useStreamWorkspaceStore } from '../store/streamWorkspaceStore'
import { AppButton } from '../ui/AppButton'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { SurfaceCard } from '../ui/SurfaceCard'

const JSON_PLACEHOLDER = `{
  "version": 1,
  "generatedAt": "2026-05-15T12:00:00.000Z",
  "modelHint": "опционально",
  "summary": "Краткое резюме глубокого анализа",
  "themes": [
    { "id": "t1", "title": "Тема", "rationale": "Почему важно", "relatedBlockIndices": [0] }
  ],
  "tensions": ["противоречие или напряжение"],
  "hypotheses": ["гипотеза для проверки"]
}`

const OVERVIEW_CARDS = [
  {
    title: 'Мастер-текст',
    description:
      'Персистентность в браузере (localStorage). Один конвейер анализа для вставки, загрузки .txt и будущего импорта из private/USER_PRIVATE_TEXT.txt.',
  },
  {
    title: 'Локальный слой',
    description:
      'Быстрые метрики, абзацы, ключевые слова. Глубокий смысловой слой — через JSON от самой сильной модели/агента.',
  },
  {
    title: 'Исследование',
    description:
      'Экспорт снимка JSON, ручная корректировка текстов и последующее углубление по блокам.',
  },
] as const

/** Главный экран: текст, файлы, локальный и внешний анализ, экспорт. */
export function StreamWorkspace() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const fileInputId = useId()
  const masterRawText = useStreamWorkspaceStore((s) => s.masterRawText)
  const setMasterRawText = useStreamWorkspaceStore((s) => s.setMasterRawText)
  const local = useAnalysisSessionStore((s) => s.local)
  const external = useAnalysisSessionStore((s) => s.external)
  const importError = useAnalysisSessionStore((s) => s.importError)
  const runLocal = useAnalysisSessionStore((s) => s.runLocal)
  const applyExternalJson = useAnalysisSessionStore((s) => s.applyExternalJson)
  const clear = useAnalysisSessionStore((s) => s.clear)
  const exportSnapshot = useAnalysisSessionStore((s) => s.exportSnapshot)
  const setImportError = useAnalysisSessionStore((s) => s.setImportError)

  const [jsonDraft, setJsonDraft] = useState('')
  const [clearAnalysisOpen, setClearAnalysisOpen] = useState(false)

  async function onPickFile(fileList: FileList | null) {
    const file = fileList?.[0]
    if (!file) return
    try {
      const text = await readTextFile(file)
      setMasterRawText(text)
      setImportError(null)
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'Не удалось прочитать файл')
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <ConfirmDialog
        open={clearAnalysisOpen}
        title="Сбросить анализ?"
        description="Локальный и внешний слой анализа будут очищены в этом браузере. Текст в поле «Поток» не удаляется."
        confirmLabel="Сбросить"
        confirmVariant="danger"
        onCancel={() => setClearAnalysisOpen(false)}
        onConfirm={() => {
          clear()
          setImportError(null)
        }}
      />
      <header className="space-y-3 border-b border-zinc-800 pb-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-300/90">
          Локальное рабочее место
        </p>
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
          Структурирование потока сознания
        </h1>
        <p className="max-w-2xl text-pretty text-sm leading-relaxed text-zinc-400 sm:text-base">
          Вставь фундаментальный текст или загрузь файл — локальный анализ разложит поток на блоки и
          метрики. JSON глубокого разбора от модели/агента можно импортировать отдельным слоем для
          дальнейшей корректировки.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        {OVERVIEW_CARDS.map((card) => (
          <SurfaceCard key={card.title} title={card.title} description={card.description} />
        ))}
      </section>

      <SurfaceCard
        title="Тексты канона в репозитории model"
        description="Файлы в корне рядом с web/: CANON_SECONDARY_MASTER.txt (канон-2), CANON_PROJECT_MASTER.txt (канон-3), SWOD_ZAKONOV.txt — свод законов. Открой их в IDE; в этот экран текст попадает только вручную — вставка или загрузка .txt."
      />

      <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-zinc-200">Источник текста</h2>
          <div className="flex flex-wrap gap-2">
            <AppButton variant="ghost" type="button" onClick={() => fileInputRef.current?.click()}>
              Загрузить .txt
            </AppButton>
            <input
              ref={fileInputRef}
              id={fileInputId}
              type="file"
              accept=".txt,text/plain"
              className="hidden"
              onChange={(e) => void onPickFile(e.target.files)}
            />
            <AppButton
              type="button"
              onClick={() => runLocal(masterRawText)}
              disabled={!masterRawText.trim()}
            >
              Локальный анализ
            </AppButton>
            <AppButton type="button" variant="ghost" onClick={() => setClearAnalysisOpen(true)}>
              Сбросить анализ…
            </AppButton>
            <AppButton
              type="button"
              variant="ghost"
              onClick={() => exportSnapshot(masterRawText)}
              disabled={!local && !external}
            >
              Экспорт JSON
            </AppButton>
            <AppButton
              type="button"
              variant="ghost"
              onClick={() =>
                downloadJson(`workspace-browser-${Date.now()}.json`, buildWorkspaceBrowserSnapshot())
              }
            >
              Снимок браузера
            </AppButton>
          </div>
        </div>
        <textarea
          value={masterRawText}
          onChange={(e) => setMasterRawText(e.target.value)}
          spellCheck={false}
          placeholder="Вставь сюда поток сознания или загрузь .txt — тот же пайплайн применится к private/USER_PRIVATE_TEXT.txt, когда скопируешь его сюда."
          className="min-h-[220px] w-full resize-y rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 text-sm leading-relaxed text-zinc-100 outline-none ring-violet-500/0 transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/30"
        />
        <p className="text-xs text-zinc-500">
          символов: {formatInt(masterRawText.length)} · слов (оценка):{' '}
          {formatInt(countWords(masterRawText))}
        </p>
        {importError ? (
          <p className="rounded-lg border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-200">
            {importError}
          </p>
        ) : null}
      </section>

      {local ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-zinc-200">Локальные структуры</h2>
              <p className="text-xs text-zinc-500">Сгенерировано: {local.generatedAt}</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SurfaceCard title="Символы" className="!p-4">
              <p className="mt-3 text-2xl font-semibold text-zinc-50">
                {formatInt(local.metrics.characters)}
              </p>
            </SurfaceCard>
            <SurfaceCard title="Слова" className="!p-4">
              <p className="mt-3 text-2xl font-semibold text-zinc-50">
                {formatInt(local.metrics.words)}
              </p>
            </SurfaceCard>
            <SurfaceCard title="Предложения" className="!p-4">
              <p className="mt-3 text-2xl font-semibold text-zinc-50">
                {formatInt(local.metrics.sentences)}
              </p>
            </SurfaceCard>
            <SurfaceCard title="Лексическое разнообразие" className="!p-4">
              <p className="mt-3 text-2xl font-semibold text-zinc-50">
                {local.metrics.lexicalDiversity.toFixed(2)}
              </p>
            </SurfaceCard>
          </div>

          <SurfaceCard title="Ключевые слова (эвристика)" description="Частоты без стоп-слов.">
            <div className="mt-4 flex flex-wrap gap-2">
              {local.keywords.map((kw) => (
                <span
                  key={kw.word}
                  className="rounded-full bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-100 ring-1 ring-violet-500/25"
                >
                  {kw.word}
                  <span className="ml-1 text-violet-300/80">×{kw.score}</span>
                </span>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard
            title="Блоки потока"
            description="Разбиение по пустым строкам; каждый блок можно исследовать отдельно."
          >
            <ul className="mt-4 space-y-3">
              {local.blocks.map((block) => (
                <li
                  key={block.id}
                  id={`analysis-block-${block.index}`}
                  className="scroll-mt-28 rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 text-left"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
                    <span>
                      блок #{block.index + 1} · предложений {block.sentenceCount} · слов{' '}
                      {block.wordCount}
                    </span>
                    <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-[10px] text-zinc-400">
                      {block.id}
                    </code>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">
                    {block.text}
                  </p>
                </li>
              ))}
            </ul>
          </SurfaceCard>
        </section>
      ) : null}

      <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-zinc-200">Глубокий анализ (JSON)</h2>
          <div className="flex flex-wrap gap-2">
            <AppButton
              type="button"
              variant="ghost"
              onClick={() => applyExternalJson(JSON.stringify(bundledCanonProjectMasterV1))}
            >
              Проект Мастер (PDF) в слой
            </AppButton>
            <AppButton
              type="button"
              variant="ghost"
              onClick={() => applyExternalJson(JSON.stringify(bundledCanonSecondaryV1))}
            >
              Канон-2 (PDF) в слой
            </AppButton>
            <AppButton
              type="button"
              onClick={() => applyExternalJson(jsonDraft)}
              disabled={!jsonDraft.trim()}
            >
              Импортировать JSON
            </AppButton>
          </div>
        </div>
        <textarea
          value={jsonDraft}
          onChange={(e) => setJsonDraft(e.target.value)}
          spellCheck={false}
          placeholder={JSON_PLACEHOLDER}
          className="min-h-[180px] w-full resize-y rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 font-mono text-xs leading-relaxed text-zinc-100 outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/30"
        />
      </section>

      {external ? (
        <section className="space-y-4">
          <SurfaceCard
            title="Слой внешней модели"
            description={external.modelHint ? `Подсказка модели: ${external.modelHint}` : undefined}
          >
            <p className="mt-3 text-sm leading-relaxed text-zinc-200">{external.summary}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Темы</h3>
                <ul className="mt-2 space-y-2">
                  {external.themes.map((t) => (
                    <li key={t.id} className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-3">
                      <p className="text-sm font-semibold text-zinc-100">{t.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-zinc-400">{t.rationale}</p>
                      <ThemeBlockAnchors theme={t} blockCount={local?.blocks.length ?? 0} />
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Напряжения
                  </h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-300">
                    {external.tensions.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Гипотезы
                  </h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-300">
                    {external.hypotheses.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </SurfaceCard>
        </section>
      ) : null}
    </div>
  )
}
