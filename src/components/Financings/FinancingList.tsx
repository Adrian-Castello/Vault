import type { Financing } from '../../lib/types'
import { Skeleton } from '../ui/Skeleton'
import { FinancingItem } from './FinancingItem'

interface Props {
  items: Financing[]
  loading: boolean
  onItemClick: (f: Financing) => void
  onCreate: () => void
}

export function FinancingList({ items, loading, onItemClick, onCreate }: Props) {
  if (loading) {
    return (
      <div className="space-y-2.5">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-[112px]" />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="card p-10 text-center">
        <div className="text-4xl mb-3">💳</div>
        <h3 className="font-semibold text-ink mb-1">Sin financiaciones</h3>
        <p className="text-sm text-muted mb-5 max-w-xs mx-auto">
          Lleva la cuenta de tus pagos a plazos y mira tu deuda total de un vistazo.
        </p>
        <button
          onClick={onCreate}
          className="text-sm font-medium text-ink hover:opacity-70 transition-opacity underline underline-offset-4 decoration-[var(--border)]"
        >
          Añade tu primera financiación
        </button>
      </div>
    )
  }

  return (
    <ul className="space-y-2.5">
      {items.map((f, i) => (
        <li key={f.id}>
          <FinancingItem financing={f} index={i} onClick={() => onItemClick(f)} />
        </li>
      ))}
    </ul>
  )
}
