import { motion } from 'framer-motion'
import type { Subscription, Financing, UpcomingCharge } from '../../lib/types'
import { formatEuroSmart, upcomingCharges } from '../../lib/calculations'
import { formatRelativeDate } from '../../lib/dates'

interface Props {
  subscriptions: Subscription[]
  financings: Financing[]
}

export function Upcoming7Days({ subscriptions, financings }: Props) {
  const items = upcomingCharges(subscriptions, financings, 7)
  const total = items.reduce((acc, i) => acc + i.amount, 0)

  return (
    <section className="card p-6 md:p-7 relative overflow-hidden">
      {/* Decorative gradient blob */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full opacity-30 blur-3xl"
        style={{
          background:
            'radial-gradient(closest-side, rgba(110, 231, 183, 0.4), transparent 70%)',
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full opacity-20 blur-3xl"
        style={{
          background:
            'radial-gradient(closest-side, rgba(167, 139, 250, 0.4), transparent 70%)',
        }}
      />

      <div className="relative">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xs font-bold text-ink/70 uppercase tracking-[0.18em]">
            Próximos 7 días
          </h2>
          <span className="text-xs text-muted tabular-nums">
            {items.length} {items.length === 1 ? 'cobro' : 'cobros'}
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-6">
          <span className="text-[44px] md:text-[56px] font-semibold tracking-tight text-ink leading-none tabular-nums">
            {formatEuroSmart(total)}
          </span>
        </div>

        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="space-y-1">
            {items.map((it, idx) => (
              <ChargeRow key={`${it.kind}-${it.id}`} charge={it} index={idx} />
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function ChargeRow({ charge, index }: { charge: UpcomingCharge; index: number }) {
  const isSoon = charge.daysAway < 3
  const accentClasses =
    charge.kind === 'subscription'
      ? 'bg-mint/12 text-mint border-mint/25'
      : 'bg-violet/12 text-violet-light border-violet/25'

  return (
    <motion.li
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="flex items-center gap-3 py-2.5 group"
    >
      <span className="h-10 w-10 rounded-xl bg-[var(--bg)] dark:bg-[var(--card)] border border-subtle flex items-center justify-center text-xl">
        {charge.emoji || '✨'}
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-ink truncate">{charge.name}</span>
          <span
            className={`hidden sm:inline text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${accentClasses}`}
          >
            {charge.kind === 'subscription' ? 'Sub' : 'Fin'}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className={`text-xs ${
              isSoon ? 'text-warm font-medium' : 'text-muted'
            } tabular-nums`}
          >
            {isSoon && (
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-warm mr-1.5 align-middle animate-pulse-soft" />
            )}
            {formatRelativeDate(charge.date)}
          </span>
        </div>
      </div>

      <span className="font-medium text-ink tabular-nums shrink-0">
        {formatEuroSmart(charge.amount)}
      </span>
    </motion.li>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-6">
      <div className="text-3xl mb-2">🌿</div>
      <p className="text-sm text-muted">Semana tranquila. Nada que pagar.</p>
    </div>
  )
}
