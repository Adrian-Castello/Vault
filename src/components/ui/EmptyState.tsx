import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { Button } from './Button'
import { Plus } from 'lucide-react'

interface Props {
  icon: ReactNode
  title: string
  description: string
  actionLabel: string
  onAction: () => void
  /** Color del halo gradient detrás del icono. Por defecto mint→violet. */
  accentFrom?: string
  accentTo?: string
}

/**
 * Estado vacío con icono grande y halo difuminado.
 * Reutilizable para suscripciones, financiaciones y similares.
 */
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  accentFrom = 'var(--mint)',
  accentTo = 'var(--violet)',
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="card p-10 text-center relative overflow-hidden"
    >
      {/* Halo de fondo */}
      <div
        className="absolute -top-12 left-1/2 -translate-x-1/2 h-32 w-32 rounded-full blur-3xl opacity-25 pointer-events-none"
        style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}
        aria-hidden
      />

      {/* Contenido */}
      <div className="relative">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-[var(--bg)] border border-subtle mb-4 text-3xl">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-ink mb-1.5 tracking-tight">{title}</h3>
        <p className="text-sm text-muted mb-6 max-w-xs mx-auto leading-relaxed">
          {description}
        </p>
        <Button
          onClick={onAction}
          variant="primary"
          icon={<Plus className="h-4 w-4" />}
        >
          {actionLabel}
        </Button>
      </div>
    </motion.div>
  )
}
