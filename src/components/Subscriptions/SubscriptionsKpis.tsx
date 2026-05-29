import { motion } from 'framer-motion'
import { Repeat, Sparkles } from 'lucide-react'
import type { Subscription } from '../../lib/types'
import { formatEuroSmart, subscriptionsByStatus, totalMonthlySubscriptions } from '../../lib/calculations'

interface Props {
  items: Subscription[]
}

/**
 * Dos KPIs arriba de la lista de suscripciones:
 *  - S001: Suscripciones activas (con desglose Activas / Prueba / Pausadas)
 *  - S002: Coste mensual total (solo de las activas)
 */
export function SubscriptionsKpis({ items }: Props) {
  const { active, trial, paused } = subscriptionsByStatus(items)
  const monthly = totalMonthlySubscriptions(items)

  const totalActive = active.length
  const totalAll = active.length + trial.length + paused.length

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-5">
      {/* S001 - Suscripciones activas */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="card p-5"
      >
        <div className="flex items-start justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/70">
            Suscripciones activas
          </span>
          <Repeat className="h-4 w-4 text-mint" />
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-4xl font-semibold text-ink tabular-nums leading-none">
            {totalActive}
          </span>
          {totalAll > totalActive && (
            <span className="text-sm text-muted tabular-nums">
              de {totalAll}
            </span>
          )}
        </div>

        {/* Breakdown con puntos de color */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px]">
          <BreakdownDot color="var(--mint)" count={active.length} label="Activas" />
          {trial.length > 0 && (
            <BreakdownDot color="var(--warm)" count={trial.length} label="Prueba" />
          )}
          {paused.length > 0 && (
            <BreakdownDot color="var(--muted)" count={paused.length} label="Pausadas" />
          )}
          {trial.length === 0 && paused.length === 0 && (
            <span className="text-muted text-[12px]">Todas activas</span>
          )}
        </div>
      </motion.div>

      {/* S002 - Coste mensual total */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        className="card p-5"
      >
        <div className="flex items-start justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/70">
            Coste mensual total
          </span>
          <Sparkles className="h-4 w-4 text-violet" />
        </div>

        <div className="mb-3">
          <span className="text-4xl font-semibold text-ink tabular-nums leading-none">
            {formatEuroSmart(monthly)}
          </span>
        </div>

        <div className="text-[12px] text-muted">
          {totalActive === 0
            ? 'Sin suscripciones activas'
            : `${totalActive} ${totalActive === 1 ? 'suscripción activa' : 'suscripciones activas'}`}
        </div>
      </motion.div>
    </div>
  )
}

function BreakdownDot({ color, count, label }: { color: string; count: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-muted">
      <span
        className="h-2 w-2 rounded-full shrink-0"
        style={{ background: color }}
        aria-hidden
      />
      <span className="tabular-nums text-ink font-medium">{count}</span>
      <span>{label}</span>
    </span>
  )
}
