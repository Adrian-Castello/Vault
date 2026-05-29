import { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Financing } from '../../lib/types'
import { Skeleton } from '../ui/Skeleton'
import { EmptyState } from '../ui/EmptyState'
import { FinancingItem } from './FinancingItem'

interface Props {
  items: Financing[]
  loading: boolean
  onItemClick: (f: Financing) => void
  onCreate: () => void
}

export function FinancingList({ items, loading, onItemClick, onCreate }: Props) {
  const [showCompleted, setShowCompleted] = useState(false)

  const { active, completed } = useMemo(() => {
    const isCompleted = (f: Financing) => f.paid_installments >= f.total_installments
    const active = items
      .filter((f) => !isCompleted(f))
      .sort((a, b) => a.next_charge_date.localeCompare(b.next_charge_date))
    const completed = items
      .filter(isCompleted)
      .sort((a, b) => b.end_date.localeCompare(a.end_date)) // las más recientes primero
    return { active, completed }
  }, [items])

  if (loading) {
    return (
      <div className="space-y-2.5">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-[120px]" />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon="💳"
        title="Sin financiaciones"
        description="Lleva la cuenta de tus pagos a plazos y mira tu deuda total de un vistazo."
        actionLabel="Crear primera financiación"
        onAction={onCreate}
      />
    )
  }

  return (
    <div className="space-y-2.5">
      {active.length > 0 ? (
        <ul className="space-y-2.5">
          {active.map((f, i) => (
            <li key={f.id}>
              <FinancingItem financing={f} index={i} onClick={() => onItemClick(f)} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="card p-8 text-center">
          <p className="text-sm text-muted mb-3">Sin financiaciones activas.</p>
          <button
            onClick={onCreate}
            className="text-sm font-medium text-ink hover:opacity-70 transition-opacity underline underline-offset-4 decoration-[var(--border)]"
          >
            Crear una financiación
          </button>
        </div>
      )}

      {/* Sección completadas plegable */}
      {completed.length > 0 && (
        <div className="pt-4">
          <button
            type="button"
            onClick={() => setShowCompleted((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm text-muted hover:text-ink hover:bg-[var(--border)]/30 transition-colors"
            aria-expanded={showCompleted}
          >
            <span className="font-medium tracking-tight">
              Completadas ({completed.length})
            </span>
            <motion.span
              animate={{ rotate: showCompleted ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex"
            >
              <ChevronDown className="h-4 w-4" />
            </motion.span>
          </button>

          <AnimatePresence initial={false}>
            {showCompleted && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <ul className="space-y-2.5 mt-2.5">
                  {completed.map((f, i) => (
                    <li key={f.id}>
                      <FinancingItem
                        financing={f}
                        index={i}
                        onClick={() => onItemClick(f)}
                      />
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
