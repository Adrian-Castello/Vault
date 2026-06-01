import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Repeat, Wallet, Settings } from 'lucide-react'

const items = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/suscripciones', label: 'Suscripciones', icon: Repeat, end: false },
  { to: '/financiaciones', label: 'Financiaciones', icon: Wallet, end: false },
  { to: '/ajustes', label: 'Ajustes', icon: Settings, end: false },
]

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-subtle bg-card/60 backdrop-blur-xl px-4 py-6 sticky top-0 h-screen">
      {/* Logo: icono cuadrado + nombre al lado */}
      <div className="flex items-center gap-2.5 px-2 mb-8">
        <img
          src={`${import.meta.env.BASE_URL}icon-192.png`}
          alt=""
          className="h-9 w-9 rounded-xl object-cover shadow-md"
        />
        <span className="text-lg font-bold tracking-tight text-ink">Vault</span>
      </div>

      {/* Navegación */}
      <nav className="flex flex-col gap-1">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-mint/10 text-mint'
                  : 'text-muted hover:bg-[var(--border)]/40 hover:text-ink'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
