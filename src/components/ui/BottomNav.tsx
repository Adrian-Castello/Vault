import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Repeat, Wallet, Plus } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

interface BottomNavProps {
  onAddSubscription: () => void
  onAddFinancing: () => void
}

const items = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/suscripciones', label: 'Suscripciones', icon: Repeat, end: false },
  { to: '/financiaciones', label: 'Financiaciones', icon: Wallet, end: false },
]

export function BottomNav({ onAddSubscription, onAddFinancing }: BottomNavProps) {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  // Cerrar el menú al cambiar de ruta
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  // Cerrar si se pulsa fuera
  useEffect(() => {
    if (!menuOpen) return
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const path = location.pathname
  const isOnSubs = path.startsWith('/suscripciones')
  const isOnFins = path.startsWith('/financiaciones')

  const handleAddClick = () => {
    if (isOnSubs) return onAddSubscription()
    if (isOnFins) return onAddFinancing()
    setMenuOpen((o) => !o)
  }

  // Render: orden = Dashboard, Plus, Suscripciones, Financiaciones (4 columnas)
  // pero queremos el + centrado entre los 3 items. Reordenamos:
  // [Dashboard] [Suscripciones] [+] [Financiaciones]
  // Así el + queda visualmente centrado entre subs y fins.
  // Cambio: dejamos 4 columnas y el orden es:
  // dashboard | subs | + | fins
  return (
    <nav
      ref={menuRef}
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-subtle bg-card/90 backdrop-blur-lg safe-bottom"
    >
      {/* Menú emergente desde el + */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 card p-1.5 min-w-[220px] shadow-xl"
          >
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                onAddSubscription()
              }}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-[var(--border)]/40 transition-colors text-ink"
            >
              <span className="h-7 w-7 rounded-lg bg-mint/15 flex items-center justify-center text-[var(--mint)]">
                <Repeat className="h-3.5 w-3.5" />
              </span>
              <span>Nueva suscripción</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                onAddFinancing()
              }}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-[var(--border)]/40 transition-colors text-ink"
            >
              <span className="h-7 w-7 rounded-lg bg-violet/15 flex items-center justify-center text-[var(--violet)]">
                <Wallet className="h-3.5 w-3.5" />
              </span>
              <span>Nueva financiación</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <ul className="grid grid-cols-4 max-w-md mx-auto">
        {/* Dashboard */}
        <li>
          <NavTab to={items[0].to} label={items[0].label} icon={items[0].icon} end={items[0].end} />
        </li>

        {/* Suscripciones */}
        <li>
          <NavTab to={items[1].to} label={items[1].label} icon={items[1].icon} end={items[1].end} />
        </li>

        {/* Botón + central */}
        <li className="flex justify-center items-center">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleAddClick}
            aria-label="Añadir"
            aria-expanded={menuOpen}
            className="h-12 w-12 -mt-5 rounded-full bg-[var(--ink)] text-[var(--bg)] shadow-lg flex items-center justify-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
          >
            <motion.span
              animate={{ rotate: menuOpen ? 45 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex"
            >
              <Plus className="h-5 w-5" strokeWidth={2.5} />
            </motion.span>
          </motion.button>
        </li>

        {/* Financiaciones */}
        <li>
          <NavTab to={items[2].to} label={items[2].label} icon={items[2].icon} end={items[2].end} />
        </li>
      </ul>
    </nav>
  )
}

function NavTab({
  to, label, icon: Icon, end,
}: {
  to: string
  label: string
  icon: typeof LayoutDashboard
  end: boolean
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center gap-1 py-2.5 text-[10.5px] font-medium transition-colors ${
          isActive ? 'text-ink' : 'text-muted hover:text-ink'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`relative flex h-7 w-12 items-center justify-center rounded-full transition-colors ${
              isActive ? 'bg-[var(--ink)]/8 dark:bg-white/8' : ''
            }`}
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.4 : 2} />
          </span>
          <span className="tracking-tight">{label}</span>
        </>
      )}
    </NavLink>
  )
}
