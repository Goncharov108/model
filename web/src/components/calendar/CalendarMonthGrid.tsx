import { weekdayMon0, daysInMonth, monthStart, toDateKey, formatMonthYear } from '../../lib/calendarEntityUtils'

const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

/** Месячная сетка календаря с выбором дня. */
export function CalendarMonthGrid(props: {
  year: number
  monthIndex: number
  selectedDate: string
  countsByDate: Map<string, number>
  onSelectDate: (dateKey: string) => void
  onPrevMonth: () => void
  onNextMonth: () => void
}) {
  const { year, monthIndex, selectedDate, countsByDate, onSelectDate, onPrevMonth, onNextMonth } = props

  const first = monthStart(year, monthIndex)
  const leadingBlanks = weekdayMon0(first)
  const totalDays = daysInMonth(year, monthIndex)
  const cells: (string | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: totalDays }, (_, i) =>
      toDateKey(new Date(year, monthIndex, i + 1, 12)),
    ),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const today = toDateKey(new Date())

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onPrevMonth}
          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800"
          aria-label="Предыдущий месяц"
        >
          ←
        </button>
        <p className="text-sm font-medium capitalize text-zinc-100">{formatMonthYear(year, monthIndex)}</p>
        <button
          type="button"
          onClick={onNextMonth}
          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800"
          aria-label="Следующий месяц"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase tracking-wide text-zinc-500">
        {WEEKDAY_LABELS.map((d) => (
          <span key={d} className="py-1">
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((dateKey, idx) => {
          if (!dateKey) return <span key={`empty-${idx}`} className="aspect-square" aria-hidden />

          const count = countsByDate.get(dateKey) ?? 0
          const isSelected = dateKey === selectedDate
          const isToday = dateKey === today
          const dayNum = Number(dateKey.slice(-2))

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => onSelectDate(dateKey)}
              className={[
                'relative flex aspect-square flex-col items-center justify-center rounded-lg border text-sm transition',
                isSelected
                  ? 'border-violet-500/70 bg-violet-600/25 text-violet-100'
                  : 'border-transparent text-zinc-200 hover:border-zinc-600 hover:bg-zinc-800/60',
                isToday && !isSelected ? 'ring-1 ring-amber-500/50' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {dayNum}
              {count > 0 ? (
                <span
                  className={[
                    'absolute bottom-1 h-1.5 w-1.5 rounded-full',
                    isSelected ? 'bg-violet-200' : 'bg-violet-500/80',
                  ].join(' ')}
                  aria-label={`${count} записей`}
                />
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
