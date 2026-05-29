import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Financing, Subscription } from '../../lib/types'
import {
  chargesInMonth,
  formatEuroSmart,
  type CalendarCharge,
} from '../../lib/calculations'
import { findCategory, useCategories } from '../../lib/categories'
import { formatMonthLong, startOfToday, startOfMonth, addMonths, isSameMonth } from '../../lib/dates'

interface Props {
  subscriptions: Subscription[]
  financings: Financing[]
}

const WEEK_DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

export function RenewalCalendar({ subscriptions, financings }: Props) {
  const { categories } = useCategories()
  const [cursor, setCursor] = useState<Date>(() => startOfMonth(startOfToday()))
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const today = startOfToday()
  const isCurrentMonth = isSameMonth(cursor, today)

  // Función para obtener color de categoría
  const colorOf = useMemo(
    () => (id: string) => findCategory(categories, id),
    [categories],
  )

  // Cobros del mes mostrado
  const charges = useMemo(
    () => chargesInMonth(subscriptions, financings, cursor, colorOf),
    [subscriptions, financings, cursor, colorOf],
  )

  // Agrupar por día
  const chargesByDay = useMemo(() => {
    const map = new Map<number, CalendarCharge[]>()
    for (const c of charges) {
      const arr = map.get(c.day) ?? []
      arr.push(c)
      map.set(c.day, arr)
    }
    return map
  }, [charges])

  // Total del mes
  const monthTotal = useMemo(
    () => charges.reduce((sum, c) => sum + c.amount, 0),
    [charges],
  )

  // Cómo está estructurado el grid del mes
  const grid = useMemo(() => buildMonthGrid(cursor), [cursor])

  const dayChargeList = selectedDay !== null ? chargesByDay.get(selectedDay) ?? [] : []

  const goPrev = () => {
    setCursor((d) => addMonths(d, -1))
    setSelectedDay(null)
  }
  const goNext = () => {
    setCursor((d) => addMonths(d, 1))
    setSelectedDay(null)
  }
  const goToday = () => {
    setCursor(startOfMonth(today))
    setSelectedDay(null)
  }

  return (
    <section className="card p-5">
      {/* Cabecera */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
          Calendario de renovaciones
        </h2>
        {!isCurrentMonth && (
          <button
            type="button"
            onClick={goToday}
            className="text-[11px] text-muted hover:text-ink transition-colors"
          >
            Hoy
          </button>
        )}
      </div>

      {/* Navegación */}
      <div className="flex items-center justify-between mb-4 mt-3">
        <button
          type="button"
          onClick={goPrev}
          className="p-1.5 -ml-1.5 rounded-md text-muted hover:text-ink hover:bg-[var(--border)]/40 transition-colors"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 text-center">
          <span className="text-base font-semibold text-ink capitalize">
            {formatMonthLong(cursor)}
          </span>
          {charges.length > 0 && (
            <div className="text-[11px] text-muted tabular-nums mt-0.5">
              {charges.length} {charges.length === 1 ? 'cobro' : 'cobros'} · {formatEuroSmart(monthTotal)}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={goNext}
          className="p-1.5 -mr-1.5 rounded-md text-muted hover:text-ink hover:bg-[var(--border)]/40 transition-colors"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Cabecera días de semana */}
      <div className="grid grid-cols-7 gap-1 mb-1.5">
        {WEEK_DAYS.map((d, i) => (
          <div
            key={i}
            className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grid de días */}
      <div className="grid grid-cols-7 gap-1">
        {grid.map((cell, i) => {
          if (cell === null) {
            return <div key={i} />
          }
          const dayCharges = chargesByDay.get(cell.day) ?? []
          const isToday =
            cell.day === today.getDate() && isSameMonth(cursor, today)
          const isSelected = selectedDay === cell.day && dayCharges.length > 0
          const hasCharges = dayCharges.length > 0
          const colors = Array.from(new Set(dayCharges.map((c) => c.color))).slice(0, 3)
          const overflow = dayCharges.length > 3

          return (
            <button
              key={i}
              type="button"
              onClick={() => hasCharges && setSelectedDay(isSelected ? null : cell.day)}
              disabled={!hasCharges}
              className={`relative h-12 rounded-lg flex flex-col items-center justify-start pt-1.5 text-[12px] font-medium transition-all ${
                isSelected
                  ? 'bg-[var(--ink)] text-[var(--bg)]'
                  : isToday
                    ? 'bg-mint/10 text-ink ring-1 ring-mint/40'
                    : hasCharges
                      ? 'hover:bg-[var(--border)]/40 text-ink cursor-pointer'
                      : 'text-muted/70 cursor-default'
              }`}
              aria-label={`Día ${cell.day}${hasCharges ? `, ${dayCharges.length} cobros` : ''}`}
            >
              <span className="tabular-nums">{cell.day}</span>
              {hasCharges && (
                <div className="flex items-center gap-0.5 mt-0.5">
                  {colors.map((color, ci) => (
                    <span
                      key={ci}
                      className="h-1 w-1 rounded-full"
                      style={{ background: isSelected ? 'currentColor' : color }}
                      aria-hidden
                    />
                  ))}
                  {overflow && (
                    <span
                      className={`text-[8px] font-semibold ml-0.5 leading-none ${
                        isSelected ? 'text-[var(--bg)]' : 'text-muted'
                      }`}
                    >
                      +
                    </span>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Detalles del día seleccionado */}
      <AnimatePresence initial={false}>
        {selectedDay !== null && dayChargeList.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-subtle">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                  Día {selectedDay}
                </span>
                <span className="text-[11px] text-muted tabular-nums">
                  {dayChargeList.length} {dayChargeList.length === 1 ? 'cobro' : 'cobros'}
                </span>
              </div>
              <ul className="space-y-1.5">
                {dayChargeList.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center gap-3 px-2.5 py-2 rounded-lg bg-[var(--bg)] border border-subtle"
                  >
                    <span
                      className="h-8 w-8 rounded-lg bg-[var(--card)] border border-subtle flex items-center justify-center text-base shrink-0"
                    >
                      {c.emoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-ink truncate">{c.name}</div>
                      <div className="text-[11px] text-muted">
                        {c.kind === 'subscription' ? 'Suscripción' : 'Financiación'}
                      </div>
                    </div>
                    <div className="text-sm font-semibold tabular-nums text-ink shrink-0">
                      {formatEuroSmart(c.amount)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

/* -------------------------------------------------------------------- */
/* Helper para construir la matriz del calendario                       */
/* -------------------------------------------------------------------- */
interface CalendarCell {
  day: number
}

function buildMonthGrid(monthDate: Date): (CalendarCell | null)[] {
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // En Europa la semana empieza en lunes
  // getDay(): 0=Domingo, 1=Lunes, ..., 6=Sábado
  // Queremos: Lunes=0, Martes=1, ..., Domingo=6
  const jsDay = firstDay.getDay()
  const offset = (jsDay + 6) % 7

  const cells: (CalendarCell | null)[] = []
  for (let i = 0; i < offset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d })
  // Padding al final hasta completar la última semana (múltiplo de 7)
  while (cells.length % 7 !== 0) cells.push(null)

  return cells
}
