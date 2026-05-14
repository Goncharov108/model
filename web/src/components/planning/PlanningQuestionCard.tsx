import type { JSX } from 'react'
import type { PlanAnswerValue, PlanQuestion } from '../../domain/planningQuestion'

/** Одна карточка вопроса: варианты (radio) и опционально поле «свой вариант». */
export function PlanningQuestionCard(props: {
  question: PlanQuestion
  value: PlanAnswerValue
  onPickOption: (optionId: string) => void
  onClearOption: () => void
  onCustomChange: (text: string) => void
}): JSX.Element {
  const { question, value, onPickOption, onClearOption, onCustomChange } = props
  const groupName = `plan-q-${question.id}`

  return (
    <fieldset className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 shadow-lg shadow-black/20 backdrop-blur">
      <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-violet-300/90">
        {question.topic}
      </legend>
      <p className="mt-2 text-sm font-medium text-zinc-100">{question.prompt}</p>
      <div className="mt-4 space-y-2">
        {question.options.map((opt) => (
          <label
            key={opt.id}
            className="flex cursor-pointer items-start gap-3 rounded-lg border border-transparent px-2 py-2 hover:border-zinc-700/80 hover:bg-zinc-950/40"
          >
            <input
              type="radio"
              name={groupName}
              value={opt.id}
              checked={value.optionId === opt.id}
              onChange={() => onPickOption(opt.id)}
              className="mt-1 accent-violet-500"
            />
            <span className="text-sm leading-relaxed text-zinc-300">{opt.label}</span>
          </label>
        ))}
      </div>
      <div className="mt-3">
        <button
          type="button"
          onClick={onClearOption}
          className="text-xs font-medium text-zinc-500 underline-offset-2 hover:text-zinc-300 hover:underline"
        >
          Снять выбор варианта
        </button>
      </div>
      {question.allowCustom ? (
        <div className="mt-4">
          <label className="text-xs font-medium text-zinc-500" htmlFor={`${groupName}-custom`}>
            Свой вариант (дополнительно к выбранному или вместо него)
          </label>
          <textarea
            id={`${groupName}-custom`}
            value={value.customText}
            onChange={(e) => onCustomChange(e.target.value)}
            rows={3}
            className="mt-2 w-full resize-y rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 text-sm text-zinc-100 outline-none ring-violet-500/0 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/25"
            placeholder="Уточнения, исключения, ссылки, имена — что угодно."
          />
        </div>
      ) : null}
    </fieldset>
  )
}
