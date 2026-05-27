import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useToast } from '../../hooks/useToast'

export function Toaster() {
  const { toasts, dismiss } = useToast()
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-[calc(100%-2rem)] md:w-auto pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon =
            t.kind === 'success' ? CheckCircle2 : t.kind === 'error' ? AlertTriangle : Info
          const accent =
            t.kind === 'success'
              ? 'text-mint'
              : t.kind === 'error'
                ? 'text-alert'
                : 'text-violet-light'
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto card flex items-start gap-3 p-3.5 pr-2 shadow-lg"
            >
              <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${accent}`} />
              <p className="text-sm text-ink flex-1 leading-snug">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                className="p-1 text-muted hover:text-ink rounded-md transition-colors"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
