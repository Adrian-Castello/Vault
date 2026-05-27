import type { Subscription } from '../../lib/types'
import { Skeleton } from '../ui/Skeleton'
import { SubscriptionItem } from './SubscriptionItem'

interface Props {
  items: Subscription[]
  loading: boolean
  onItemClick: (s: Subscription) => void
  onCreate: () => void
}

export function SubscriptionList({ items, loading, onItemClick, onCreate }: Props) {
  if (loading) {
    return (
      <div className="space-y-2.5">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-[76px]" />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="card p-10 text-center">
        <div className="text-4xl mb-3">🔁</div>
        <h3 className="font-semibold text-ink mb-1">Sin suscripciones</h3>
        <p className="text-sm text-muted mb-5 max-w-xs mx-auto">
          Lleva la cuenta de todo lo que se cobra cada mes, trimestre o año.
        </p>
        <button
          onClick={onCreate}
          className="text-sm font-medium text-ink hover:opacity-70 transition-opacity underline underline-offset-4 decoration-[var(--border)]"
        >
          Añade tu primera suscripción
        </button>
      </div>
    )
  }

  return (
    <ul className="space-y-2.5">
      {items.map((s, i) => (
        <li key={s.id}>
          <SubscriptionItem
            subscription={s}
            index={i}
            onClick={() => onItemClick(s)}
          />
        </li>
      ))}
    </ul>
  )
}
