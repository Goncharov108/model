/** Один вариант ответа (радиокнопка). */
export interface PlanAnswerOption {
  id: string
  label: string
}

/** Вопрос планирования: тема, формулировка, варианты и опционально поле «свой вариант». */
export interface PlanQuestion {
  id: string
  topic: string
  prompt: string
  options: PlanAnswerOption[]
  allowCustom: boolean
}

/** Сохранённый ответ пользователя. */
export interface PlanAnswerValue {
  optionId: string | null
  customText: string
}
