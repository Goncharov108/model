import type {
  FamilyCalendarEvent,
  FamilyCalendarEventKind,
  FamilyGoal,
  FamilyGoalStatus,
  FamilyMember,
  FamilyPlanningHorizon,
  FamilyPlanningSnapshot,
  FamilyTask,
  FamilyTaskStatus,
} from '../domain/familyPlanning'

export const FAMILY_HORIZON_ORDER: FamilyPlanningHorizon[] = ['day', 'week', 'month', 'year']

export const FAMILY_HORIZON_LABEL: Record<FamilyPlanningHorizon, string> = {
  day: 'День',
  week: 'Неделя',
  month: 'Месяц',
  year: 'Год',
}

export const FAMILY_TASK_STATUS_LABEL: Record<FamilyTaskStatus, string> = {
  todo: 'Запланировано',
  in_progress: 'В работе',
  done: 'Готово',
}

export const FAMILY_GOAL_STATUS_LABEL: Record<FamilyGoalStatus, string> = {
  draft: 'Черновик',
  active: 'В фокусе',
  done: 'Сделано',
}

export const FAMILY_EVENT_KIND_LABEL: Record<FamilyCalendarEventKind, string> = {
  ritual: 'Ритуал',
  meeting: 'Встреча',
  deadline: 'Срок',
  rest: 'Отдых',
}

export interface FamilyPlanningSummaryCard {
  id: string
  title: string
  value: string
  description: string
}

export interface FamilyHorizonBoard {
  horizon: FamilyPlanningHorizon
  label: string
  goals: FamilyGoal[]
  tasks: FamilyTask[]
  events: FamilyCalendarEvent[]
}

export function createFamilyPlanningSeedSnapshot(): FamilyPlanningSnapshot {
  const members: FamilyMember[] = [
    { id: 'dima', name: 'Дима', role: 'owner', focus: 'Общий контур, проекты, семейный темп' },
    { id: 'zhenya', name: 'Женя', role: 'partner', focus: 'Дом, семейные договорённости, личные цели' },
    { id: 'family', name: 'Семья', role: 'shared', focus: 'Совместные ритуалы, планы, бюджет и отдых' },
  ]

  const goals: FamilyGoal[] = [
    {
      id: 'goal-day-sync',
      title: 'Каждый день видеть общий ритм и не терять договорённости',
      horizon: 'day',
      ownerIds: ['dima', 'zhenya'],
      supporterIds: ['family'],
      status: 'active',
      metric: '1 общий чек-ин + 1 список главного на день',
      nextStep: 'Утром сверять 3 главных фокуса и кто кому чем помогает.',
    },
    {
      id: 'goal-week-rhythm',
      title: 'Собрать недельный ритм семьи',
      horizon: 'week',
      ownerIds: ['dima', 'zhenya'],
      supporterIds: ['family'],
      status: 'active',
      metric: '1 семейная встреча в неделю + 3-5 ключевых слотов',
      nextStep: 'Закрепить семейный обзор недели и разложить обязательные встречи.',
    },
    {
      id: 'goal-month-household',
      title: 'Синхронизировать дом, бюджет и крупные дела на месяц',
      horizon: 'month',
      ownerIds: ['dima'],
      supporterIds: ['zhenya'],
      status: 'draft',
      metric: '1 обзор бюджета + 1 список крупных покупок/дел',
      nextStep: 'Создать месячный список покупок, платежей и семейных событий.',
    },
    {
      id: 'goal-year-family',
      title: 'Зафиксировать годовые семейные цели и точки отдыха',
      horizon: 'year',
      ownerIds: ['dima', 'zhenya'],
      supporterIds: ['family'],
      status: 'draft',
      metric: '4 квартальных ревью + 1 карта общих целей года',
      nextStep: 'Разложить большие цели по кварталам: дом, отдых, деньги, развитие.',
    },
  ]

  const tasks: FamilyTask[] = [
    {
      id: 'task-day-zhenya',
      title: 'Для Жени: подтвердить ключевой слот дня и личный фокус',
      horizon: 'day',
      status: 'todo',
      assigneeIds: ['zhenya'],
      forMemberIds: ['dima'],
      dueLabel: 'Сегодня до 11:00',
      relatedGoalId: 'goal-day-sync',
      notes: 'Один слот времени + один запрос на поддержку.',
    },
    {
      id: 'task-day-dima',
      title: 'Для Димы: собрать 3 главных задачи семьи на сегодня',
      horizon: 'day',
      status: 'in_progress',
      assigneeIds: ['dima'],
      forMemberIds: ['zhenya', 'family'],
      dueLabel: 'Сегодня',
      relatedGoalId: 'goal-day-sync',
      notes: 'Не больше трёх, чтобы не раздувать день.',
    },
    {
      id: 'task-week-review',
      title: 'Провести семейный обзор недели',
      horizon: 'week',
      status: 'todo',
      assigneeIds: ['dima', 'zhenya'],
      forMemberIds: ['family'],
      dueLabel: 'Воскресенье вечером',
      relatedGoalId: 'goal-week-rhythm',
      notes: 'Обсудить встречи, помощь друг другу, бытовые задачи и отдых.',
    },
    {
      id: 'task-week-calendar',
      title: 'Разложить календарь: обязательное / желательное / семейное',
      horizon: 'week',
      status: 'todo',
      assigneeIds: ['dima'],
      forMemberIds: ['zhenya', 'family'],
      dueLabel: 'Каждый понедельник',
      relatedGoalId: 'goal-week-rhythm',
      notes: 'Нужен общий видимый календарь без скрытых планов.',
    },
    {
      id: 'task-month-budget',
      title: 'Свести платежи, крупные покупки и домашние задачи месяца',
      horizon: 'month',
      status: 'todo',
      assigneeIds: ['dima', 'zhenya'],
      forMemberIds: ['family'],
      dueLabel: '1 число месяца',
      relatedGoalId: 'goal-month-household',
    },
    {
      id: 'task-year-map',
      title: 'Собрать карту целей на год: дом / отношения / отдых / деньги',
      horizon: 'year',
      status: 'todo',
      assigneeIds: ['dima', 'zhenya'],
      forMemberIds: ['family'],
      dueLabel: 'Январь + квартальные ревью',
      relatedGoalId: 'goal-year-family',
    },
  ]

  const events: FamilyCalendarEvent[] = [
    {
      id: 'event-daily-sync',
      title: 'Утренний семейный синк',
      horizon: 'day',
      dateLabel: 'Каждый день · 10 минут',
      kind: 'ritual',
      participantIds: ['dima', 'zhenya'],
      notes: 'Что важно сегодня, где нужна помощь, что нельзя забыть.',
    },
    {
      id: 'event-week-review',
      title: 'Обзор недели',
      horizon: 'week',
      dateLabel: 'Воскресенье · 30 минут',
      kind: 'meeting',
      participantIds: ['dima', 'zhenya'],
      notes: 'Планы, встречи, дети/дом, взаимные ожидания.',
    },
    {
      id: 'event-month-budget',
      title: 'Месячный обзор бюджета и дома',
      horizon: 'month',
      dateLabel: '1-е число месяца',
      kind: 'deadline',
      participantIds: ['dima', 'zhenya'],
    },
    {
      id: 'event-year-retreat',
      title: 'Годовая семейная сессия',
      horizon: 'year',
      dateLabel: '1 раз в год + квартальные точки',
      kind: 'rest',
      participantIds: ['dima', 'zhenya', 'family'],
      notes: 'Смотреть на большие цели, отдых и ритм семьи.',
    },
  ]

  return {
    updatedAtIso: '2026-05-31T17:30:00.000Z',
    members,
    goals,
    tasks,
    events,
  }
}

export function buildFamilyPlanningSummary(snapshot: FamilyPlanningSnapshot): FamilyPlanningSummaryCard[] {
  const activeGoals = snapshot.goals.filter((goal) => goal.status === 'active').length
  const openTasks = snapshot.tasks.filter((task) => task.status !== 'done').length
  const sharedEvents = snapshot.events.filter((event) => event.participantIds.length > 1).length

  return [
    {
      id: 'family-members',
      title: 'Участники',
      value: String(snapshot.members.length),
      description: 'Кто участвует в семейном контуре и кто за что отвечает.',
    },
    {
      id: 'family-goals',
      title: 'Цели в фокусе',
      value: String(activeGoals),
      description: 'Сколько целей сейчас реально держим в поле внимания.',
    },
    {
      id: 'family-tasks',
      title: 'Открытые задачи',
      value: String(openTasks),
      description: 'Что ещё не закрыто по дню, неделе, месяцу и году.',
    },
    {
      id: 'family-events',
      title: 'Общие ритуалы',
      value: String(sharedEvents),
      description: 'Повторяющиеся точки синхронизации семьи в календаре.',
    },
  ]
}

export function buildFamilyPlanningBoard(snapshot: FamilyPlanningSnapshot): FamilyHorizonBoard[] {
  return FAMILY_HORIZON_ORDER.map((horizon) => ({
    horizon,
    label: FAMILY_HORIZON_LABEL[horizon],
    goals: snapshot.goals.filter((goal) => goal.horizon === horizon),
    tasks: snapshot.tasks.filter((task) => task.horizon === horizon),
    events: snapshot.events.filter((event) => event.horizon === horizon),
  }))
}

export function cycleTaskStatus(status: FamilyTaskStatus): FamilyTaskStatus {
  if (status === 'todo') return 'in_progress'
  if (status === 'in_progress') return 'done'
  return 'todo'
}

export function cycleGoalStatus(status: FamilyGoalStatus): FamilyGoalStatus {
  if (status === 'draft') return 'active'
  if (status === 'active') return 'done'
  return 'draft'
}
