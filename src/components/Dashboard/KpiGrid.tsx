import { Calendar, PiggyBank, Repeat, TrendingUp } from 'lucide-react'
import type { Financing, Subscription } from '../../lib/types'
import {
  formatEuroSmart,
  nextCharge,
  totalMonthlyFinancings,
  totalMonthlySubscriptions,
  totalRemainingDebt,
} from '../../lib/calculations'
import { formatRelativeDate } from '../../lib/dates'

interface Props {
  subscriptions: Subscription[]
  financings: Financing[]
}

export function KpiGrid({ subscriptions, financings }: Props) {
  const monthlyTotal =
    totalMonthlySubscriptions(subscriptions) + totalMonthlyFinancings(financings)
  const annual = monthlyTotal * 12
  const debt = totalRemainingDebt(financings)
  const next = nextCharge(subscriptions, financings)

  const items = [
    {
      label: 'Gasto mensual',
      value: formatEuroSmart(monthlyTotal),
      icon: Repeat,
      hint: 'Equivalente mensual',
      tint: 'mint',
    },
    {
      label: 'Gasto anual',
      value: formatEuroSmart(annual),
      icon: TrendingUp,
      hint: 'Proyección 12 meses',
      tint: 'mint',
    },
    {
      label: 'Deuda pendiente',
      value: formatEuroSmart(debt),
      icon: PiggyBank,
      hint:
        financings.filter((f) => f.paid_installments < f.total_installments).length +
        ' financ. activas',
      tint: 'violet',
    },
    {
      label: 'Próximo cobro',
      value: next ? formatEuroSmart(next.amount) : '—',
      icon: Calendar,
      hint: next ? formatRelativeDate(next.date) : 'sin cobros próximos',
      tint: 'neutral',
    },
  ] as const

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {items.map((kpi) => (
        <KpiCard key={kpi.label} {...kpi} />
      ))}
    </div>
  )
}

interface KpiCardProps {
  label: string
  value: string
  hint: string
  icon: typeof Repeat
  tint: 'mint' | 'violet' | 'neutral'
}

function KpiCard({ label, value, hint, icon: Icon, tint }: KpiCardProps) {
  const tintClasses =
    tint === 'mint'
      ? 'bg-mint/12 text-mint'
      : tint === 'violet'
        ? 'bg-violet/12 text-violet-light'
        : 'bg-[var(--border)]/50 text-ink'

  return (
    <div className="card card-hoverable p-4 md:p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted">
          {label}
        </span>
        <span
          className={`h-7 w-7 rounded-lg flex items-center justify-center ${tintClasses}`}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="text-[26px] md:text-3xl font-semibold tracking-tight tabular-nums leading-none">
        {value}
      </div>
      <div className="text-xs text-muted mt-2 tabular-nums">{hint}</div>
    </div>
  )
}
