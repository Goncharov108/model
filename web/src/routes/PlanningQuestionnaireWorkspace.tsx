import type { JSX } from 'react'
import { PlanningQuestionCard } from '../components/planning/PlanningQuestionCard'
import { PLANNING_QUESTIONNAIRE } from '../data/planningQuestionnaire'
import type { PlanAnswerValue } from '../domain/planningQuestion'
import { usePlanningAnswersStore } from '../store/planningAnswersStore'

/** Перманентный опросник плана: ответы сохраняются в localStorage. */
export function PlanningQuestionnaireWorkspace(): JSX.Element {
  const answers = usePlanningAnswersStore((s) => s.answers)
  const setOption = usePlanningAnswersStore((s) => s.setOption)
  const setCustom = usePlanningAnswersStore((s) => s.setCustom)

  function valueFor(id: string): PlanAnswerValue {
    return answers[id] ?? { optionId: null, customText: '' }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <header className="space-y-3 border-b border-zinc-800 pb-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-300/90">
          План реализации
        </p>
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
          Вопросы с вариантами
        </h1>
        <p className="max-w-2xl text-pretty text-sm leading-relaxed text-zinc-400 sm:text-base">
          Отмечай варианты и при необходимости дописывай свой текст. Прогресс не теряется при
          перезагрузке страницы. Когда заполнишь достаточно — скажи, соберём план реализации по
          ответам.
        </p>
      </header>

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
