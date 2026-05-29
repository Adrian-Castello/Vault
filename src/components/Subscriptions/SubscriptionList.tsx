import { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Subscription } from '../../lib/types'
import { Skeleton } from '../ui/Skeleton'
import { EmptyState } from '../ui/EmptyState'
import { SubscriptionItem } from './SubscriptionItem'

interface Props {
  items: Subscription[]
  loading: boolean
  onItemClick: (s: Subscription) => void
  onCreate: () => void
}

export function SubscriptionList({ items, loading, onItemClick, onCreate }: Props) {
  const [showCancelled, setShowCancelled] = useState(false)

  const { active, cancelled } = useMemo(() => {
    const active = items
      .filter((s) => s.status !== 'cancelled')
      .sort((a, b) => {
        // Activos primero (por fecha), prueba/pausados después
        const order = (s: Subscription) =>
          s.status === 'active' ? 0 : s.status === 'trial' ? 1 : 2
        const diff = order(a) - order(b)
        if (diff !== 0) return diff
        return a.next_charge_date.localeCompare(b.next_charge_date)
      })
    const cancelled = items
      .filter((s) => s.status === 'cancelled')
      .sort((a, b) => {
        // Más recientemente canceladas primero
        const ca = a.cancelled_at ?? ''
        const cb = b.cancelled_at ?? ''
        return cb.localeCompare(ca)
      })
    return { active, cancelled }
  }, [items])

  if (loading) {
    return (
      <div className="space-y-2.5">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-[88px]" />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon="🔁"
        title="Sin suscripciones"
        description="Lleva la cuenta de todo lo que se cobra cada mes, trimestre o año."
        actionLabel="Crear primera suscripción"
        onAction={onCreate}
      />
    )
  }

  return (
    <div className="space-y-2.5">
      {/* Activas + Prueba + Pausadas */}
      {active.length > 0 ? (
        <ul className="space-y-2.5">
          {active.map((s, i) => (
            <li key={s.id}>
              <SubscriptionItem
                subscription={s}
                index={i}
                onClick={() => onItemClick(s)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="card p-8 text-center">
          <p className="text-sm text-muted mb-3">Sin suscripciones activas.</p>
          <button
            onClick={onCreate}
            className="text-sm font-medium text-ink hover:opacity-70 transition-opacity underline underline-offset-4 decoration-[var(--border)]"
          >
            Crear una suscripción
          </button>
        </div>
      )}

      {/* Sección canceladas plegable */}
      {cancelled.length > 0 && (
        <div className="pt-4">
          <button
            type="button"
            onClick={() => setShowCancelled((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm text-muted hover:text-ink hover:bg-[var(--border)]/30 transition-colors"
            aria-expanded={showCancelled}
          >
            <span className="font-medium tracking-tight">
              Canceladas ({cancelled.length})
            </span>
            <motion.span
              animate={{ rotate: showCancelled ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex"
            >
              <ChevronDown className="h-4 w-4" />
            </motion.span>
          </button>

          <AnimatePresence initial={false}>
            {showCancelled && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <ul className="space-y-2.5 mt-2.5">
                  {cancelled.map((s, i) => (
                    <li key={s.id}>
                      <SubscriptionItem
                        subscription={s}
                        index={i}
                        onClick={() => onItemClick(s)}
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
