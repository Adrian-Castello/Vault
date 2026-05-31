import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Repeat, Wallet, Plus, Settings } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

interface BottomNavProps {
  onAddSubscription: () => void
  onAddFinancing: () => void
}

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/suscripciones', label: 'Suscripciones', icon: Repeat, end: false },
  { to: '/financiaciones', label: 'Financiaciones', icon: Wallet, end: false },
  { to: '/ajustes', label: 'Ajustes', icon: Settings, end: false },
]

export function BottomNav({ onAddSubscription, onAddFinancing }: BottomNavProps) {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

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
  const isOnSettings = path.startsWith('/ajustes')

  const handleAddClick = () => {
    if (isOnSubs) return onAddSubscription()
    if (isOnFins) return onAddFinancing()
    if (isOnSettings) return // no añade nada en Ajustes
    setMenuOpen((o) => !o)
  }

  // Si estoy en Ajustes el botón "+" queda algo huérfano. Lo dejamos pero
  // sin acción (un poco atenuado para no confundir).
  const plusDisabled = isOnSettings

  return (
    <nav
      ref={menuRef}
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-subtle bg-card/90 backdrop-blur-xl safe-bottom"
    >
      {/* Menú emergente (solo en Dashboard) */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 card p-1.5 min-w-[230px] shadow-2xl"
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

      <ul className="grid grid-cols-5 max-w-md mx-auto">
        {/* Dashboard */}
        <li>
          <NavTab to={navItems[0].to} label={navItems[0].label} icon={navItems[0].icon} end={navItems[0].end} />
        </li>

        {/* Suscripciones */}
        <li>
          <NavTab to={navItems[1].to} label={navItems[1].label} icon={navItems[1].icon} end={navItems[1].end} />
        </li>

        {/* Botón + central */}
        <li className="flex justify-center items-center">
          <div className="relative">
            {/* Halo difuminado detrás */}
            <div
              className={`absolute inset-0 rounded-full blur-md pointer-events-none transition-opacity ${
                plusDisabled ? 'opacity-15' : 'opacity-50'
              }`}
              style={{ background: 'linear-gradient(135deg, var(--mint), var(--violet))' }}
              aria-hidden
            />
            <motion.button
              whileTap={plusDisabled ? undefined : { scale: 0.88 }}
              onClick={handleAddClick}
              aria-label="Añadir"
              aria-expanded={menuOpen}
              disabled={plusDisabled}
              className={`relative rounded-full text-white shadow-lg flex items-center justify-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)] ${
                plusDisabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              style={{
                background: 'linear-gradient(135deg, var(--mint), var(--violet))',
                height: '2.5rem',
                width: '2.5rem',
              }}
            >
              <motion.span
                animate={{ rotate: menuOpen ? 135 : 0 }}
                transition={{ duration: 0.22 }}
                className="flex"
              >
                <Plus className="h-5 w-5" strokeWidth={2.6} />
              </motion.span>
            </motion.button>
          </div>
        </li>

        {/* Financiaciones */}
        <li>
          <NavTab to={navItems[2].to} label={navItems[2].label} icon={navItems[2].icon} end={navItems[2].end} />
        </li>

        {/* Ajustes (ahora NavLink, no botón) */}
        <li>
          <NavTab to={navItems[3].to} label={navItems[3].label} icon={navItems[3].icon} end={navItems[3].end} />
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
