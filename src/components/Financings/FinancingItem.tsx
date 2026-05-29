import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import type { Financing } from '../../lib/types'
import { formatEuroSmart } from '../../lib/calculations'
import {
  daysBetween,
  formatFullDate,
  formatRelativeDate,
  parseISODate,
  startOfToday,
} from '../../lib/dates'
import { findCategory, useCategories } from '../../lib/categories'

interface Props {
  financing: Financing
  onClick: () => void
  index?: number
}

export function FinancingItem({ financing, onClick, index = 0 }: Props) {
  const remaining = financing.total_installments - financing.paid_installments
  const isFinished = remaining <= 0
  const isLast = remaining === 1
  const progress = financing.total_installments
    ? Math.min(100, (financing.paid_installments / financing.total_installments) * 100)
    : 0

  const target = parseISODate(financing.next_charge_date)
  const today = startOfToday()
  const diff = daysBetween(today, target)
  const isSoon = !isFinished && diff >= 0 && diff < 3

  const { categories } = useCategories()
  const category = findCategory(categories, financing.category)

  const opacityClass = isFinished ? 'opacity-70' : ''

  return (
    <motion.button
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.03 }}
      onClick={onClick}
      className={`w-full card card-hoverable p-4 text-left ${opacityClass}`}
    >
      <div className="flex items-start gap-3.5">
        <span className="h-12 w-12 rounded-xl bg-[var(--bg)] dark:bg-[var(--card)] border border-subtle flex items-center justify-center text-2xl shrink-0">
          {financing.emoji || '💳'}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="font-medium text-ink truncate">{financing.name}</span>
            {isLast && !isFinished && (
              <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-violet/15 text-violet-light border border-violet/30 inline-flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5" /> Última cuota
              </span>
            )}
            {isFinished && (
              <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-mint/15 text-mint border border-mint/25">
                Completada 🎉
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
            <span
              className={`tabular-nums ${
                isSoon ? 'text-warm font-medium' : 'text-muted'
              }`}
            >
              {isFinished ? (
                <>Finalizó el {formatFullDate(financing.end_date)}</>
              ) : (
                <>
                  {isSoon && (
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-warm mr-1.5 align-middle animate-pulse-soft" />
                  )}
                  Próximo: {formatRelativeDate(financing.next_charge_date)}
                </>
              )}
            </span>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className={`font-semibold tabular-nums ${isFinished ? 'text-muted' : 'text-ink'}`}>
            {formatEuroSmart(financing.monthly_payment)}
          </div>
          <div className="text-[11px] text-muted mt-0.5">/ mes</div>
        </div>
      </div>

      <div className="mt-3.5 ml-[60px]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-muted tabular-nums">
            {financing.paid_installments} de {financing.total_installments} cuotas
          </span>
          <span className="text-[11px] text-muted tabular-nums">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-[var(--border)]/60 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={`h-full rounded-full ${
              isFinished
                ? 'bg-gradient-to-r from-mint to-mint-light'
                : 'bg-gradient-to-r from-violet to-violet-light'
            }`}
          />
        </div>
      </div>
    </motion.button>
  )
}
