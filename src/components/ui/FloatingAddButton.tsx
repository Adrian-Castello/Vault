import { useState } from 'react'
import { Plus, Repeat, Wallet, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

interface FloatingAddButtonProps {
  context: 'subscription' | 'financing' | 'dashboard' | 'settings'
  onAddSubscription: () => void
  onAddFinancing: () => void
}

export function FloatingAddButton({
  context,
  onAddSubscription,
  onAddFinancing,
}: FloatingAddButtonProps) {
  const [open, setOpen] = useState(false)

  // En la página de ajustes el botón no tiene sentido
  if (context === 'settings') return null

  const handleClick = () => {
    if (context === 'subscription') return onAddSubscription()
    if (context === 'financing') return onAddFinancing()
    setOpen((o) => !o)
  }

  return (
    <div className="hidden md:block fixed right-5 z-40 bottom-8">
      <AnimatePresence>
        {open && context === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="absolute bottom-16 right-0 card p-1.5 min-w-[200px] shadow-xl"
          >
            <button
              onClick={() => {
                setOpen(false)
                onAddSubscription()
              }}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-[var(--border)]/40 transition-colors"
            >
              <span className="h-7 w-7 rounded-lg bg-mint/15 flex items-center justify-center">
                <Repeat className="h-3.5 w-3.5 text-mint" />
              </span>
              <span>Nueva suscripción</span>
            </button>
            <button
              onClick={() => {
                setOpen(false)
                onAddFinancing()
              }}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-[var(--border)]/40 transition-colors"
            >
              <span className="h-7 w-7 rounded-lg bg-violet/15 flex items-center justify-center">
                <Wallet className="h-3.5 w-3.5 text-violet-light" />
              </span>
              <span>Nueva financiación</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={handleClick}
        aria-label="Añadir"
        className="h-14 w-14 rounded-full bg-[var(--ink)] text-[var(--bg)] shadow-xl flex items-center justify-center transition-all hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
      >
        <motion.span
          animate={{ rotate: open && context === 'dashboard' ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex"
        >
          {open && context === 'dashboard' ? (
            <X className="h-5 w-5" />
          ) : (
            <Plus className="h-5 w-5" strokeWidth={2.5} />
          )}
        </motion.span>
      </motion.button>
    </div>
  )
}
