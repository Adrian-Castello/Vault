import { motion } from 'framer-motion'
import type { Subscription } from '../../lib/types'
import { formatEuroSmart } from '../../lib/calculations'
import { formatRelativeDate, daysBetween, parseISODate, startOfToday } from '../../lib/dates'

interface Props {
  subscription: Subscription
  onClick: () => void
  index?: number
}

const cycleLabel: Record<Subscription['billing_cycle'], string> = {
  monthly: 'Mensual',
  quarterly: 'Trimestral',
  yearly: 'Anual',
}

export function SubscriptionItem({ subscription, onClick, index = 0 }: Props) {
  const target = parseISODate(subscription.next_charge_date)
  const today = startOfToday()
  const diff = daysBetween(today, target)
  const isSoon = diff >= 0 && diff < 3

  return (
    <motion.button
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.03 }}
      onClick={onClick}
      className="w-full card card-hoverable p-4 flex items-center gap-3.5 text-left group"
    >
      <span className="h-12 w-12 rounded-xl bg-[var(--bg)] dark:bg-[var(--card)] border border-subtle flex items-center justify-center text-2xl shrink-0">
        {subscription.emoji || '✨'}
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-medium text-ink truncate">{subscription.name}</span>
          <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-mint/12 text-mint border border-mint/25">
            {cycleLabel[subscription.billing_cycle]}
          </span>
        </div>
        <div
          className={`text-xs tabular-nums ${
            isSoon ? 'text-warm font-medium' : 'text-muted'
          }`}
        >
          {isSoon && (
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-warm mr-1.5 align-middle animate-pulse-soft" />
          )}
          {formatRelativeDate(subscription.next_charge_date)}
        </div>
      </div>

      <div className="text-right shrink-0">
        <div className="font-semibold text-ink tabular-nums">
          {formatEuroSmart(subscription.price)}
        </div>
      </div>
    </motion.button>
  )
}
