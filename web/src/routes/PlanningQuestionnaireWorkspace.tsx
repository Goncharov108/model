import type { JSX } from 'react'
import { useState } from 'react'
import { PlanningQuestionCard } from '../components/planning/PlanningQuestionCard'
import { PLANNING_QUESTIONNAIRE } from '../data/planningQuestionnaire'
import type { PlanAnswerValue } from '../domain/planningQuestion'
import { buildPlanningExport, parsePlanningImport } from '../lib/planningSnapshot'
import { downloadJson } from '../lib/downloadJson'
import { usePlanningAnswersStore } from '../store/planningAnswersStore'
import { AppButton } from '../ui/AppButton'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { PageHeader } from '../ui/PageHeader'

/** Перманентный опросник плана: ответы сохраняются в localStorage. */
export function PlanningQuestionnaireWorkspace(): JSX.Element {
  const answers = usePlanningAnswersStore((s) => s.answers)
  const setOption = usePlanningAnswersStore((s) => s.setOption)
  const setCustom = usePlanningAnswersStore((s) => s.setCustom)
  const replaceAll = usePlanningAnswersStore((s) => s.replaceAll)
  const clearAll = usePlanningAnswersStore((s) => s.clearAll)

  const [importDraft, setImportDraft] = useState('')
  const [importError, setImportError] = useState<string | null>(null)
  const [clearDialogOpen, setClearDialogOpen] = useState(false)

  function valueFor(id: string): PlanAnswerValue {
    return answers[id] ?? { optionId: null, customText: '' }
  }

  function onExport() {
    const payload = buildPlanningExport(answers)
    downloadJson(`plan-answers-${Date.now()}.json`, payload)
    setImportError(null)
  }

  function onImport() {
    const res = parsePlanningImport(importDraft)
    if (!res.ok) {
      setImportError(res.message)
      return
    }
    replaceAll(res.answers)
    setImportError(null)
    setImportDraft('')
  }

  function onClearAll() {
    setClearDialogOpen(true)
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <ConfirmDialog
        open={clearDialogOpen}
        title="Очистить ответы?"
        description="Все ответы опросника в этом браузере будут удалены из localStorage. Действие необратимо."
        confirmLabel="Очистить"
        confirmVariant="danger"
        onCancel={() => setClearDialogOpen(false)}
        onConfirm={() => {
          clearAll()
          setImportError(null)
        }}
      />
      <PageHeader
        eyebrow="План реализации"
        title="Вопросы с вариантами"
        description="Ответы хранятся только в этом браузере. Чтобы передать их ассистенту в чат — нажми «Экспорт JSON» и вставь файл или содержимое сюда. Импорт восстанавливает ответы из JSON."
      />
      <section className="-mt-4 space-y-3 border-b border-zinc-800 pb-8">
        <div className="flex flex-wrap gap-2">
          <AppButton type="button" onClick={onExport}>
            Экспорт JSON
          </AppButton>
          <AppButton type="button" variant="ghost" onClick={onImport} disabled={!importDraft.trim()}>
            Импорт JSON
          </AppButton>
          <AppButton type="button" variant="danger" onClick={onClearAll}>
            Очистить ответы…
          </AppButton>
        </div>
        <textarea
          value={importDraft}
          onChange={(e) => setImportDraft(e.target.value)}
          spellCheck={false}
          placeholder='Вставь сюда JSON из файла plan-answers-….json после экспорта'
          className="min-h-[100px] w-full resize-y rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 font-mono text-xs text-zinc-100 outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/25"
        />
        {importError ? (
          <p className="rounded-lg border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-200">
            {importError}
          </p>
        ) : null}
      </section>

      <ol className="flex list-decimal flex-col gap-6 pl-5 marker:text-zinc-500">
        {PLANNING_QUESTIONNAIRE.map((q, index) => (
          <li key={q.id} className="pl-1">
            <span className="mb-2 block text-xs text-zinc-600">Вопрос {index + 1}</span>
            <PlanningQuestionCard
              question={q}
              value={valueFor(q.id)}
              onPickOption={(optionId) => setOption(q.id, optionId)}
              onClearOption={() => setOption(q.id, null)}
              onCustomChange={(text) => setCustom(q.id, text)}
            />
          </li>
        ))}
      </ol>
    </div>
  )
}
