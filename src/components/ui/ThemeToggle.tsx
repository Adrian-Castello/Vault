import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { motion, AnimatePresence } from 'framer-motion'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Cambiar tema"
      className="h-10 w-10 rounded-xl border border-subtle bg-card flex items-center justify-center transition-all duration-200 hover:border-[var(--ink)]/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)]/20 overflow-hidden"
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === 'dark' ? (
          <motion.span
            key="moon"
            initial={{ y: 12, opacity: 0, rotate: -30 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -12, opacity: 0, rotate: 30 }}
            transition={{ duration: 0.2 }}
            className="flex"
          >
            <Moon className="h-4 w-4 text-ink" />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ y: 12, opacity: 0, rotate: -30 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -12, opacity: 0, rotate: 30 }}
            transition={{ duration: 0.2 }}
            className="flex"
          >
            <Sun className="h-4 w-4 text-ink" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}
