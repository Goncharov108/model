import { useMemo } from 'react'
import type { FamilyPlanningHorizon } from '../domain/familyPlanning'
import {
  buildFamilyPlanningBoard,
  buildFamilyPlanningSummary,
  FAMILY_EVENT_KIND_LABEL,
  FAMILY_GOAL_STATUS_LABEL,
  FAMILY_HORIZON_LABEL,
  FAMILY_TASK_STATUS_LABEL,
} from '../lib/familyPlanning'
import { useFamilyPlanningStore } from '../store/familyPlanningStore'
import { AppButton } from '../ui/AppButton'
import { PageHeader } from '../ui/PageHeader'
import { SurfaceCard } from '../ui/SurfaceCard'

const HORIZON_BUTTONS: FamilyPlanningHorizon[] = ['day', 'week', 'month', 'year']

const goalStatusTone = {
  draft: 'border-zinc-700 bg-zinc-950/60 text-zinc-300',
  active: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
  done: 'border-sky-500/40 bg-sky-500/10 text-sky-200',
} as const

const taskStatusTone = {
  todo: 'border-zinc-700 bg-zinc-950/60 text-zinc-300',
  in_progress: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
  done: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
} as const

export function MasterAdminFamilyWorkspace() {
  const snapshot = useFamilyPlanningStore((s) => s.snapshot)
  const focusHorizon = useFamilyPlanningStore((s) => s.focusHorizon)
  const setFocusHorizon = useFamilyPlanningStore((s) => s.setFocusHorizon)
  const toggleTaskStatus = useFamilyPlanningStore((s) => s.toggleTaskStatus)
  const toggleGoalStatus = useFamilyPlanningStore((s) => s.toggleGoalStatus)
  const resetSeed = useFamilyPlanningStore((s) => s.resetSeed)

  const membersById = useMemo(() => new Map(snapshot.members.map((member) => [member.id, member])), [snapshot.members])
  const summary = useMemo(() => buildFamilyPlanningSummary(snapshot), [snapshot])
  const board = useMemo(() => buildFamilyPlanningBoard(snapshot), [snapshot])

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-6 py-10 lg:px-10">
      <PageHeader
        eyebrow="Мастер-админ"
        title="Семейный календарь и контур целей"
        description="Каркас для общего семейного планирования: день, неделя, месяц и год. Здесь есть роли, общие цели, задачи друг для друга и повторяющиеся календарные ритуалы."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summary.map((card) => (
          <SurfaceCard key={card.id} title={card.title} description={card.description}>
            <p className="mt-4 text-3xl font-semibold text-zinc-50">{card.value}</p>
          </SurfaceCard>
        ))}
      </div>

      <SurfaceCard
        title="Фокус горизонта"
        description="Можно быстро переключать слой, который сейчас важнее: день, неделя, месяц или год."
      >
        <div className="mt-4 flex flex-wrap gap-2">
          {HORIZON_BUTTONS.map((horizon) => {
            const active = horizon === focusHorizon
            return (
              <AppButton
                key={horizon}
                type="button"
                variant={active ? 'primary' : 'ghost'}
                onClick={() => setFocusHorizon(horizon)}
              >
                {FAMILY_HORIZON_LABEL[horizon]}
              </AppButton>
            )
          })}
          <AppButton type="button" variant="ghost" onClick={resetSeed}>
            Сбросить seed
          </AppButton>
        </div>
      </SurfaceCard>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SurfaceCard title="Люди и роли" description="Кто за что отвечает и какой у него текущий фокус в семейной системе.">
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {snapshot.members.map((member) => (
              <article key={member.id} className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-semibold text-zinc-100">{member.name}</h3>
                  <span className="rounded-full border border-zinc-700 px-2 py-1 text-[11px] uppercase tracking-[0.14em] text-zinc-400">
                    {member.role}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">{member.focus}</p>
              </article>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard
          title="Общий календарь"
          description="Повторяющиеся семейные точки, которые держат общий ритм и не дают потерять важное."
        >
          <div className="mt-4 space-y-3">
            {snapshot.events.map((event) => (
              <article key={event.id} className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-1 text-[11px] uppercase tracking-[0.14em] text-violet-200">
                    {FAMILY_HORIZON_LABEL[event.horizon]}
                  </span>
                  <span className="rounded-full border border-zinc-700 px-2 py-1 text-[11px] uppercase tracking-[0.14em] text-zinc-400">
                    {FAMILY_EVENT_KIND_LABEL[event.kind]}
                  </span>
                </div>
                <h3 className="mt-3 text-base font-semibold text-zinc-100">{event.title}</h3>
                <p className="mt-2 text-sm text-zinc-300">{event.dateLabel}</p>
                <p className="mt-2 text-sm text-zinc-400">
                  Участники: {event.participantIds.map((id) => membersById.get(id)?.name ?? id).join(', ')}
                </p>
                {event.notes ? <p className="mt-2 text-sm leading-relaxed text-zinc-500">{event.notes}</p> : null}
              </article>
            ))}
          </div>
        </SurfaceCard>
      </div>

      <section className="grid gap-4 xl:grid-cols-4">
        {board.map((column) => {
          const active = column.horizon === focusHorizon
          return (
            <SurfaceCard
              key={column.horizon}
              title={column.label}
              description={`${column.goals.length} целей · ${column.tasks.length} задач · ${column.events.length} событий`}
              className={active ? 'border-violet-500/40 shadow-violet-500/10' : ''}
            >
              <div className="mt-4 space-y-3">
                {column.goals.map((goal) => (
                  <article key={goal.id} className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <h3 className="text-sm font-semibold text-zinc-100">{goal.title}</h3>
                      <button
                        type="button"
                        onClick={() => toggleGoalStatus(goal.id)}
                        className={`rounded-full border px-2 py-1 text-[11px] uppercase tracking-[0.14em] ${goalStatusTone[goal.status]}`}
                      >
                        {FAMILY_GOAL_STATUS_LABEL[goal.status]}
                      </button>
                    </div>
                    <p className="mt-3 text-sm text-zinc-300">Метрика: {goal.metric}</p>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">Следующий шаг: {goal.nextStep}</p>
                  </article>
                ))}

                {column.tasks.map((task) => (
                  <article key={task.id} className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <h3 className="text-sm font-semibold text-zinc-100">{task.title}</h3>
                      <button
                        type="button"
                        onClick={() => toggleTaskStatus(task.id)}
                        className={`rounded-full border px-2 py-1 text-[11px] uppercase tracking-[0.14em] ${taskStatusTone[task.status]}`}
                      >
                        {FAMILY_TASK_STATUS_LABEL[task.status]}
                      </button>
                    </div>
                    <p className="mt-3 text-sm text-zinc-300">Срок: {task.dueLabel}</p>
                    <p className="mt-2 text-sm text-zinc-400">
                      Исполнители: {task.assigneeIds.map((id) => membersById.get(id)?.name ?? id).join(', ')}
                    </p>
                    <p className="mt-2 text-sm text-zinc-500">
                      Для кого: {task.forMemberIds.map((id) => membersById.get(id)?.name ?? id).join(', ')}
                    </p>
                    {task.notes ? <p className="mt-2 text-sm leading-relaxed text-zinc-500">{task.notes}</p> : null}
                  </article>
                ))}

                {column.goals.length === 0 && column.tasks.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-zinc-800 px-4 py-6 text-sm text-zinc-500">
                    Пока пусто — этот горизонт можно наполнить позже.
                  </p>
                ) : null}
              </div>
            </SurfaceCard>
          )
        })}
      </section>
    </div>
  )
}
