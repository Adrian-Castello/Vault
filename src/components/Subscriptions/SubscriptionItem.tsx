import { motion } from 'framer-motion'
import { Pause, Ban } from 'lucide-react'
import type { Subscription } from '../../lib/types'
import { formatEuroSmart } from '../../lib/calculations'
import { formatRelativeDate, daysBetween, parseISODate, startOfToday } from '../../lib/dates'
import { findCategory, useCategories } from '../../lib/categories'

interface Props {
  subscription: Subscription
  onClick: () => void
  index?: number
}

const cycleLabel: Record<Subscription['billing_cycle'], string> = {
  monthly: 'Mensual',
  quarterly: 'Trimestral',
  semiannual: 'Semestral',
  yearly: 'Anual',
}

export function SubscriptionItem({ subscription, onClick, index = 0 }: Props) {
  const target = parseISODate(subscription.next_charge_date)
  const today = startOfToday()
  const diff = daysBetween(today, target)
  const { categories } = useCategories()
  const category = findCategory(categories, subscription.category)

  const status = subscription.status || 'active'
  const isActive = status === 'active'
  const isTrial = status === 'trial'
  const isPaused = status === 'paused'
  const isCancelled = status === 'cancelled'
  const isSoon = isActive && diff >= 0 && diff < 3

  // Aspectos por estado
  const opacityClass = isCancelled || isPaused ? 'opacity-60' : ''
  const grayClass = isCancelled ? 'grayscale' : ''

  return (
    <motion.button
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.03 }}
      onClick={onClick}
      className={`w-full card card-hoverable p-4 flex items-center gap-3.5 text-left group ${opacityClass} ${grayClass}`}
    >
      <span className="h-12 w-12 rounded-xl bg-[var(--bg)] dark:bg-[var(--card)] border border-subtle flex items-center justify-center text-2xl shrink-0">
        {subscription.emoji || '✨'}
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="font-medium text-ink truncate">{subscription.name}</span>

          {/* Badge de estado (todos menos active) */}
          {isTrial && (
            <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-warm/12 text-warm border border-warm/30 flex items-center gap-1">
              Prueba
            </span>
          )}
          {isPaused && (
            <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-muted/15 text-muted border border-muted/30 flex items-center gap-1">
              <Pause className="h-2.5 w-2.5" /> Pausada
            </span>
          )}
          {isCancelled && (
            <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-muted/15 text-muted border border-muted/30 flex items-center gap-1">
              <Ban className="h-2.5 w-2.5" /> Cancelada
            </span>
          )}

          {/* Badge ciclo (solo si no es cancelada) */}
          {!isCancelled && (
            <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-mint/12 text-mint border border-mint/25">
              {cycleLabel[subscription.billing_cycle]}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Chip de categoría */}
          {category.id !== 'general' && (
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10.5px] font-medium"
              style={{ background: `${category.color}18`, color: category.color }}
            >
              <span className="text-[11px] leading-none">{category.emoji}</span>
              {category.label}
            </span>
          )}

          {/* Fecha próxima / estado info */}
          {isActive && (
            <span
              className={`tabular-nums ${isSoon ? 'text-warm font-medium' : 'text-muted'}`}
            >
              {isSoon && (
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-warm mr-1.5 align-middle animate-pulse-soft" />
              )}
              {formatRelativeDate(subscription.next_charge_date)}
            </span>
          )}
          {isTrial && subscription.trial_end_date && (
            <span className="text-warm tabular-nums">
              Fin prueba {formatRelativeDate(subscription.trial_end_date)}
            </span>
          )}
          {isPaused && (
            <span className="text-muted">No cuenta para los totales</span>
          )}
          {isCancelled && subscription.cancelled_at && (
            <span className="text-muted tabular-nums">
              Cancelada el {new Date(subscription.cancelled_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>
      </div>

      <div className="text-right shrink-0">
        <div className={`font-semibold tabular-nums ${isCancelled ? 'text-muted line-through' : 'text-ink'}`}>
          {formatEuroSmart(subscription.price)}
        </div>
      </div>
    </motion.button>
  )
}
