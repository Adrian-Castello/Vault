import { motion } from 'framer-motion'
import { Wallet, CalendarClock, CalendarHeart, PartyPopper } from 'lucide-react'
import type { Financing } from '../../lib/types'
import {
  activeFinancings,
  debtFreeDate,
  formatEuroSmart,
  globalProgressPercent,
  totalMonthlyFinancings,
  totalRemainingDebt,
} from '../../lib/calculations'
import {
  formatFullDate,
  monthsBetween,
  parseISODate,
  startOfToday,
} from '../../lib/dates'

interface Props {
  items: Financing[]
}

/**
 * Layout actualizado:
 *  - Card destacada arriba: "Libre de deuda" con fecha + countdown + barra de progreso global.
 *  - Debajo, dos cards compactas: Deuda total y Cuota mensual.
 */
export function FinancingsKpis({ items }: Props) {
  const debt = totalRemainingDebt(items)
  const monthly = totalMonthlyFinancings(items)
  const active = activeFinancings(items)
  const progress = globalProgressPercent(items)
  const freeDate = debtFreeDate(items)

  const today = startOfToday()
  const months = freeDate ? Math.max(0, monthsBetween(today, parseISODate(freeDate))) : 0

  return (
    <div className="space-y-3 md:space-y-4 mb-5">
      {/* Card destacada: Libre de deuda + progreso */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="card p-5"
      >
        <div className="flex items-start justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
            Libre de deuda
          </span>
          {freeDate ? (
            <CalendarHeart className="h-4 w-4 text-mint" />
          ) : (
            <PartyPopper className="h-4 w-4 text-mint" />
          )}
        </div>

        {freeDate ? (
          <>
            <div className="flex items-baseline gap-3 flex-wrap mb-3">
              <span className="text-3xl md:text-4xl font-semibold text-ink leading-none">
                {formatFullDate(freeDate)}
              </span>
              <span className="text-sm text-muted">
                {months === 0
                  ? 'Este mes te liberas'
                  : `en ${months} ${months === 1 ? 'mes' : 'meses'}`}
              </span>
            </div>

            {/* Barra de progreso global */}
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-muted">Progreso global</span>
                <span className="text-[11px] text-ink font-medium tabular-nums">
                  {Math.round(progress)}% amortizado
                </span>
              </div>
              <div className="h-2 rounded-full bg-[var(--border)]/60 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-mint to-violet"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mb-1.5">
              <span className="text-2xl md:text-3xl font-semibold text-ink leading-tight">
                ¡Sin deudas!
              </span>
            </div>
            <div className="text-[12px] text-muted">No tienes financiaciones activas</div>
          </>
        )}
      </motion.div>

      {/* Dos cards compactas: Deuda total + Cuota mensual */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {/* Deuda total pendiente */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="card p-4"
        >
          <div className="flex items-start justify-between mb-1.5">
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.15em] text-muted leading-tight">
              Deuda total
            </span>
            <Wallet className="h-3.5 w-3.5 text-warm shrink-0" />
          </div>
          <div className="mb-1">
            <span className="text-xl md:text-2xl font-semibold text-ink tabular-nums leading-none">
              {formatEuroSmart(debt)}
            </span>
          </div>
          <div className="text-[11px] text-muted">
            {debt === 0 ? 'Sin deuda pendiente' : 'Por amortizar'}
          </div>
        </motion.div>

        {/* Cuota mensual total */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          className="card p-4"
        >
          <div className="flex items-start justify-between mb-1.5">
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.15em] text-muted leading-tight">
              Cuota mensual
            </span>
            <CalendarClock className="h-3.5 w-3.5 text-violet shrink-0" />
          </div>
          <div className="mb-1">
            <span className="text-xl md:text-2xl font-semibold text-ink tabular-nums leading-none">
              {formatEuroSmart(monthly)}
            </span>
          </div>
          <div className="text-[11px] text-muted">
            {active.length === 0
              ? 'Sin activas'
              : `${active.length} ${active.length === 1 ? 'activa' : 'activas'}`}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
