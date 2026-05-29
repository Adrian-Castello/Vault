import { motion } from 'framer-motion'
import { Wallet, CalendarClock, PartyPopper } from 'lucide-react'
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
 * Cuatro KPIs en grid 2x2:
 *  - F001  Deuda total pendiente
 *  - F002 + F003  Cuota mensual + N financiaciones activas
 *  - F014  Progreso global con donut
 *  - F021  Libre de deuda el ... + countdown en meses
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-5">
      {/* F001 — Deuda total pendiente */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="card p-5"
      >
        <div className="flex items-start justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
            Deuda total pendiente
          </span>
          <Wallet className="h-4 w-4 text-warm" />
        </div>
        <div className="mb-2">
          <span className="text-3xl md:text-4xl font-semibold text-ink tabular-nums leading-none">
            {formatEuroSmart(debt)}
          </span>
        </div>
        <div className="text-[12px] text-muted">
          {debt === 0 ? 'Sin deuda pendiente' : 'Total por amortizar'}
        </div>
      </motion.div>

      {/* F002 + F003 — Cuota mensual + financiaciones activas */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        className="card p-5"
      >
        <div className="flex items-start justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
            Cuota mensual total
          </span>
          <CalendarClock className="h-4 w-4 text-violet" />
        </div>
        <div className="mb-2">
          <span className="text-3xl md:text-4xl font-semibold text-ink tabular-nums leading-none">
            {formatEuroSmart(monthly)}
          </span>
        </div>
        <div className="text-[12px] text-muted">
          {active.length === 0
            ? 'Sin financiaciones activas'
            : `${active.length} ${active.length === 1 ? 'financiación activa' : 'financiaciones activas'}`}
        </div>
      </motion.div>

      {/* F014 — Progreso global con donut */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.1 }}
        className="card p-5"
      >
        <div className="flex items-start justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
            Progreso global
          </span>
        </div>

        <div className="flex items-center gap-4">
          <ProgressDonut percent={progress} />
          <div className="flex flex-col min-w-0">
            <span className="text-3xl md:text-4xl font-semibold text-ink tabular-nums leading-none">
              {Math.round(progress)}%
            </span>
            <span className="text-[12px] text-muted mt-1.5">amortizado</span>
          </div>
        </div>
      </motion.div>

      {/* F021 — Libre de deuda el ... */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.15 }}
        className="card p-5"
      >
        <div className="flex items-start justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
            Libre de deuda
          </span>
          {freeDate ? (
            <CalendarClock className="h-4 w-4 text-mint" />
          ) : (
            <PartyPopper className="h-4 w-4 text-mint" />
          )}
        </div>

        {freeDate ? (
          <>
            <div className="mb-1.5">
              <span className="text-2xl md:text-3xl font-semibold text-ink leading-tight">
                {formatFullDate(freeDate)}
              </span>
            </div>
            <div className="text-[12px] text-muted">
              {months === 0
                ? 'Este mes te liberas'
                : `en ${months} ${months === 1 ? 'mes' : 'meses'}`}
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
    </div>
  )
}

/* -------------------------------------------------------------------- */
/* Donut SVG                                                            */
/* -------------------------------------------------------------------- */
function ProgressDonut({ percent }: { percent: number }) {
  const size = 72
  const stroke = 8
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (Math.min(100, percent) / 100) * circumference

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-[var(--border)]"
        />
        {/* Progress */}
        <defs>
          <linearGradient id="donut-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--mint)" />
            <stop offset="100%" stopColor="var(--violet)" />
          </linearGradient>
        </defs>
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#donut-gradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
    </div>
  )
}
