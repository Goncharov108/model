import { useMemo, useState } from 'react'
import type { CalendarEntity } from '../domain/calendarEntity'
import { CalendarEntityCard } from '../components/calendar/CalendarEntityCard'
import { CalendarEntityForm } from '../components/calendar/CalendarEntityForm'
import { CalendarMonthGrid } from '../components/calendar/CalendarMonthGrid'
import { CalendarWeakSpots } from '../components/calendar/CalendarWeakSpots'
import {
  collectWeakSpots,
  countEntitiesByDate,
  formatDateLabel,
  parseDateKey,
  todayDateKey,
} from '../lib/calendarEntityUtils'
import { useCalendarEntitiesStore } from '../store/calendarEntitiesStore'
import { AppButton } from '../ui/AppButton'
import { PageHeader } from '../ui/PageHeader'
import { SurfaceCard } from '../ui/SurfaceCard'

/** Экран «Календарь + сущности + метрики» в Мастер-админ. */
export function MasterAdminCalendarWorkspace() {
  const entities = useCalendarEntitiesStore((s) => s.entities)
  const addEntity = useCalendarEntitiesStore((s) => s.addEntity)
  const updateEntity = useCalendarEntitiesStore((s) => s.updateEntity)
  const removeEntity = useCalendarEntitiesStore((s) => s.removeEntity)

  const [selectedDate, setSelectedDate] = useState(todayDateKey)
  const selectedParsed = parseDateKey(selectedDate)
  const [viewYear, setViewYear] = useState(selectedParsed.getFullYear())
  const [viewMonth, setViewMonth] = useState(selectedParsed.getMonth())
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<CalendarEntity | null>(null)

  const countsByDate = useMemo(
    () => countEntitiesByDate(entities, viewYear, viewMonth),
    [entities, viewYear, viewMonth],
  )

  const dayEntities = useMemo(
    () => entities.filter((e) => e.date === selectedDate),
    [entities, selectedDate],
  )

  const weakSpots = useMemo(() => collectWeakSpots(entities), [entities])

  const jumpToDate = (dateKey: string) => {
    setSelectedDate(dateKey)
    const d = parseDateKey(dateKey)
    setViewYear(d.getFullYear())
    setViewMonth(d.getMonth())
    setFormOpen(false)
    setEditing(null)
  }

  const shiftMonth = (delta: number) => {
    const d = new Date(viewYear, viewMonth + delta, 1)
    setViewYear(d.getFullYear())
    setViewMonth(d.getMonth())
  }

  const handleSave = (draft: Omit<CalendarEntity, 'id'>, id?: string) => {
    if (id) {
      updateEntity(id, draft)
    } else {
      addEntity(draft)
    }
    setFormOpen(false)
    setEditing(null)
  }

  const startEdit = (entity: CalendarEntity) => {
    setEditing(entity)
    setFormOpen(true)
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10 lg:px-10">
      <PageHeader
        eyebrow="Мастер-админ"
        title="Календарь"
        description="Садхана, проекты и семья на одной сетке: сущности с метриками по типу, локально в браузере. Просадки — в блоке «Слабые места»."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_1fr]">
        <SurfaceCard title="Месяц" className="lg:sticky lg:top-6 lg:self-start">
          <div className="mt-4">
            <CalendarMonthGrid
              year={viewYear}
              monthIndex={viewMonth}
              selectedDate={selectedDate}
              countsByDate={countsByDate}
              onSelectDate={(key) => {
                setSelectedDate(key)
                const d = parseDateKey(key)
                setViewYear(d.getFullYear())
                setViewMonth(d.getMonth())
              }}
              onPrevMonth={() => shiftMonth(-1)}
              onNextMonth={() => shiftMonth(1)}
            />
          </div>
        </SurfaceCard>

        <div className="flex min-w-0 flex-col gap-6">
          <SurfaceCard
            title={formatDateLabel(selectedDate)}
            description={`Записей на день: ${dayEntities.length}`}
          >
            <div className="mt-4 flex flex-wrap gap-2">
              {!formOpen ? (
                <AppButton
                  type="button"
                  onClick={() => {
                    setEditing(null)
                    setFormOpen(true)
                  }}
                >
                  Добавить сущность
                </AppButton>
              ) : null}
            </div>

            {formOpen ? (
              <div className="mt-4">
                <CalendarEntityForm
                  dateKey={selectedDate}
                  initial={editing}
                  onSave={handleSave}
                  onCancel={() => {
                    setFormOpen(false)
                    setEditing(null)
                  }}
                />
              </div>
            ) : null}

            <div className="mt-4 space-y-3">
              {dayEntities.length === 0 && !formOpen ? (
                <p className="text-sm text-zinc-500">На эту дату записей пока нет.</p>
              ) : null}
              {dayEntities.map((entity) => (
                <CalendarEntityCard
                  key={entity.id}
                  entity={entity}
                  onEdit={startEdit}
                  onDelete={(id) => {
                    removeEntity(id)
                    if (editing?.id === id) {
                      setEditing(null)
                      setFormOpen(false)
                    }
                  }}
                />
              ))}
            </div>
          </SurfaceCard>

          <CalendarWeakSpots spots={weakSpots} onJumpToDate={jumpToDate} />
        </div>
      </div>
    </div>
  )
}
